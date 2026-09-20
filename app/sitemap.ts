export const dynamic = "force-static";

import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

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
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));
}
