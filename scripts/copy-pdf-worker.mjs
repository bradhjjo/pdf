// pdf.js runs its parser in a web worker; the worker file has to be served
// from our own origin, so it is copied into public/ before dev and build.
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "node_modules/pdfjs-dist/build/pdf.worker.min.mjs");
const target = join(root, "public/pdf.worker.min.mjs");

mkdirSync(dirname(target), { recursive: true });
copyFileSync(source, target);
console.log("copied pdf.worker.min.mjs -> public/");
