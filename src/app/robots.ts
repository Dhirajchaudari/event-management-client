import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://events.orbitalops.net";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/events/", "/login"],
      disallow: ["/events?*", "/my-events"]
    },
    sitemap: `${SITE_URL}/sitemap.xml`
  };
}
