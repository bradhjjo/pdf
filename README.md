# Local PDF Tools

Split, merge and rearrange PDFs entirely in the browser. Nothing is uploaded:
the file is read by pdf.js, rewritten by pdf-lib and downloaded again, all on
the visitor's own machine.

The product this repo is really about is `/` — **Split & Rename**, which cuts a
long PDF (a batch of invoices, a scanned stack of statements) into separate
documents and names each one from the text on its first page. The free
utilities at `/split-pdf`, `/merge-pdf`, `/extract-pages`, `/delete-pages` and
`/reorder-pdf` share the same engine and exist to bring people in.

## Running it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static export into out/
npm test           # unit tests for the split and naming logic
npm run typecheck
```

`npm run dev` and `npm run build` copy the pdf.js worker into `public/` first;
it is not checked in.

### Deploying

Import the repository at [vercel.com/new](https://vercel.com/new). Next.js is
detected automatically and no build settings need changing. The canonical
origin resolves itself from `VERCEL_PROJECT_PRODUCTION_URL` at build time, so
page metadata, `sitemap.xml` and `robots.txt` are right on the first deploy;
set `NEXT_PUBLIC_SITE_URL` only once there is a custom domain.

Nothing else needs setting: sign-ups already point at the Supabase function
below. See `.env.example` for the overrides that exist.

## Sign-ups

The three panels for unbuilt features POST `{email, source}` to a Supabase edge
function, whose source is in `supabase/functions/signup`. The function is the
only writer: it validates the payload, then inserts with the service role into
`public.signups`, a table with RLS enabled and no policies, so anonymous callers
cannot read or write it directly.

It is a public endpoint — there is no visitor to authenticate — so the guards
are in the function: an allow-list of sources, an email format check, a 2 KB
body cap, and a global burst cap of 30 inserts a minute, which no real traffic
approaches. A repeat sign-up for the same feature is a unique-constraint
violation and is treated as success rather than an error. Nothing identifying
beyond the address is stored: no IP, and the timestamp is the server's, not the
browser's.

If the request fails, the panel says so instead of thanking the visitor, and
the address is kept in their own browser so a retry costs them nothing.

To read what has come in:

```sql
select source, count(*), max(created_at)
from public.signups group by source order by count desc;
```

## How it is put together

| Concern | Where |
|---|---|
| Opening a PDF, error classification | `lib/pdf/load.ts` |
| Thumbnails (lazy, capped, LRU-cached) | `lib/pdf/thumbnails.ts` |
| Page order, splits, coverage | `lib/segments.ts` |
| Writing the output PDFs | `lib/pdf/build.ts` |
| File names from page text | `lib/naming/` |
| Funnel events | `lib/analytics.ts` |

Two decisions are worth knowing about before changing anything:

**Thumbnails are the performance budget.** A 200-page document cannot be
rendered in one pass. `ThumbnailRenderer` caps concurrency at three pages,
renders the most recently requested page first, and holds at most 60 bitmaps,
revoking the object URLs it evicts. `PageCard` only asks for a thumbnail once
the tile is near the viewport, and cancels the request when it scrolls away.

**Coverage is a first-class value, not a nicety.** `computeCoverage` compares
the pages that will be written against the pages that came in, and the banner
says `12 / 12 pages accounted for` — or names exactly which pages were deleted
or duplicated. For anyone splitting invoices this is the difference between
trusting the output and re-counting it by hand, and no other browser splitter
tells you.

## What is measured

Five events, via Vercel Analytics, and nothing else:

```
visit → pdf_selected → split_created → download_zip → auto_detect_clicked
                                                    → pro_clicked
```

Page counts go out bucketed (`6-20`, `51-200`) and file names and file contents
never leave the browser.

`auto_detect_clicked` and `pro_clicked` come from panels for features that do
not exist yet. Those panels say so in as many words — "We have not built this
yet" — and the only thing on offer is an email when they work. If the clicks
come, the feature gets built; if they do not, it does not.

## Not built, on purpose

No accounts, no uploads, no database, no payments, no OCR, no LLM. Each of
those waits for evidence from the funnel above.
