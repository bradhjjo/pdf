"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Dropzone } from "./Dropzone";
import { PageTile } from "./PageTile";
import { DocumentGroup } from "./DocumentGroup";
import { CoverageBar } from "./CoverageBar";
import { ResultList } from "./ResultList";
import { selectCoverage, selectSegments, useSplitStore } from "@/lib/store";

export function Splitter({ children }: { children?: React.ReactNode }) {
  const state = useSplitStore();
  const segments = useMemo(() => selectSegments(state), [state]);
  const coverage = selectCoverage(state);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Clicking Split used to leave people staring at the grid while the output
  // appeared a screen below, looking like nothing had happened.
  useEffect(() => {
    if (state.results) {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [state.results]);

  if (!state.doc) {
    return (
      <div className="space-y-4">
        <Dropzone onFiles={(files) => state.open(files[0])} />
        {state.status === "loading" && (
          <p className="text-sm text-ink-soft">Opening your PDF…</p>
        )}
        {state.error && (
          <p className="rounded-lg border border-warn/40 bg-warn-soft px-4 py-3 text-sm text-warn">
            {state.error}
          </p>
        )}
      </div>
    );
  }

  const fileCount = segments.length;
  const pageIndex = new Map(state.pages.map((page, index) => [page.id, index]));

  return (
    <div className={`space-y-5 ${state.results ? "pb-4" : "pb-24"}`}>
      <Toolbar />

      {coverage && <CoverageBar coverage={coverage} />}

      <p className="text-sm text-ink-soft">
        Click a page to start a new document there. Drag a page to move it.
      </p>

      <div className="space-y-3">
        {segments.map((segment) => (
          <DocumentGroup
            key={segment.pages[0]?.id ?? segment.index}
            segment={segment}
            total={fileCount}
            onJoinPrevious={
              segment.index > 0
                ? () => state.toggleStart(segment.pages[0].id)
                : undefined
            }
          >
            {segment.pages.map((page) => {
              const index = pageIndex.get(page.id)!;
              return (
                <PageTile
                  key={page.id}
                  page={page}
                  position={index}
                  renderer={state.renderer!}
                  startsDocument={state.starts.has(page.id)}
                  isFirstPage={index === 0}
                  onToggleStart={() => state.toggleStart(page.id)}
                  onDelete={() => state.deletePage(page.id)}
                  onRotate={() => state.rotatePage(page.id)}
                  onDropPage={(from) => state.movePage(from, index)}
                />
              );
            })}
          </DocumentGroup>
        ))}
      </div>

      {/* Once the files exist, the download in the results panel is the one
          primary action; a second bar competing with it only adds noise. */}
      {!state.results && <ActionBar />}

      <div ref={resultsRef} className="scroll-mt-4 space-y-5">
        {state.results && (
          <ResultList files={state.results} zipName={`${state.doc.baseName}_split`} />
        )}
        {state.results && children}
      </div>
    </div>
  );
}

function Toolbar() {
  const state = useSplitStore();
  const [every, setEvery] = useState(2);
  const segments = useMemo(() => selectSegments(state), [state]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3">
      <div className="min-w-0">
        <p className="truncate font-medium">{state.doc?.baseName}.pdf</p>
        <p className="text-sm text-ink-soft">
          {state.pages.length} pages · {segments.length}{" "}
          {segments.length === 1 ? "document" : "documents"}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <div className="flex items-center gap-1.5 rounded-lg border border-line px-2 py-1.5">
          <label htmlFor="every" className="text-ink-soft">
            Every
          </label>
          <input
            id="every"
            type="number"
            min={1}
            value={every}
            onChange={(e) => setEvery(Math.max(1, Number(e.target.value) || 1))}
            className="w-12 rounded border border-line bg-canvas px-1.5 py-0.5 text-center"
          />
          <span className="text-ink-soft">pages</span>
          <button
            type="button"
            onClick={() => state.splitEvery(every)}
            className="rounded bg-accent px-2 py-0.5 text-xs font-medium text-accent-ink"
          >
            Split
          </button>
        </div>
        <button
          type="button"
          onClick={state.clearStarts}
          className="rounded-lg border border-line px-3 py-1.5 hover:bg-canvas"
        >
          Reset splits
        </button>
        <button
          type="button"
          onClick={state.reset}
          className="rounded-lg border border-line px-3 py-1.5 hover:bg-canvas"
        >
          New file
        </button>
      </div>
    </div>
  );
}

/**
 * Fixed rather than sticky-in-flow: the old sticky bar sat on top of the last
 * row of pages and hid their numbers.
 */
function ActionBar() {
  const state = useSplitStore();
  const segments = useMemo(() => selectSegments(state), [state]);
  const coverage = selectCoverage(state);
  const building = state.status === "building";
  const count = segments.length;

  return (
    <div className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
        <button
          type="button"
          onClick={state.build}
          disabled={building || !state.pages.length}
          className="rounded-lg bg-accent px-5 py-2.5 font-medium text-accent-ink disabled:opacity-60"
        >
          {building
            ? `Preparing ${state.progress?.done ?? 0} of ${state.progress?.total ?? 0}…`
            : count === 1
              ? "Create 1 PDF"
              : `Create ${count} PDFs`}
        </button>
        {coverage && !coverage.complete ? (
          <span className="text-sm text-warn">
            {coverage.missing.length > 0 &&
              `${coverage.missing.length} ${coverage.missing.length === 1 ? "page" : "pages"} removed`}
          </span>
        ) : (
          <span className="hidden text-sm text-ink-soft sm:inline">
            Nothing leaves your device.
          </span>
        )}
      </div>
    </div>
  );
}
