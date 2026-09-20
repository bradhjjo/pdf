import type { Metadata } from "next";
import { Splitter } from "@/components/Splitter";

export const metadata: Metadata = {
  title: "Reorder PDF pages — in your browser",
  description:
    "Drag pages into a new order and download the rearranged PDF. Runs entirely in your browser; files are never uploaded.",
};

export default function ReorderPage() {
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">Reorder PDF pages</h1>
        <p className="max-w-2xl text-ink-soft">
          Drag pages into the order you want, rotate anything sideways, and download
          the result. Your file stays on your device.
        </p>
      </section>

      <Splitter />

      <section className="space-y-2 border-t border-line pt-8 text-sm text-ink-soft">
        <h2 className="font-medium text-ink">How to reorder pages</h2>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Drop your PDF onto the box above.</li>
          <li>Drag any page onto the position you want it in.</li>
          <li>Use ⟳ to rotate a page that came in sideways.</li>
          <li>Download the rearranged PDF.</li>
        </ol>
      </section>
    </div>
  );
}
