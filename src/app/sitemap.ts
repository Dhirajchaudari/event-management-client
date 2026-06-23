import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://events.orbitalops.net";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/graphql";

interface SitemapEntry {
  slug: string;
  updatedAt: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1
    },
    {
      url: `${SITE_URL}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5
    }
  ];

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `query { publicEventSitemap { slug updatedAt } }`
      }),
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      return staticRoutes;
    }

    const json = (await response.json()) as {
      data?: { publicEventSitemap?: SitemapEntry[] };
    };

    const events = json.data?.publicEventSitemap ?? [];

    return [
      ...staticRoutes,
      ...events.map((event) => ({
        url: `${SITE_URL}/events/${event.slug}`,
        lastModified: new Date(event.updatedAt),
        changeFrequency: "weekly" as const,
        priority: 0.8
      }))
    ];
  } catch {
    return staticRoutes;
  }
}
