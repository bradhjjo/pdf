import type { Segment } from "../segments";

// pdf-lib is only needed once the user actually builds output, so it is kept
// out of the first load and imported on demand.
const pdfLib = () => import("pdf-lib");

export type BuiltFile = {
  name: string;
  bytes: Uint8Array;
  pageNumbers: number[];
};

/**
 * Turns each segment into its own PDF. Pages are copied from the source
 * document, so fonts, images and annotations survive intact.
 */
export async function buildSegmentPdfs(
  sourceBytes: Uint8Array,
  segments: Segment[],
  names: string[],
  onProgress?: (done: number, total: number) => void,
): Promise<BuiltFile[]> {
  const { PDFDocument, degrees } = await pdfLib();
  const source = await PDFDocument.load(sourceBytes, { ignoreEncryption: true });
  const output: BuiltFile[] = [];

  for (const [i, segment] of segments.entries()) {
    const doc = await PDFDocument.create();
    const copied = await doc.copyPages(
      source,
      segment.pages.map((page) => page.sourceIndex),
    );
    copied.forEach((page, index) => {
      const extra = segment.pages[index].rotation;
      if (extra) page.setRotation(degrees((page.getRotation().angle + extra) % 360));
      doc.addPage(page);
    });

    output.push({
      name: `${names[i]}.pdf`,
      bytes: await doc.save(),
      pageNumbers: segment.pages.map((page) => page.sourceIndex + 1),
    });
    onProgress?.(i + 1, segments.length);
    // Let the browser paint the progress bar between documents.
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  return output;
}

/** Concatenates whole documents, in the order given. */
export async function mergePdfs(
  sources: { bytes: Uint8Array }[],
  onProgress?: (done: number, total: number) => void,
): Promise<Uint8Array> {
  const { PDFDocument } = await pdfLib();
  const merged = await PDFDocument.create();

  for (const [i, source] of sources.entries()) {
    const doc = await PDFDocument.load(source.bytes, { ignoreEncryption: true });
    const pages = await merged.copyPages(doc, doc.getPageIndices());
    for (const page of pages) merged.addPage(page);
    onProgress?.(i + 1, sources.length);
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  return merged.save();
}
