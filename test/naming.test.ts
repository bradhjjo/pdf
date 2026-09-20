import { describe, expect, it } from "vitest";
import { dedupeFileNames, sanitizeFileName } from "../lib/naming/sanitize";
import { suggestName } from "../lib/naming/heuristics";

describe("sanitizeFileName", () => {
  it("strips characters the filesystem rejects", () => {
    expect(sanitizeFileName('in/vo:ice*10023')).toBe("invoice10023");
  });

  it("replaces whitespace with underscores", () => {
    expect(sanitizeFileName("Acme  Corp Invoice")).toBe("Acme_Corp_Invoice");
  });

  it("falls back for names Windows reserves", () => {
    expect(sanitizeFileName("CON", "document")).toBe("document");
  });

  it("falls back when nothing usable is left", () => {
    expect(sanitizeFileName("///", "document")).toBe("document");
  });
});

describe("dedupeFileNames", () => {
  it("suffixes repeats", () => {
    expect(dedupeFileNames(["invoice", "invoice", "other", "invoice"])).toEqual([
      "invoice",
      "invoice_2",
      "other",
      "invoice_3",
    ]);
  });

  it("treats case-insensitive collisions as repeats", () => {
    expect(dedupeFileNames(["Invoice", "invoice"])).toEqual(["Invoice", "invoice_2"]);
  });
});

describe("suggestName", () => {
  it("prefers an invoice number", () => {
    const result = suggestName("ACME LTD INVOICE Invoice # 10023 Bill To ...", "fallback");
    expect(result.name).toBe("invoice_10023");
    expect(result.confident).toBe(true);
  });

  it("falls back to a date, and is not confident about it", () => {
    const result = suggestName("Statement of account 2025-03-14 total due", "fallback");
    expect(result.name).toBe("2025-03-14");
    expect(result.confident).toBe(false);
  });

  it("uses the fallback for an empty page", () => {
    expect(suggestName("", "doc_3").name).toBe("doc_3");
  });
});
