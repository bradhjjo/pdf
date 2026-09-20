export const dynamic = "force-static";

import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.vercel.app";

const ROUTES = [
  "",
  "/split-pdf",
  "/merge-pdf",
  "/extract-pages",
  "/delete-pages",
  "/reorder-pdf",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => ({
    url: `${BASE}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));
}
