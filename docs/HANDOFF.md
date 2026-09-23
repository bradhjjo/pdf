# Handoff — burstpdf / Local PDF Tools

Written 2026-09-23. Everything below was verified, not assumed; where something
was *not* verified it says so.

## What this is

A browser-only PDF tool. The product is **Split & Rename** at `/`: it cuts a
long PDF (a batch of scanned invoices) into separate documents and names each
one from the text on its first page. Five free utility routes (`/split-pdf`,
`/merge-pdf`, `/extract-pages`, `/delete-pages`, `/reorder-pdf`) share the same
engine and exist to bring people in.

The strategy is deliberately **48h MVP → ship → measure → build one feature**,
not interview-then-build. Features that do not exist yet are shown as honest
fake-door panels; what gets built next is decided by click-through, not opinion.

**Do not add features speculatively.** The next build decision waits on data.

## Live

| | |
|---|---|
| Site | https://pdf-olive-six.vercel.app |
| Repo / branch | `bradhjjo/pdf` · `claude/pdf-split-merge-mvp-cib795` (this is the **default branch**) |
| Latest commit | `9eea86f` — deployed, state READY |
| Vercel | team `team_d03t18BIw22TmPH8Y6vdJ0ks`, project `prj_owOMozIRW6nuiGH7hNoDEEDI02ZW` (name `pdf`) |
| Supabase | project `ktynqtlzkkewsfrhhyhn` (`pdf-tools`), `https://ktynqtlzkkewsfrhhyhn.supabase.co` |
| Sign-up endpoint | `https://ktynqtlzkkewsfrhhyhn.supabase.co/functions/v1/signup` |

Push to the branch auto-deploys to production. Vercel Authentication is **off**
and Web Analytics is **on** (both confirmed).

## Status of the 30-day plan

Day 1–4 are done and deployed:

- Splitter: thumbnails, document grouping, reorder, delete, rotate, coverage, ZIP
- Five utility routes
- Automatic file names from page text (invoice number, else date)
- Three fake doors (Auto Detect, Auto Rename, Pro $9) + email capture
- Five funnel events, sitemap/robots/OG
- A full UX pass after driving the deployed build in a browser

**Day 5–7 is distribution, not code.** That is the open task.

## Data so far

One sign-up, which was the owner's own end-to-end test:

```
pro · brad.hjjo@gmail.com · 2026-09-22 01:40:31+00
```

No real traffic yet. Read it with:

```sql
select source, count(*), max(created_at)
from public.signups group by source order by count desc;
```

Funnel events live in Vercel Web Analytics: `pdf_selected` → `split_created` →
`download_zip`, plus `auto_detect_clicked` and `pro_clicked`.

## The decision this project is waiting on

Of the people who reach `download_zip`, how many click `auto_detect_clicked`?

- **High** → build text-based automatic boundary detection (Week 2 of the plan),
  then Auto Rename. Heuristics in the browser first; do not send PDFs to an LLM.
- **Near zero** → drop the B2B AI-splitter direction and run this as a free
  utility site: SEO plus ads.
- **Nobody arrives at all** → do not add features. Test landing copy and
  distribution instead, and if that fails, move on.

First target is **30 strangers** processing a real PDF and downloading it —
not 100. Revenue is not the V0 success metric.

## Architecture worth knowing before editing

| Concern | File |
|---|---|
| Opening a PDF, error classification | `lib/pdf/load.ts` |
| Thumbnails: lazy, concurrency-capped, LRU | `lib/pdf/thumbnails.ts` |
| Page order, document grouping, coverage | `lib/segments.ts` |
| Writing output PDFs | `lib/pdf/build.ts` |
| Names from page text | `lib/naming/` |
| Funnel events | `lib/analytics.ts` |
| Sign-ups (client) | `lib/signup.ts` |
| Sign-ups (server) | `supabase/functions/signup/index.ts`, `supabase/migrations/` |

Four decisions that will bite whoever changes them without knowing:

1. **Thumbnails are the performance budget.** A 200-page file cannot render in
   one pass. `ThumbnailRenderer` caps concurrency at 3, renders most-recently-
   requested first, and holds 60 bitmaps in an LRU, revoking evicted object
   URLs. `PageTile` only requests when near the viewport and cancels on exit.
