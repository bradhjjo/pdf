"use client";

import { useEffect, useRef, useState } from "react";
import type { ThumbnailRenderer } from "@/lib/pdf/thumbnails";
import type { PageRef } from "@/lib/segments";

/**
 * One page tile. The thumbnail is only rendered once the tile scrolls into
 * view, which is what keeps a 200-page document responsive.
 */
export function PageCard({
  page,
  position,
  renderer,
  cutAfter,
  onToggleCut,
  onDelete,
  onRotate,
  onDropPage,
  isLast,
}: {
  page: PageRef;
  position: number;
  renderer: ThumbnailRenderer;
  cutAfter: boolean;
  isLast: boolean;
  onToggleCut: () => void;
  onDelete: () => void;
  onRotate: () => void;
  onDropPage: (from: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [url, setUrl] = useState<string | undefined>(() =>
    renderer.peek(page.sourceIndex + 1),
  );
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || url) return;

    const pageNumber = page.sourceIndex + 1;
    let cancelled = false;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            renderer
              .request(pageNumber)
              .then((next) => {
                if (!cancelled) setUrl(next);
              })
              .catch(() => {});
          } else {
            renderer.cancel(pageNumber);
          }
        }
      },
      { rootMargin: "400px 0px" },
    );

    observer.observe(node);
    return () => {
      cancelled = true;
      observer.disconnect();
      renderer.cancel(pageNumber);
    };
  }, [page.sourceIndex, renderer, url]);

  return (
    <div className="flex items-stretch gap-1">
      <div
        ref={ref}
        draggable
        onDragStart={(e) => e.dataTransfer.setData("text/plain", String(position))}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const from = Number(e.dataTransfer.getData("text/plain"));
          if (Number.isInteger(from)) onDropPage(from);
        }}
        className={`group relative w-[160px] shrink-0 rounded-lg border bg-surface p-2 ${
          dragOver ? "border-accent" : "border-line"
        }`}
      >
        <div className="flex h-[200px] items-center justify-center overflow-hidden rounded bg-canvas">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt={`Page ${page.sourceIndex + 1}`}
              style={{ transform: `rotate(${page.rotation}deg)` }}
              className="max-h-full max-w-full object-contain transition-transform"
            />
          ) : (
            <span className="text-xs text-ink-soft">…</span>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between text-xs text-ink-soft">
          <span>Page {page.sourceIndex + 1}</span>
          <span className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            <button
              type="button"
              onClick={onRotate}
              title="Rotate 90°"
              className="rounded px-1 hover:bg-canvas"
            >
              ⟳
            </button>
            <button
              type="button"
              onClick={onDelete}
              title="Delete page"
              className="rounded px-1 hover:bg-canvas"
            >
              ✕
            </button>
          </span>
        </div>
      </div>

      {/* Splitting after the final page would produce nothing, so no marker there. */}
      {!isLast && (
      <button
        type="button"
        onClick={onToggleCut}
        title={cutAfter ? "Remove split" : "Split after this page"}
        aria-pressed={cutAfter}
        className={`w-4 shrink-0 rounded-full transition-colors ${
          cutAfter ? "bg-accent" : "bg-transparent hover:bg-line"
        }`}
      >
        <span className="sr-only">
          {cutAfter ? "Remove split after" : "Split after"} page {page.sourceIndex + 1}
        </span>
      </button>
      )}
    </div>
  );
}
