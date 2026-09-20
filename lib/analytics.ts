import { track } from "@vercel/analytics";

/**
 * The five events the V0 funnel is measured on. Nothing else is tracked, and
 * nothing derived from file contents ever leaves the browser: page counts are
 * bucketed and file names are never sent.
 */
export type FunnelEvent =
  | "pdf_selected"
  | "split_created"
  | "download_zip"
  | "auto_detect_clicked"
  | "pro_clicked";

type Props = Record<string, string | number | boolean>;

export function trackEvent(event: FunnelEvent, props: Props = {}) {
  try {
    track(event, props);
  } catch {
    // Analytics must never break the tool.
  }
}

/** Page counts go out as ranges so a document is not identifiable by size. */
export function bucketPageCount(count: number): string {
  if (count <= 5) return "1-5";
  if (count <= 20) return "6-20";
  if (count <= 50) return "21-50";
  if (count <= 200) return "51-200";
  return "200+";
}
