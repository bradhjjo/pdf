"use client";

import { useCallback, useRef, useState } from "react";

export function Dropzone({
  onFiles,
  multiple = false,
  label = "Drop a PDF here",
  hint = "Your file is opened by this browser and never uploaded",
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
      onClick={() => inputRef.current?.click()}
      className={`cursor-pointer rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-colors ${
        over ? "border-accent bg-accent-soft" : "border-line bg-surface hover:border-accent/60"
      }`}
    >
      <p className="text-lg font-medium">{label}</p>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          inputRef.current?.click();
        }}
        className="mt-4 rounded-lg bg-accent px-5 py-2.5 font-medium text-accent-ink"
      >
        Choose {multiple ? "files" : "a file"}
      </button>
      <p className="mt-4 text-sm text-ink-soft">{hint}</p>
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
