import { describe, expect, it } from "vitest";
import {
  buildSegments,
  computeCoverage,
  createPages,
  formatPageRanges,
  moveItem,
} from "../lib/segments";

describe("buildSegments", () => {
  it("returns one segment when there are no cuts", () => {
    const pages = createPages(5);
    expect(buildSegments(pages, new Set())).toHaveLength(1);
  });

  it("cuts after the marked page", () => {
    const pages = createPages(5);
    const segments = buildSegments(pages, new Set(["p1"]));
    expect(segments.map((s) => s.pages.length)).toEqual([2, 3]);
  });

  it("ignores a cut on a page that was deleted", () => {
    const pages = createPages(4).filter((p) => p.id !== "p1");
    const segments = buildSegments(pages, new Set(["p1"]));
    expect(segments).toHaveLength(1);
  });

  it("follows the page after reordering", () => {
    const pages = moveItem(createPages(4), 3, 0);
    const segments = buildSegments(pages, new Set(["p3"]));
    expect(segments.map((s) => s.pages.map((p) => p.sourceIndex))).toEqual([
      [3],
      [0, 1, 2],
    ]);
  });
});

describe("computeCoverage", () => {
  it("is complete when every page appears once", () => {
    const coverage = computeCoverage(createPages(10), 10);
    expect(coverage.complete).toBe(true);
    expect(coverage.accounted).toBe(10);
  });

  it("reports deleted pages by their original number", () => {
    const pages = createPages(5).filter((p) => p.id !== "p2");
    const coverage = computeCoverage(pages, 5);
    expect(coverage.complete).toBe(false);
    expect(coverage.missing).toEqual([3]);
  });

  it("reports a page that appears twice", () => {
    const pages = createPages(3);
    const coverage = computeCoverage([...pages, pages[0]], 3);
    expect(coverage.duplicated).toEqual([1]);
    expect(coverage.complete).toBe(false);
  });
});

describe("formatPageRanges", () => {
  it("collapses runs", () => {
    expect(formatPageRanges([1, 2, 3, 7, 9, 10])).toBe("1–3, 7, 9–10");
  });

  it("handles an empty list", () => {
    expect(formatPageRanges([])).toBe("");
  });
});
