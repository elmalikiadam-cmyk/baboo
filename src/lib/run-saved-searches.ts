// Moteur de matching saved searches. Appelé par les crons
// /api/webhooks/qstash/saved-searches-{instant,daily,weekly}.
//
// Stratégie : pour chaque SavedSearch de la fréquence demandée,
// on rejoue la recherche via findListings(), filtrée sur les annonces
// créées/publiées APRÈS le dernier lastRunAt. Si match > 0, on
// envoie un email Resend + crée une Notification in-app, puis on met
// à jour lastRunAt et matchesCount.

import { db, hasDb } from "@/lib/db";
import { findListings } from "@/lib/listings-query";
import {
  parseSearchParams,
  buildSearchHref,
} from "@/lib/search-params";
import { sendEmail, absoluteUrl } from "@/lib/resend";
import { savedSearchMatchesEmail } from "@/lib/email-templates";
import { createNotification } from "@/lib/notifications";
import { formatPrice, formatPricePerMonth } from "@/lib/format";

type Frequency = "instant" | "daily" | "weekly";

export type RunStats = {
  total: number;
  withMatches: number;
  emailsSent: number;
  errors: number;
};

/**
 * Parse la query stockée en JSON string vers URLSearchParams-like.
 * La `query` est sauvegardée comme résultat de `URLSearchParams.toString()`
 * par le client, donc on peut la reparser directement.
 */
function parseQuery(query: string): Record<string, string | string[] | undefined> {
  const sp = new URLSearchParams(query);
  const out: Record<string, string | string[] | undefined> = {};
  for (const [k, v] of sp.entries()) {
    const existing = out[k];
    if (existing === undefined) {
      out[k] = v;
    } else if (Array.isArray(existing)) {
      existing.push(v);
    } else {
      out[k] = [existing, v];
    }
  }
  return out;
}

export async function runSavedSearches(
  frequency: Frequency,
): Promise<RunStats> {
  const stats: RunStats = {
    total: 0,
    withMatches: 0,
    emailsSent: 0,
    errors: 0,
  };
  if (!hasDb()) return stats;

  const searches = await db.savedSearch.findMany({
    where: { frequency, paused: false },
    include: {
      user: { select: { id: true, email: true, name: true } },
    },
    orderBy: { lastRunAt: "asc" },
    take: 500, // batching simple, le cron rejouera
  });
  stats.total = searches.length;

  for (const s of searches) {
    try {
      const searchParams = parseQuery(s.query);
      const filters = parseSearchParams(searchParams);
      // Fenêtre d'intérêt = annonces publiées depuis le dernier run.
      // Si lastRunAt absent, on prend les 48h dernières par défaut
      // pour éviter de spammer sur la première exécution.
      const cutoff = s.lastRunAt ?? new Date(Date.now() - 48 * 3600 * 1000);

      const { items } = await findListings({
        ...filters,
        page: 1,
      });

      const newItems = items.filter(
        (it) =>
          (it.publishedAt ?? it.createdAt ?? new Date(0)) > cutoff,
      );

      if (newItems.length === 0) {
        await db.savedSearch.update({
          where: { id: s.id },
          data: { lastRunAt: new Date() },
        });
        continue;
      }

      stats.withMatches += 1;

      // Email Resend
      const searchHref = absoluteUrl(buildSearchHref(filters));
      const unsubscribeHref = absoluteUrl(`/compte/alertes?pause=${s.id}`);
      const tpl = savedSearchMatchesEmail({
        userName: s.user.name ?? s.user.email.split("@")[0],
        searchName: s.name,
        matches: newItems.slice(0, 5).map((it) => ({
          title: it.title,
          city: it.city?.name ?? "",
          price:
            it.transaction === "RENT"
              ? formatPricePerMonth(it.price)
              : formatPrice(it.price),
          url: absoluteUrl(`/annonce/${it.slug}`),
          image: it.coverImage,
        })),
        searchUrl: searchHref,
        unsubscribeUrl: unsubscribeHref,
      });
      const emailRes = await sendEmail({
        to: s.user.email,
        subject: tpl.subject,
        html: tpl.html,
      });
      if (emailRes.sent) stats.emailsSent += 1;

      // Notification in-app (best-effort)
      await createNotification({
        userId: s.user.id,
        type: "SAVED_SEARCH_MATCH",
        title: `${newItems.length} nouvelle${newItems.length > 1 ? "s" : ""} annonce${newItems.length > 1 ? "s" : ""} — ${s.name}`,
        body: `Votre alerte « ${s.name} » a trouvé ${newItems.length} nouveau(x) bien(s).`,
        linkUrl: searchHref,
        entityType: "SavedSearch",
        entityId: s.id,
      });

      await db.savedSearch.update({
        where: { id: s.id },
        data: {
          lastRunAt: new Date(),
          matchesCount: { increment: newItems.length },
        },
      });
    } catch (err) {
      stats.errors += 1;
      console.warn(
        `[saved-searches] failed for ${s.id}: ${(err as Error).message}`,
      );
    }
  }

  return stats;
}
