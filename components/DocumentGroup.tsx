"use client";

import { formatPageRanges, type Segment } from "@/lib/segments";

/**
 * One output file, drawn as a container around the pages that will go into it.
 * Making the grouping visible before anything is downloaded is the whole point:
 * the user checks the split by looking at it, not by opening the ZIP.
 */
export function DocumentGroup({
  segment,
  total,
  onJoinPrevious,
  children,
}: {
  segment: Segment;
  total: number;
  onJoinPrevious?: () => void;
  children: React.ReactNode;
}) {
  const pageNumbers = segment.pages.map((page) => page.sourceIndex + 1);

  return (
    <section className="rounded-xl border border-line bg-surface/60 p-3">
      <header className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 className="text-sm font-medium">
          Document {segment.index + 1}
          <span className="text-ink-soft"> of {total}</span>
        </h3>
        <div className="flex items-center gap-3 text-xs text-ink-soft">
          <span>
            {segment.pages.length} {segment.pages.length === 1 ? "page" : "pages"} ·{" "}
            {formatPageRanges(pageNumbers)}
          </span>
          {onJoinPrevious && (
            <button
              type="button"
              onClick={onJoinPrevious}
              className="rounded px-1.5 py-0.5 text-accent hover:bg-accent-soft"
            >
              Join to previous
            </button>
          )}
        </div>
      </header>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(84px,1fr))] gap-2">
        {children}
      </div>
    </section>
  );
}
