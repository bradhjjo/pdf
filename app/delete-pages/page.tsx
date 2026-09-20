import type { Metadata } from "next";
import { Splitter } from "@/components/Splitter";

export const metadata: Metadata = {
  title: "Delete pages from a PDF — in your browser",
  description:
    "Remove unwanted pages from a PDF and download the rest. Runs entirely in your browser; files are never uploaded.",
};

export default function DeletePage() {
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">Delete PDF pages</h1>
        <p className="max-w-2xl text-ink-soft">
          Remove the pages you do not need. A running count tells you exactly which
          pages were dropped before you download.
        </p>
      </section>

      <Splitter />

      <section className="space-y-2 border-t border-line pt-8 text-sm text-ink-soft">
        <h2 className="font-medium text-ink">How to delete pages</h2>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Drop your PDF onto the box above.</li>
          <li>Hover a page and press ✕ to remove it.</li>
          <li>Check the list of deleted pages in the banner.</li>
          <li>Download the trimmed PDF.</li>
        </ol>
      </section>
    </div>
  );
}
