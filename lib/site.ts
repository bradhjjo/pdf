/**
 * Canonical origin for page metadata, sitemap and robots.
 *
 * On Vercel this resolves itself: VERCEL_PROJECT_PRODUCTION_URL is set at
 * build time, so a fresh import is correct with no configuration. Set
 * NEXT_PUBLIC_SITE_URL to override it once there is a custom domain.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "").replace(/\/$/, "")}`;

  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();
