const ILLEGAL = /[<>:"/\\|?*\u0000-\u001f]/g;
// Windows refuses these names regardless of extension.
const RESERVED = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;
const MAX_LENGTH = 80;

export function sanitizeFileName(input: string, fallback = "document"): string {
  let name = input
    .replace(ILLEGAL, "")
    .replace(/\s+/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^[._]+|[._\s]+$/g, "");

  if (name.length > MAX_LENGTH) name = name.slice(0, MAX_LENGTH).replace(/_+$/, "");
  if (!name || RESERVED.test(name)) return fallback;
  return name;
}

/** Appends _2, _3, … so a ZIP never ends up with two entries of the same name. */
export function dedupeFileNames(names: string[]): string[] {
  const seen = new Map<string, number>();
  return names.map((name) => {
    const key = name.toLowerCase();
    const count = seen.get(key) ?? 0;
    seen.set(key, count + 1);
    return count === 0 ? name : `${name}_${count + 1}`;
  });
}
