import type { Metadata } from "next";
import { Merger } from "@/components/Merger";

export const metadata: Metadata = {
  title: "Merge PDF in your browser — no upload",
  description:
    "Combine several PDFs into one file, in any order. Runs entirely in your browser; files are never uploaded.",
};

export default function MergePage() {
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">Merge PDF</h1>
        <p className="max-w-2xl text-ink-soft">
          Combine several PDFs into one, in the order you choose. Your files stay on
          your device.
        </p>
      </section>

      <Merger />

      <section className="space-y-2 border-t border-line pt-8 text-sm text-ink-soft">
        <h2 className="font-medium text-ink">How to merge PDFs</h2>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Drop in every PDF you want to combine.</li>
          <li>Reorder them with the arrows until the sequence is right.</li>
          <li>Press Merge and the combined file downloads straight away.</li>
        </ol>
      </section>
    </div>
  );
}
