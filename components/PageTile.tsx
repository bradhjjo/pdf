"use client";

import { useEffect, useRef, useState } from "react";
import type { ThumbnailRenderer } from "@/lib/pdf/thumbnails";
import type { PageRef } from "@/lib/segments";

/**
 * One page. Clicking it is the product's main gesture: it marks the page as
 * the start of a new document, which is how people describe a stack of scanned
 * invoices out loud. The thumbnail renders only once the tile is near the
 * viewport, which is what keeps a 200-page file responsive.
 */
export function PageTile({
  page,
  position,
  renderer,
  startsDocument,
  isFirstPage,
  onToggleStart,
  onDelete,
  onRotate,
  onDropPage,
}: {
  page: PageRef;
  position: number;
  renderer: ThumbnailRenderer;
  startsDocument: boolean;
  isFirstPage: boolean;
  onToggleStart: () => void;
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
      { rootMargin: "500px 0px" },
    );

    observer.observe(node);
    return () => {
      cancelled = true;
      observer.disconnect();
      renderer.cancel(pageNumber);
    };
  }, [page.sourceIndex, renderer, url]);

  const label = isFirstPage
    ? `Page ${page.sourceIndex + 1}, first page of the file`
    : startsDocument
      ? `Page ${page.sourceIndex + 1}, starts a new document. Click to join it to the document before it.`
      : `Page ${page.sourceIndex + 1}. Click to start a new document here.`;

  return (
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
      className={`group relative rounded-lg border bg-surface p-1.5 transition-colors ${
        dragOver ? "border-accent" : "border-line"
      }`}
    >
      <button
        type="button"
        onClick={onToggleStart}
        disabled={isFirstPage}
        aria-pressed={startsDocument}
        title={isFirstPage ? undefined : "Start a new document at this page"}
        className="block w-full cursor-pointer disabled:cursor-default"
      >
        <span className="sr-only">{label}</span>
        <span className="flex aspect-[3/4] items-center justify-center overflow-hidden rounded bg-canvas">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt=""
              style={{ transform: `rotate(${page.rotation}deg)` }}
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <span className="text-xs text-ink-soft">…</span>
          )}
        </span>
        <span className="mt-1 block text-center text-[11px] text-ink-soft">
          {page.sourceIndex + 1}
        </span>
      </button>

      <div className="tile-tools absolute right-1 top-1 flex gap-0.5">
        <IconButton label={`Rotate page ${page.sourceIndex + 1}`} onClick={onRotate}>
          ⟳
        </IconButton>
        <IconButton label={`Remove page ${page.sourceIndex + 1}`} onClick={onDelete}>
          ✕
        </IconButton>
      </div>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="grid h-5 w-5 place-items-center rounded bg-surface text-[10px] leading-none text-ink-soft shadow-sm ring-1 ring-line hover:text-ink"
    >
      {children}
    </button>
  );
}
