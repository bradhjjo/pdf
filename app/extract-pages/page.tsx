import type { Metadata } from "next";
import { Splitter } from "@/components/Splitter";

export const metadata: Metadata = {
  title: "Extract pages from a PDF — in your browser",
  description:
    "Pull selected pages out of a PDF into their own file. Runs entirely in your browser; files are never uploaded.",
};

export default function ExtractPage() {
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">Extract PDF pages</h1>
        <p className="max-w-2xl text-ink-soft">
          Delete the pages you do not need, split the rest where you want them, and
          download what is left. Your file stays on your device.
        </p>
      </section>

      <Splitter />

      <section className="space-y-2 border-t border-line pt-8 text-sm text-ink-soft">
        <h2 className="font-medium text-ink">How to extract pages</h2>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Drop your PDF onto the box above.</li>
          <li>Hover a page and press ✕ on everything you do not want to keep.</li>
          <li>Add splits if the pages you kept belong in separate files.</li>
          <li>Download the result.</li>
        </ol>
      </section>
    </div>
  );
}
