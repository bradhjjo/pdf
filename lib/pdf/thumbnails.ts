import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";

type Task = {
  pageNumber: number;
  resolve: (url: string) => void;
  reject: (err: unknown) => void;
};

const DEFAULT_CONCURRENCY = 3;
const DEFAULT_MAX_CACHED = 60;
const DEFAULT_MAX_WIDTH = 160;

/**
 * Renders page thumbnails on demand.
 *
 * A 200-page document cannot be rendered in one pass without freezing the tab,
 * so callers request only what is on screen. Rendering is capped at a few
 * concurrent pages and finished thumbnails are held in a small LRU cache —
 * evicted object URLs are revoked so the bitmaps are actually freed.
 */
export class ThumbnailRenderer {
  private cache = new Map<number, string>();
  private inFlight = new Map<number, Promise<string>>();
  private queue: Task[] = [];
  private running = 0;
  private activeRenders = new Set<RenderTask>();
  private destroyed = false;

  constructor(
    private proxy: PDFDocumentProxy,
    private options: {
      concurrency?: number;
      maxCached?: number;
      maxWidth?: number;
    } = {},
  ) {}

  private get concurrency() {
    return this.options.concurrency ?? DEFAULT_CONCURRENCY;
  }
  private get maxCached() {
    return this.options.maxCached ?? DEFAULT_MAX_CACHED;
  }
  private get maxWidth() {
    return this.options.maxWidth ?? DEFAULT_MAX_WIDTH;
  }

  /** Cached thumbnail URL, if this page has already been rendered. */
  peek(pageNumber: number): string | undefined {
    const url = this.cache.get(pageNumber);
    if (url) this.touch(pageNumber, url);
    return url;
  }

  request(pageNumber: number): Promise<string> {
    const cached = this.peek(pageNumber);
    if (cached) return Promise.resolve(cached);

    const existing = this.inFlight.get(pageNumber);
    if (existing) return existing;

    const promise = new Promise<string>((resolve, reject) => {
      this.queue.push({ pageNumber, resolve, reject });
    });
    this.inFlight.set(pageNumber, promise);
    // Nothing else observes this promise when the caller drops it.
    promise.catch(() => {});
    this.pump();
    return promise;
  }

  /** Drops a queued request for a page that scrolled out of view. */
  cancel(pageNumber: number) {
    const index = this.queue.findIndex((t) => t.pageNumber === pageNumber);
    if (index === -1) return;
    const [task] = this.queue.splice(index, 1);
    this.inFlight.delete(pageNumber);
    task.reject(new DOMException("Cancelled", "AbortError"));
  }

  destroy() {
    this.destroyed = true;
    for (const task of this.queue) {
      task.reject(new DOMException("Cancelled", "AbortError"));
    }
    this.queue = [];
    this.inFlight.clear();
    for (const render of this.activeRenders) render.cancel();
    this.activeRenders.clear();
    for (const url of this.cache.values()) URL.revokeObjectURL(url);
    this.cache.clear();
  }

  private pump() {
    while (!this.destroyed && this.running < this.concurrency && this.queue.length) {
      // Last in, first out: the most recent request is the one on screen now.
      const task = this.queue.pop()!;
      this.running += 1;
      this.render(task.pageNumber)
        .then((url) => {
          this.store(task.pageNumber, url);
          task.resolve(url);
        })
        .catch(task.reject)
        .finally(() => {
          this.running -= 1;
          this.inFlight.delete(task.pageNumber);
          this.pump();
        });
    }
  }

  private async render(pageNumber: number): Promise<string> {
    const page = await this.proxy.getPage(pageNumber);
    try {
      const base = page.getViewport({ scale: 1 });
      const scale = Math.min(this.maxWidth / base.width, 1);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.floor(viewport.width));
      canvas.height = Math.max(1, Math.floor(viewport.height));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas is unavailable in this browser.");

      const task = page.render({ canvasContext: context, viewport });
      this.activeRenders.add(task);
      try {
        await task.promise;
      } finally {
        this.activeRenders.delete(task);
      }

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/webp", 0.75),
      );
      // Free the backing bitmap before the next page starts rendering.
      canvas.width = 0;
      canvas.height = 0;
      if (!blob) throw new Error("Could not render this page.");
      return URL.createObjectURL(blob);
    } finally {
      page.cleanup();
    }
  }

  private store(pageNumber: number, url: string) {
    if (this.destroyed) {
      URL.revokeObjectURL(url);
      return;
    }
    this.cache.set(pageNumber, url);
    while (this.cache.size > this.maxCached) {
      const oldest = this.cache.keys().next();
      if (oldest.done) break;
      const stale = this.cache.get(oldest.value)!;
      this.cache.delete(oldest.value);
      URL.revokeObjectURL(stale);
    }
  }

  /** Map insertion order is the LRU order; re-inserting marks a page as recent. */
  private touch(pageNumber: number, url: string) {
    this.cache.delete(pageNumber);
    this.cache.set(pageNumber, url);
  }
}
