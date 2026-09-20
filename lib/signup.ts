/**
 * Early-access sign-ups for features that do not exist yet. The endpoint is
 * configured at build time; with none set the form still validates and thanks
 * the visitor, and the address is kept in this browser only.
 */
const ENDPOINT = process.env.NEXT_PUBLIC_SIGNUP_ENDPOINT;
const STORAGE_KEY = "pdftools.signups";

export type SignupSource = "auto_detect" | "auto_rename" | "pro";

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

export async function submitSignup(email: string, source: SignupSource) {
  const payload = { email: email.trim(), source, at: new Date().toISOString() };
  remember(payload);

  if (!ENDPOINT) return;
  await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

function remember(payload: unknown) {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, payload]));
  } catch {
    // Private mode or blocked storage: the sign-up simply is not remembered.
  }
}
