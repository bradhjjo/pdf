import { sanitizeFileName } from "./sanitize";

export type NameSuggestion = {
  name: string;
  /** What the name came from, so the UI can flag the weak ones. */
  source: "invoice-number" | "date" | "heading" | "fallback";
  confident: boolean;
};

const INVOICE_NUMBER = [
  /invoice\s*(?:#|no\.?|number)\s*[:\-]?\s*([A-Z0-9][A-Z0-9\-_/]{2,20})/i,
  /\b(?:inv|bill)\s*(?:#|no\.?)\s*[:\-]?\s*([A-Z0-9][A-Z0-9\-_/]{2,20})/i,
  /statement\s*(?:#|no\.?|number)\s*[:\-]?\s*([A-Z0-9][A-Z0-9\-_/]{2,20})/i,
  /purchase\s*order\s*(?:#|no\.?)\s*[:\-]?\s*([A-Z0-9][A-Z0-9\-_/]{2,20})/i,
];

const ISO_DATE = /\b(20\d{2})[-/.](0?[1-9]|1[0-2])[-/.](0?[1-9]|[12]\d|3[01])\b/;
const US_DATE = /\b(0?[1-9]|1[0-2])[-/.](0?[1-9]|[12]\d|3[01])[-/.](20\d{2})\b/;

/**
 * Names a document from the text of its first page. Deliberately regex-only:
 * it runs in the browser, costs nothing, and covers the common invoice layouts.
 * Anything it is not sure about comes back as `confident: false` so the user
 * sees which names still need a look.
 */
export function suggestName(text: string, fallback: string): NameSuggestion {
  const normalized = text.replace(/\s+/g, " ").trim();

  for (const pattern of INVOICE_NUMBER) {
    const match = normalized.match(pattern);
    if (match?.[1]) {
      return {
        name: sanitizeFileName(`invoice_${match[1]}`, fallback),
        source: "invoice-number",
        confident: true,
      };
    }
  }

  const iso = normalized.match(ISO_DATE);
  if (iso) {
    const [, year, month, day] = iso;
    return {
      name: sanitizeFileName(`${year}-${pad(month)}-${pad(day)}`, fallback),
      source: "date",
      confident: false,
    };
  }

  const us = normalized.match(US_DATE);
  if (us) {
    const [, month, day, year] = us;
    return {
      name: sanitizeFileName(`${year}-${pad(month)}-${pad(day)}`, fallback),
      source: "date",
      confident: false,
    };
  }

  const heading = firstHeading(normalized);
  if (heading) {
    return { name: sanitizeFileName(heading, fallback), source: "heading", confident: false };
  }

  return { name: sanitizeFileName(fallback), source: "fallback", confident: false };
}

function pad(value: string) {
  return value.padStart(2, "0");
}

function firstHeading(text: string): string | null {
  const words = text.split(" ").filter(Boolean).slice(0, 8);
  if (words.length < 2) return null;
  const heading = words.slice(0, 5).join(" ");
  return heading.length >= 4 ? heading : null;
}
