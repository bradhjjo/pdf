export type PageRef = {
  /** Stable identity for drag and drop; survives reordering. */
  id: string;
  /** 0-based index into the source document. */
  sourceIndex: number;
  /** Extra rotation applied on top of the page's own, in degrees. */
  rotation: number;
};

export type Segment = {
  pages: PageRef[];
  /** Position of this segment in the output, 0-based. */
  index: number;
};

export type Coverage = {
  sourcePageCount: number;
  /** Distinct source pages that appear at least once in the output. */
  accounted: number;
  /** Source page numbers (1-based) that were deleted. */
  missing: number[];
  /** Source page numbers (1-based) that appear more than once. */
  duplicated: number[];
  complete: boolean;
};

export function createPages(sourcePageCount: number): PageRef[] {
  return Array.from({ length: sourcePageCount }, (_, i) => ({
    id: `p${i}`,
    sourceIndex: i,
    rotation: 0,
  }));
}

/**
 * Splits the ordered page list at every cut. `cuts` holds the id of the page
 * each cut follows, so cuts survive reordering and deletion of other pages.
 */
export function buildSegments(pages: PageRef[], cuts: ReadonlySet<string>): Segment[] {
  const segments: Segment[] = [];
  let current: PageRef[] = [];

  for (const page of pages) {
    current.push(page);
    if (cuts.has(page.id)) {
      segments.push({ pages: current, index: segments.length });
      current = [];
    }
  }
  if (current.length) segments.push({ pages: current, index: segments.length });
  return segments;
}

/**
 * The safety net: every source page must end up in exactly one output page,
 * and the UI says so before the user downloads anything.
 */
export function computeCoverage(pages: PageRef[], sourcePageCount: number): Coverage {
  const counts = new Map<number, number>();
  for (const page of pages) {
    counts.set(page.sourceIndex, (counts.get(page.sourceIndex) ?? 0) + 1);
  }

  const missing: number[] = [];
  const duplicated: number[] = [];
  for (let i = 0; i < sourcePageCount; i += 1) {
    const count = counts.get(i) ?? 0;
    if (count === 0) missing.push(i + 1);
    else if (count > 1) duplicated.push(i + 1);
  }

  return {
    sourcePageCount,
    accounted: counts.size,
    missing,
    duplicated,
    complete: missing.length === 0 && duplicated.length === 0,
  };
}

/** Collapses [1,2,3,7,9,10] into "1–3, 7, 9–10" for the results list. */
export function formatPageRanges(pageNumbers: number[]): string {
  if (!pageNumbers.length) return "";
  const sorted = [...pageNumbers].sort((a, b) => a - b);
  const parts: string[] = [];
  let start = sorted[0];
  let prev = sorted[0];

  for (const value of sorted.slice(1)) {
    if (value === prev + 1) {
      prev = value;
      continue;
    }
    parts.push(start === prev ? `${start}` : `${start}–${prev}`);
    start = value;
    prev = value;
  }
  parts.push(start === prev ? `${start}` : `${start}–${prev}`);
  return parts.join(", ");
}

export function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || from >= items.length) return items;
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(Math.max(0, Math.min(to, next.length)), 0, moved);
  return next;
}
