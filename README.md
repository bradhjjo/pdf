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

The one variable worth setting by hand is `NEXT_PUBLIC_SIGNUP_ENDPOINT`, where
early-access sign-ups are POSTed as `{email, source, at}`. With no endpoint the
form still works and keeps addresses in the visitor's own browser — but the
sign-up panels promise an email, so point it somewhere real before sending
anyone to the site. See `.env.example`.

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
