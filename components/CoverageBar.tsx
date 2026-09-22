import { formatPageRanges, type Coverage } from "@/lib/segments";

/**
 * Quiet when everything adds up, loud when it does not. The point is that
 * nobody has to count pages by hand after downloading.
 */
export function CoverageBar({ coverage }: { coverage: Coverage }) {
  const { sourcePageCount, accounted, missing, duplicated, complete } = coverage;

  if (complete) {
    return (
      <p className="flex items-center gap-2 text-sm text-ok">
        <span aria-hidden>✓</span>
        All {sourcePageCount} pages are accounted for
      </p>
    );
  }

  return (
    <div className="rounded-lg border border-warn/40 bg-warn-soft px-4 py-3 text-sm text-warn">
      <p className="font-medium">
        {accounted} of {sourcePageCount} pages will be in the output
      </p>
      {missing.length > 0 && (
        <p className="mt-1">Removed: {formatPageRanges(missing)}</p>
      )}
      {duplicated.length > 0 && (
        <p className="mt-1">Appears twice: {formatPageRanges(duplicated)}</p>
      )}
    </div>
  );
}
