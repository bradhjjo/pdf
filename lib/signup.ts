/**
 * Early-access sign-ups for features that do not exist yet.
 *
 * The endpoint is a Supabase edge function (source in supabase/functions/signup)
 * which validates the payload and writes it with the service role; the table
 * itself is closed to anonymous callers. Overridable so a fork can point
 * somewhere else, but it has a working default so the panels are never a
 * dead end.
 */
const DEFAULT_ENDPOINT = "https://ktynqtlzkkewsfrhhyhn.supabase.co/functions/v1/signup";
const ENDPOINT = process.env.NEXT_PUBLIC_SIGNUP_ENDPOINT?.trim() || DEFAULT_ENDPOINT;
const STORAGE_KEY = "pdftools.signups";

export type SignupSource = "auto_detect" | "auto_rename" | "pro";

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

export async function submitSignup(email: string, source: SignupSource) {
  const payload = { email: email.trim().toLowerCase(), source };
  // Kept locally too, so a failed request never loses what someone typed.
  remember({ ...payload, at: new Date().toISOString() });

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Sign-up failed with status ${response.status}`);
  }
}

function remember(payload: unknown) {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, payload]));
  } catch {
    // Private mode or blocked storage: the sign-up simply is not remembered.
  }
}
