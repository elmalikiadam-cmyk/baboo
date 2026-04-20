import type { MetadataRoute } from "next";
import { CITIES } from "@/data/cities";
import { PROPERTY_TYPES } from "@/data/taxonomy";
import { db, hasDb } from "@/lib/db";

const BASE = "https://baboo.ma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/recherche?t=sale`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/recherche?t=rent`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/pro`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
  ];

  for (const city of CITIES) {
    entries.push({
      url: `${BASE}/recherche?t=sale&city=${city.slug}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.85,
    });
    for (const t of PROPERTY_TYPES) {
      entries.push({
        url: `${BASE}/recherche?t=sale&city=${city.slug}&type=${t}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  if (!hasDb()) return entries;

  try {
    const listings = await db.listing.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
      take: 50_000,
    });
    for (const l of listings) {
      entries.push({
        url: `${BASE}/annonce/${l.slug}`,
        lastModified: l.updatedAt,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  } catch {
    // DB may not be reachable during build; skip listing entries in that case.
  }

  return entries;
}
