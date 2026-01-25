// app/robots.ts
import { MetadataRoute } from "next";

// Base URL - should be configured in site.json or environment
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://kevintrinh.dev";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/", // Protect API routes
          "/_next/", // Next.js internals
          "/private/", // Any private pages
        ],
      },
      // Block problematic bots that ignore robots.txt anyway
      {
        userAgent: ["GPTBot", "ChatGPT-User", "CCBot", "anthropic-ai"],
        disallow: ["/"], // Block AI crawlers (optional - remove if you want AI indexing)
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