2. **Splits are "document starts", not "cuts".** `buildSegments(pages, starts)`
   takes the ids of pages that begin a document. This is deliberate: the UI
   groups pages into labelled Document containers, and clicking a page starts a
   new one. An earlier design put invisible split bars in the wrap gaps between
   tiles — splits at a row end did not render at all. Do not go back to that.
3. **Coverage is a first-class value.** `computeCoverage` compares output pages
   against input pages; the UI states "All 12 pages are accounted for" or names
   what was removed or duplicated. No competitor does this. It is the product's
   main trust argument — keep it.
4. **Tailwind v4 hoists every `@theme` block.** A `@theme` inside a media query
   silently overwrites the base one. Theme tokens therefore live as `:root`
   custom properties with `@theme inline` mapping them. Putting a `@theme`
   inside `@media` again will break light mode for everyone.

## Sign-up pipeline

The browser POSTs `{email, source}` to the edge function, which validates and
inserts with the service role. `public.signups` has RLS **enabled with zero
policies**, so the function is the only writer — that INFO-level Supabase lint
is intended, not a bug to fix. Guards live in the function: source allow-list,
email format, 2 KB body cap, 30 inserts/minute global burst cap. A duplicate
`(email, source)` hits the unique constraint and counts as success. No IP is
stored and the timestamp is the server's.

If a request fails the panel says so rather than thanking the visitor, and the
address stays in their browser. **Keep that honesty** — the panels promise an
email, so someone must actually answer if people sign up.

## Environment quirks that cost time

- This container's **egress proxy blocks `*.vercel.app` and `*.supabase.co`**.
  `curl`, Playwright and WebFetch against the live site all fail with
  `connect_rejected`. Use the Vercel MCP tool `web_fetch_vercel_url` to read the
  live site, and Supabase MCP `execute_sql` for the database.
- **The Vercel connector is read-only.** Creating projects, updating project
  settings and buying domains all return 403 (`get_auth_user` returns 404 "User
  not found" — it authenticates as an integration, not as the account). Anything
  that writes to Vercel has to be done by the user in the dashboard.
- Local browser testing works fine: build, serve `out/` with
  `python3 -m http.server`, and drive it with Playwright launched via
  `executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"`
  (the bundled Playwright version expects a newer build than is installed).
  Playwright is not a saved dependency — install it when needed, remove after.
- Deno for testing the edge function locally: `npm install -g deno`, run from a
  directory outside the repo with `{"nodeModulesDir":"auto"}` in `deno.json`,
  or the repo's `node_modules` breaks its jsr resolution.

## Known gaps, deliberately not fixed

- **The naming heuristic has only been tested against synthetic invoices** that
  this session generated. Accuracy on real vendor invoices is unknown. This is
  the highest-value 30-minute check available and needs real PDFs from the user.
- Thumbnails are small with no zoom. Worth adding only if boundary-judging
  turns out to be hard in practice.
- Drag-to-reorder is mouse-only; touch drag is unimplemented.
- Scanned PDFs have no text, so names fall back to `filename_N`. `looksScanned`
  exists in `lib/pdf/text.ts` but nothing surfaces it to the user yet.
- No custom domain. `burstpdf.com` was available at $11.25/yr as of 2026-09-22
  and is the recommended name ("burst" is the industry term for splitting a
  PDF); the cheapest option was `burstpdf.click` at $1.99/yr, $11 renewal.
  Buying was left to the user. If a domain is added, set
  `NEXT_PUBLIC_SITE_URL` — it overrides the automatic
  `VERCEL_PROJECT_PRODUCTION_URL` resolution in `lib/site.ts`, and without it
  the sitemap and OG tags keep pointing at the old `.vercel.app` origin.

## Commands

```bash
npm install
npm run dev        # localhost:3000
npm run build      # static export into out/
npm test           # 22 unit tests
npm run typecheck
```

## Working agreement that has been in force

- Verify in a real browser before claiming a UI change works; screenshots beat
  assertions for UX review.
- Say plainly what was not verified.
- Do not create pull requests unless asked. Commit and push to the branch above.
- Push honest failure states rather than optimistic ones.
