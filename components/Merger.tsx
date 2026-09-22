"use client";

import { useState } from "react";
import { Dropzone } from "./Dropzone";
import { mergePdfs } from "@/lib/pdf/build";
import { loadPdf, PdfLoadError, stripPdfExtension } from "@/lib/pdf/load";
import { moveItem } from "@/lib/segments";
import { sanitizeFileName } from "@/lib/naming/sanitize";
import { saveBlob } from "@/lib/zip";
import { bucketPageCount, trackEvent } from "@/lib/analytics";

type Entry = { id: string; name: string; pageCount: number; bytes: Uint8Array };

export function Merger() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const add = async (files: File[]) => {
    setError(null);
    const added: Entry[] = [];
    for (const file of files) {
      try {
        const doc = await loadPdf(file);
        added.push({
          id: `${file.name}-${crypto.randomUUID()}`,
          name: stripPdfExtension(file.name),
          pageCount: doc.pageCount,
          bytes: doc.bytes,
        });
        doc.proxy.destroy();
      } catch (err) {
        setError(
          err instanceof PdfLoadError ? `${file.name}: ${err.message}` : `${file.name} could not be read.`,
        );
      }
    }
    if (added.length) {
      setEntries((prev) => [...prev, ...added]);
      trackEvent("pdf_selected", {
        pages: bucketPageCount(added.reduce((sum, e) => sum + e.pageCount, 0)),
        tool: "merge",
      });
    }
  };

  const merge = async () => {
    if (entries.length < 2) return;
    setBusy(true);
    trackEvent("split_created", { tool: "merge", documents: entries.length });
    try {
      const bytes = await mergePdfs(entries);
      saveBlob(
        new Blob([new Uint8Array(bytes)], { type: "application/pdf" }),
        `${sanitizeFileName(entries[0].name, "merged")}_merged.pdf`,
      );
      trackEvent("download_zip", { tool: "merge", documents: entries.length });
    } catch {
      setError("Could not merge these files.");
    } finally {
      setBusy(false);
    }
  };

  const totalPages = entries.reduce((sum, entry) => sum + entry.pageCount, 0);

  return (
    <div className="space-y-4">
      <Dropzone
        onFiles={add}
        multiple
        label="Drop PDFs here"
        hint="add as many as you like — they merge in the order below"
      />
      {error && <p className="text-sm text-warn">{error}</p>}

      {entries.length > 0 && (
        <>
          <ul className="divide-y divide-line rounded-xl border border-line bg-surface">
            {entries.map((entry, index) => (
              <li key={entry.id} className="flex items-center gap-3 px-4 py-2 text-sm">
                <span className="w-6 text-ink-soft">{index + 1}</span>
                <span className="min-w-0 flex-1 truncate">{entry.name}.pdf</span>
                <span className="shrink-0 text-ink-soft">{entry.pageCount} pages</span>
                <button
                  type="button"
                  aria-label="Move up"
                  disabled={index === 0}
                  onClick={() => setEntries((prev) => moveItem(prev, index, index - 1))}
                  className="rounded border border-line px-2 py-1 disabled:opacity-40"
                >
                  ↑
                </button>
                <button
                  type="button"
                  aria-label="Move down"
                  disabled={index === entries.length - 1}
                  onClick={() => setEntries((prev) => moveItem(prev, index, index + 1))}
                  className="rounded border border-line px-2 py-1 disabled:opacity-40"
                >
                  ↓
                </button>
                <button
                  type="button"
                  aria-label="Remove"
                  onClick={() => setEntries((prev) => prev.filter((e) => e.id !== entry.id))}
                  className="rounded border border-line px-2 py-1"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={merge}
              disabled={busy || entries.length < 2}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-ink disabled:opacity-60"
            >
              {busy ? "Merging…" : `Merge ${entries.length} files`}
            </button>
            <span className="text-sm text-ink-soft">{totalPages} pages in total</span>
          </div>
        </>
      )}
    </div>
  );
}
