import type { PDFDocumentProxy } from "pdfjs-dist";

export type LoadedPdf = {
  /** File name as the user provided it, without the .pdf extension. */
  baseName: string;
  /** Raw bytes, kept for pdf-lib. pdf.js transfers its own copy away. */
  bytes: Uint8Array;
  proxy: PDFDocumentProxy;
  pageCount: number;
};

export class PdfLoadError extends Error {
  constructor(
    message: string,
    readonly kind: "encrypted" | "corrupt" | "not-pdf" | "unknown",
  ) {
    super(message);
    this.name = "PdfLoadError";
  }
}

let pdfjs: typeof import("pdfjs-dist") | null = null;

async function getPdfjs() {
  if (!pdfjs) {
    const mod = await import("pdfjs-dist");
    mod.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    pdfjs = mod;
  }
  return pdfjs;
}

export function stripPdfExtension(fileName: string) {
  return fileName.replace(/\.pdf$/i, "");
}

export async function loadPdf(file: File): Promise<LoadedPdf> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const mod = await getPdfjs();

  try {
    // pdf.js detaches the buffer it is handed, so it gets a copy of its own.
    const proxy = await mod.getDocument({ data: bytes.slice() }).promise;
    return {
      baseName: stripPdfExtension(file.name),
      bytes,
      proxy,
      pageCount: proxy.numPages,
    };
  } catch (err) {
    throw toLoadError(err);
  }
}

function toLoadError(err: unknown): PdfLoadError {
  const name = (err as { name?: string })?.name ?? "";
  const message = (err as { message?: string })?.message ?? String(err);

  if (name === "PasswordException") {
    return new PdfLoadError(
      "This PDF is password protected. Remove the password and try again.",
      "encrypted",
    );
  }
  if (name === "InvalidPDFException" || /invalid pdf/i.test(message)) {
    return new PdfLoadError("This file is not a readable PDF.", "not-pdf");
  }
  return new PdfLoadError(
    "Something went wrong reading this PDF. It may be damaged.",
    "unknown",
  );
}
