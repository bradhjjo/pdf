"use client";

import { useState } from "react";
import { trackEvent, type FunnelEvent } from "@/lib/analytics";
import { isValidEmail, submitSignup, type SignupSource } from "@/lib/signup";

/**
 * A feature we have not built yet, shown honestly: the panel says plainly that
 * it does not exist, and the only thing on offer is a note when it does.
 */
export function FakeDoor({
  title,
  description,
  cta,
  event,
  source,
}: {
  title: string;
  description: string;
  cta: string;
  event: FunnelEvent;
  source: SignupSource;
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "invalid" | "failed">("idle");

  return (
    <section className="rounded-xl border border-line bg-surface p-4">
      <h3 className="font-medium">✨ {title}</h3>
      <p className="mt-1 text-sm text-ink-soft">{description}</p>

      {!open && (
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            trackEvent(event);
          }}
          className="mt-3 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white"
        >
          {cta}
        </button>
      )}

      {open && state !== "done" && (
        <form
          className="mt-3"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!isValidEmail(email)) {
              setState("invalid");
              return;
            }
            setState("sending");
            try {
              await submitSignup(email, source);
              setState("done");
            } catch {
              // Saying "thanks" when nothing was saved would be a lie.
              setState("failed");
            }
          }}
        >
          <p className="text-sm">
            We have not built this yet. Leave your email and we will tell you when it
            works — nothing else.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setState("idle");
              }}
              placeholder="you@company.com"
              className="min-w-0 flex-1 rounded-lg border border-line bg-canvas px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={state === "sending"}
              className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {state === "sending" ? "Sending…" : "Notify me"}
            </button>
          </div>
          {state === "invalid" && (
            <p className="mt-2 text-sm text-warn">That does not look like an email address.</p>
          )}
          {state === "failed" && (
            <p className="mt-2 text-sm text-warn">
              That did not save — something on our end. Try again in a moment.
            </p>
          )}
        </form>
      )}

      {state === "done" && (
        <p className="mt-3 text-sm">Thanks — we will email you once it works.</p>
      )}
    </section>
  );
}
