import type { MetadataRoute } from "next";
import { CITIES } from "@/data/cities";
import { PROPERTY_TYPES } from "@/data/taxonomy";
import { db, hasDb } from "@/lib/db";

/**
 * Sitemap dynamique.
 * - Pages fixes (/, /recherche, /pro, /connexion, /inscription)
 * - Une page par (ville × transaction × type) — 12 × 2 × 9 = 216 entrées
 * - Une page par annonce publiée
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://baboo.ma").replace(/\/+$/, "");
  const now = new Date();

  const fixed: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, priority: 1, changeFrequency: "daily" },
    { url: `${base}/recherche`, lastModified: now, priority: 0.9, changeFrequency: "daily" },
    { url: `${base}/pro`, lastModified: now, priority: 0.7, changeFrequency: "monthly" },
    { url: `${base}/connexion`, lastModified: now, priority: 0.3 },
    { url: `${base}/inscription`, lastModified: now, priority: 0.3 },
  ];

  const combos: MetadataRoute.Sitemap = [];
  for (const city of CITIES) {
    for (const transaction of ["sale", "rent"] as const) {
      combos.push({
        url: `${base}/recherche?city=${city.slug}${transaction === "rent" ? "&t=rent" : ""}`,
        lastModified: now,
        priority: 0.6,
        changeFrequency: "daily",
      });
      for (const type of PROPERTY_TYPES) {
        combos.push({
          url: `${base}/recherche?city=${city.slug}${transaction === "rent" ? "&t=rent" : ""}&type=${type}`,
          lastModified: now,
          priority: 0.5,
          changeFrequency: "weekly",
        });
      }
    }
  }

  let listings: MetadataRoute.Sitemap = [];
  if (hasDb()) {
    try {
      const rows = await db.listing.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true, updatedAt: true },
      });
      listings = rows.map((l) => ({
        url: `${base}/annonce/${l.slug}`,
        lastModified: l.updatedAt,
        priority: 0.8,
        changeFrequency: "weekly" as const,
      }));
    } catch {
      // DB indispo au build — on garde les URLs fixes.
    }
  }

  return [...fixed, ...combos, ...listings];
}
