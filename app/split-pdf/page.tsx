import type { Metadata } from "next";
import Link from "next/link";
import { Splitter } from "@/components/Splitter";

export const metadata: Metadata = {
  title: "Split PDF in your browser — no upload",
  description:
    "Split a PDF into several files. Choose where to cut, or split every N pages. Runs entirely in your browser; files are never uploaded.",
};

export default function SplitPage() {
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">Split PDF</h1>
        <p className="max-w-2xl text-ink-soft">
          Cut a PDF into separate files wherever you like, or split it every N pages.
          Your file stays on your device.
        </p>
      </section>

      <Splitter>
        <div className="rounded-xl border border-line bg-surface p-4">
          <p className="text-sm">
            Splitting invoices or statements?{" "}
            <Link href="/" className="font-medium text-accent underline">
              Try Split &amp; Rename
            </Link>{" "}
            — it names each file from the text on its first page.
          </p>
        </div>
      </Splitter>

      <section className="space-y-2 border-t border-line pt-8 text-sm text-ink-soft">
        <h2 className="font-medium text-ink">How to split a PDF</h2>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Drop your PDF onto the box above. It is read by your browser, not uploaded.</li>
          <li>Click the bar between two pages to add a split there, or use “Split every N pages”.</li>
          <li>Check that all original pages are accounted for.</li>
          <li>Download the files as a ZIP.</li>
        </ol>
      </section>
    </div>
  );
}
