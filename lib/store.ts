"use client";

import { create } from "zustand";
import { loadPdf, PdfLoadError, type LoadedPdf } from "./pdf/load";
import { ThumbnailRenderer } from "./pdf/thumbnails";
import { extractPageText } from "./pdf/text";
import { buildSegmentPdfs, type BuiltFile } from "./pdf/build";
import { suggestName } from "./naming/heuristics";
import { dedupeFileNames, sanitizeFileName } from "./naming/sanitize";
import {
  buildSegments,
  computeCoverage,
  createPages,
  moveItem,
  type Coverage,
  type PageRef,
  type Segment,
} from "./segments";
import { bucketPageCount, trackEvent } from "./analytics";

type Status = "idle" | "loading" | "ready" | "building" | "done";

type SplitState = {
  status: Status;
  error: string | null;
  doc: LoadedPdf | null;
  renderer: ThumbnailRenderer | null;
  pages: PageRef[];
  cuts: Set<string>;
  results: BuiltFile[] | null;
  progress: { done: number; total: number } | null;

  open: (file: File) => Promise<void>;
  reset: () => void;
  toggleCut: (pageId: string) => void;
  clearCuts: () => void;
  splitEvery: (size: number) => void;
  deletePage: (pageId: string) => void;
  rotatePage: (pageId: string) => void;
  movePage: (from: number, to: number) => void;
  build: () => Promise<void>;
};

export const useSplitStore = create<SplitState>((set, get) => ({
  status: "idle",
  error: null,
  doc: null,
  renderer: null,
  pages: [],
  cuts: new Set(),
  results: null,
  progress: null,

  async open(file) {
    get().renderer?.destroy();
    set({ status: "loading", error: null, results: null, doc: null, renderer: null });
    try {
      const doc = await loadPdf(file);
      set({
        status: "ready",
        doc,
        renderer: new ThumbnailRenderer(doc.proxy),
        pages: createPages(doc.pageCount),
        cuts: new Set(),
      });
      trackEvent("pdf_selected", { pages: bucketPageCount(doc.pageCount) });
    } catch (err) {
      const message =
        err instanceof PdfLoadError
          ? err.message
          : "Something went wrong reading this PDF.";
      set({ status: "idle", error: message });
    }
  },

  reset() {
    get().renderer?.destroy();
    set({
      status: "idle",
      error: null,
      doc: null,
      renderer: null,
      pages: [],
      cuts: new Set(),
      results: null,
      progress: null,
    });
  },

  toggleCut(pageId) {
    const cuts = new Set(get().cuts);
    if (cuts.has(pageId)) cuts.delete(pageId);
    else cuts.add(pageId);
    set({ cuts, results: null, status: "ready" });
  },

  clearCuts() {
    set({ cuts: new Set(), results: null, status: "ready" });
  },

  splitEvery(size) {
    const { pages } = get();
    if (size < 1) return;
    const cuts = new Set<string>();
    pages.forEach((page, index) => {
      if ((index + 1) % size === 0 && index !== pages.length - 1) cuts.add(page.id);
    });
    set({ cuts, results: null, status: "ready" });
  },

  deletePage(pageId) {
    const cuts = new Set(get().cuts);
    cuts.delete(pageId);
    set({
      pages: get().pages.filter((page) => page.id !== pageId),
      cuts,
      results: null,
      status: "ready",
    });
  },

  rotatePage(pageId) {
    set({
      pages: get().pages.map((page) =>
        page.id === pageId ? { ...page, rotation: (page.rotation + 90) % 360 } : page,
      ),
      results: null,
      status: "ready",
    });
  },

  movePage(from, to) {
    set({ pages: moveItem(get().pages, from, to), results: null, status: "ready" });
  },

  async build() {
    const { doc, pages, cuts } = get();
    if (!doc || !pages.length) return;

    const segments = buildSegments(pages, cuts);
    set({ status: "building", progress: { done: 0, total: segments.length } });
    trackEvent("split_created", {
      pages: bucketPageCount(doc.pageCount),
      documents: segments.length,
    });

    try {
      const names = await nameSegments(doc, segments);
      const results = await buildSegmentPdfs(doc.bytes, segments, names, (done, total) =>
        set({ progress: { done, total } }),
      );
      set({ status: "done", results, progress: null });
    } catch {
      set({
        status: "ready",
        progress: null,
        error: "Could not build the output files. Try fewer pages at a time.",
      });
    }
  },
}));

/** First page of each segment decides that segment's file name. */
async function nameSegments(doc: LoadedPdf, segments: Segment[]): Promise<string[]> {
  const base = sanitizeFileName(doc.baseName, "document");
  const names: string[] = [];

  for (const segment of segments) {
    const first = segment.pages[0];
    const fallback = segments.length === 1 ? base : `${base}_${segment.index + 1}`;
    if (!first) {
      names.push(fallback);
      continue;
    }
    const text = await extractPageText(doc.proxy, first.sourceIndex + 1);
    names.push(text ? suggestName(text, fallback).name : fallback);
  }

  return dedupeFileNames(names);
}

export function selectSegments(state: SplitState): Segment[] {
  return buildSegments(state.pages, state.cuts);
}

export function selectCoverage(state: SplitState): Coverage | null {
  if (!state.doc) return null;
  return computeCoverage(state.pages, state.doc.pageCount);
}
