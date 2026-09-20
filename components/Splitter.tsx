"use client";

import { useMemo, useState } from "react";
import { Dropzone } from "./Dropzone";
import { PageCard } from "./PageCard";
import { CoverageBar } from "./CoverageBar";
import { ResultList } from "./ResultList";
import { selectCoverage, selectSegments, useSplitStore } from "@/lib/store";

export function Splitter({ children }: { children?: React.ReactNode }) {
  const state = useSplitStore();
  const [every, setEvery] = useState(1);
  const segments = useMemo(() => selectSegments(state), [state]);
  const coverage = selectCoverage(state);

  if (!state.doc) {
    return (
      <div className="space-y-4">
        <Dropzone onFiles={(files) => state.open(files[0])} />
        {state.status === "loading" && <p className="text-sm text-ink-soft">Reading PDF…</p>}
        {state.error && <p className="text-sm text-warn">{state.error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-medium">{state.doc.baseName}.pdf</p>
          <p className="text-sm text-ink-soft">
            {state.doc.pageCount} pages · {segments.length}{" "}
            {segments.length === 1 ? "document" : "documents"} after splitting
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <label className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2">
            Split every
            <input
              type="number"
              min={1}
              value={every}
              onChange={(e) => setEvery(Math.max(1, Number(e.target.value) || 1))}
              className="w-14 rounded border border-line bg-canvas px-2 py-1"
            />
            pages
            <button
              type="button"
              onClick={() => state.splitEvery(every)}
              className="rounded bg-accent px-2 py-1 text-xs font-medium text-white"
            >
              Apply
            </button>
          </label>
          <button
            type="button"
            onClick={state.clearCuts}
            className="rounded-lg border border-line bg-surface px-3 py-2"
          >
            Clear splits
          </button>
          <button
            type="button"
            onClick={state.reset}
            className="rounded-lg border border-line bg-surface px-3 py-2"
          >
            Start over
          </button>
        </div>
      </div>

      {coverage && <CoverageBar coverage={coverage} />}

      <p className="text-sm text-ink-soft">
        Click the bar between two pages to split there. Drag a page to reorder it.
      </p>

      <div className="flex flex-wrap gap-y-4">
        {state.pages.map((page, index) => (
          <PageCard
            key={page.id}
            page={page}
            position={index}
            renderer={state.renderer!}
            cutAfter={state.cuts.has(page.id)}
            onToggleCut={() => state.toggleCut(page.id)}
            onDelete={() => state.deletePage(page.id)}
            onRotate={() => state.rotatePage(page.id)}
            onDropPage={(from) => state.movePage(from, index)}
            isLast={index === state.pages.length - 1}
          />
        ))}
      </div>

      <div className="sticky bottom-4 flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface p-3 shadow-sm">
        <button
          type="button"
          onClick={state.build}
          disabled={state.status === "building" || !state.pages.length}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {state.status === "building"
            ? `Building ${state.progress?.done ?? 0}/${state.progress?.total ?? 0}…`
            : `Split into ${segments.length} ${segments.length === 1 ? "file" : "files"}`}
        </button>
        {coverage && !coverage.complete && (
          <span className="text-sm text-warn">
            Some pages will not be in the output — check the warning above.
          </span>
        )}
      </div>

      {state.results && (
        <ResultList files={state.results} zipName={`${state.doc.baseName}_split`} />
      )}

      {state.results && children}
    </div>
  );
}
