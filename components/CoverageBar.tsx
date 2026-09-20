import { formatPageRanges, type Coverage } from "@/lib/segments";

/**
 * The safety net: says out loud whether every source page made it into the
 * output. No other PDF splitter tells you this, and it is the one thing that
 * makes the result trustworthy for invoices and statements.
 */
export function CoverageBar({ coverage }: { coverage: Coverage }) {
  const { sourcePageCount, accounted, missing, duplicated, complete } = coverage;

  return (
    <div
      className={`rounded-lg border px-4 py-3 text-sm ${
        complete
          ? "border-line bg-surface text-ink"
          : "border-warn/40 bg-warn-soft text-warn"
      }`}
    >
      <p className="font-medium">
        {complete ? "✓ " : "⚠ "}
        {accounted} / {sourcePageCount} pages accounted for
      </p>
      {missing.length > 0 && (
        <p className="mt-1">Deleted: pages {formatPageRanges(missing)}</p>
      )}
      {duplicated.length > 0 && (
        <p className="mt-1">Appears more than once: pages {formatPageRanges(duplicated)}</p>
      )}
    </div>
  );
}
