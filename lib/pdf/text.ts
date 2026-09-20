import type { PDFDocumentProxy } from "pdfjs-dist";

/** Text of a single page, flattened to one line. Empty for scanned pages. */
export async function extractPageText(
  proxy: PDFDocumentProxy,
  pageNumber: number,
): Promise<string> {
  const page = await proxy.getPage(pageNumber);
  try {
    const content = await page.getTextContent();
    return content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
  } catch {
    return "";
  } finally {
    page.cleanup();
  }
}

/** True when the document has no extractable text at all, i.e. it is scanned. */
export async function looksScanned(proxy: PDFDocumentProxy): Promise<boolean> {
  const sampleSize = Math.min(3, proxy.numPages);
  for (let i = 1; i <= sampleSize; i += 1) {
    const text = await extractPageText(proxy, i);
    if (text.length > 20) return false;
  }
  return true;
}
