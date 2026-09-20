/**
 * Canonical origin for metadata, sitemap and robots. Set NEXT_PUBLIC_SITE_URL
 * once the deployment has a real URL; the fallback only keeps builds working.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
