// Receives early-access sign-ups from the fake-door panels on the PDF tools
// site. Public by design: there is no visitor to authenticate, so the function
// validates the payload itself and writes with the service role. The signups
// table has RLS on and no policies, so this is the only way in.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SOURCES = new Set(["auto_detect", "auto_rename", "pro"]);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_BODY_BYTES = 2_000;
// A flood would only ever fill the table with junk; real traffic never gets
// near this, so a global burst cap is enough without tracking anyone's IP.
const MAX_PER_MINUTE = 30;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Max-Age": "86400",
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return json(413, { error: "payload_too_large" });

  let payload: { email?: unknown; source?: unknown };
  try {
    payload = JSON.parse(raw);
  } catch {
    return json(400, { error: "invalid_json" });
  }

  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  const source = typeof payload.source === "string" ? payload.source : "";
  if (!EMAIL.test(email) || email.length > 320) return json(400, { error: "invalid_email" });
  if (!SOURCES.has(source)) return json(400, { error: "invalid_source" });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();
  const { count, error: countError } = await supabase
    .from("signups")
    .select("id", { count: "exact", head: true })
    .gte("created_at", oneMinuteAgo);
  if (!countError && (count ?? 0) >= MAX_PER_MINUTE) {
    return json(429, { error: "rate_limited" });
  }

  const { error } = await supabase.from("signups").insert({
    email,
    source,
    referer: req.headers.get("referer")?.slice(0, 500) ?? null,
  });

  // 23505 is a repeat sign-up for the same feature, which is not a failure.
  if (error && error.code !== "23505") {
    console.error("signup insert failed", error.code, error.message);
    return json(500, { error: "insert_failed" });
  }

  return json(200, { ok: true });
});
