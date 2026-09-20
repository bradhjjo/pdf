"use client";

import { useCallback, useRef, useState } from "react";

export function Dropzone({
  onFiles,
  multiple = false,
  label = "Drop a PDF here",
  hint = "or click to choose a file",
}: {
  onFiles: (files: File[]) => void;
  multiple?: boolean;
  label?: string;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  const accept = useCallback(
    (list: FileList | null) => {
      if (!list) return;
      const pdfs = Array.from(list).filter(
        (file) => file.type === "application/pdf" || /\.pdf$/i.test(file.name),
      );
      if (pdfs.length) onFiles(multiple ? pdfs : [pdfs[0]]);
    },
    [multiple, onFiles],
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        accept(e.dataTransfer.files);
      }}
      className={`rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
        over ? "border-accent bg-accent-soft" : "border-line bg-surface"
      }`}
    >
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full cursor-pointer flex-col items-center gap-2"
      >
        <span className="text-lg font-medium">{label}</span>
        <span className="text-sm text-ink-soft">{hint}</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          accept(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
