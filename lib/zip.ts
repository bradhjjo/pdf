import { downloadZip } from "client-zip";
import type { BuiltFile } from "./pdf/build";

/**
 * Streams the ZIP instead of holding every entry in memory at once, which
 * matters once a 200-page scan turns into 40 separate documents.
 */
export async function zipFiles(files: BuiltFile[]): Promise<Blob> {
  return downloadZip(
    files.map((file) => ({
      name: file.name,
      input: new Uint8Array(file.bytes),
      lastModified: new Date(),
    })),
  ).blob();
}

export function saveBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Revoking immediately cancels the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
