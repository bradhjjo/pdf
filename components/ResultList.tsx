"use client";

import { useEffect, useState } from "react";
import type { BuiltFile } from "@/lib/pdf/build";
import { formatPageRanges } from "@/lib/segments";
import { dedupeFileNames, sanitizeFileName } from "@/lib/naming/sanitize";
import { saveBlob, zipFiles } from "@/lib/zip";
import { trackEvent } from "@/lib/analytics";

export function ResultList({
  files,
  zipName,
}: {
  files: BuiltFile[];
  zipName: string;
}) {
  const [names, setNames] = useState<string[]>([]);
  const [zipping, setZipping] = useState(false);

  useEffect(() => {
    setNames(files.map((file) => file.name.replace(/\.pdf$/i, "")));
  }, [files]);

  const finalNames = dedupeFileNames(
    names.map((name, i) => sanitizeFileName(name, `document_${i + 1}`)),
  );

  const download = async () => {
    setZipping(true);
    try {
      const named = files.map((file, i) => ({ ...file, name: `${finalNames[i]}.pdf` }));
      if (named.length === 1) {
        saveBlob(new Blob([new Uint8Array(named[0].bytes)], { type: "application/pdf" }), named[0].name);
      } else {
        saveBlob(await zipFiles(named), `${sanitizeFileName(zipName, "pdf-split")}.zip`);
      }
      trackEvent("download_zip", { documents: named.length });
    } finally {
      setZipping(false);
    }
  };

  return (
    <section className="rounded-xl border border-line bg-surface">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
        <h2 className="font-medium">
          ✓ {files.length} {files.length === 1 ? "PDF" : "PDFs"} ready — rename any of
          them below
        </h2>
        <button
          type="button"
          onClick={download}
          disabled={zipping}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-ink disabled:opacity-60"
        >
          {zipping ? "Preparing…" : files.length === 1 ? "Download PDF" : "Download ZIP"}
        </button>
      </header>

      <ul className="divide-y divide-line">
        {files.map((file, i) => (
          <li key={i} className="flex flex-wrap items-center gap-3 px-4 py-2 text-sm">
            <input
              value={names[i] ?? ""}
              onChange={(e) => {
                const next = [...names];
                next[i] = e.target.value;
                setNames(next);
              }}
              aria-label={`File name for document ${i + 1}`}
              className="min-w-0 flex-1 rounded border border-line bg-canvas px-2 py-1 font-mono text-xs"
            />
            <span className="shrink-0 text-ink-soft">
              Pages {formatPageRanges(file.pageNumbers)}
            </span>
            <button
              type="button"
              onClick={() =>
                saveBlob(
                  new Blob([new Uint8Array(file.bytes)], { type: "application/pdf" }),
                  `${finalNames[i]}.pdf`,
                )
              }
              className="shrink-0 rounded border border-line px-2 py-1 text-xs hover:bg-canvas"
            >
              Download
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
