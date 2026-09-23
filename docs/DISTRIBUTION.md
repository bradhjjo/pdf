# Distribution — Day 5–7

Written 2026-09-23. The code is done for now; this is the plan for getting the
first **30 strangers** to process a real PDF and reach `download_zip`. Posting
is done by the owner from their own accounts — nothing here has been posted.

## 0. Before posting anything: confirm the funnel is being recorded

Distribution without measurement wastes the only thing this phase produces.

- Pageview collection is live: `/_vercel/insights/script.js` is served by the
  production deployment (checked 2026-09-23).
- **Not verified: that custom events are recorded.** The Vercel connector's
  analytics read API returns `404 "Web Analytics not found"` for this project,
  so no session can currently read pageviews or events. All five funnel
  events are `track()` custom events, and Vercel has historically restricted
  custom events to paid plans. If the account is on Hobby, `download_zip` and
  `auto_detect_clicked` may be silently dropped, and the decision this project
  is waiting on can never be made.

**Owner check (2 minutes):** open the site, load any PDF, click one page to make
a split, press Download ZIP. Then in Vercel → `pdf` → Analytics → Events, see
whether `pdf_selected` / `split_created` / `download_zip` appear (allow a few
minutes). If they do not, stop and fix measurement before posting. The
smallest fix is to send the same five events to the existing Supabase function
alongside `track()`. That is a code change and is **not** made here.

## 1. Every link carries UTM tags

Vercel Analytics breaks pageviews down by `utmSource` / `utmCampaign`, so each
post gets its own link. Without these, most traffic shows up as "direct" and a
channel that worked cannot be told apart from one that did not.

| Channel | Link |
|---|---|
| r/Bookkeeping | `https://pdf-olive-six.vercel.app/?utm_source=reddit&utm_medium=post&utm_campaign=bookkeeping` |
| r/paperless / r/Paperlessngx | `https://pdf-olive-six.vercel.app/?utm_source=reddit&utm_medium=post&utm_campaign=paperless` |
| Show HN | `https://pdf-olive-six.vercel.app/?utm_source=hn&utm_medium=post&utm_campaign=showhn` |
| Answers to existing questions | `https://pdf-olive-six.vercel.app/?utm_source=<site>&utm_medium=answer&utm_campaign=<thread-slug>` |
| AlternativeTo listing | `https://pdf-olive-six.vercel.app/split-pdf?utm_source=alternativeto&utm_medium=listing` |

## 2. Channels, in order

Ranked by how closely the audience matches the actual job ("I have one scanned
PDF with 40 invoices and need 40 named files"), not by size.

1. **Answer existing questions (highest intent, lowest risk).** People already
   ask this exact question. Search Reddit, Super User and the Paperless-ngx
   GitHub discussions for "split pdf into multiple files by invoice",
   "split scanned pdf into separate documents", "rename pdf by invoice number".
   Answer the question properly first (including free alternatives such as
   PDF24 or `qpdf`); mention the tool as one option and say you made it. Aim for
   5–10 answers. Only answer threads where it really fits.
2. **r/Bookkeeping, r/Accounting** (weekly tools thread only), **r/paperless**.
   These are the users with batches of invoices. Read each subreddit's
   self-promotion rules before posting; several allow it only in a weekly
   thread or require the "I built this" disclosure.
3. **Show HN.** The "runs entirely in the browser, file never uploaded" plus
   "page-coverage check" angle is what HN rewards. One shot — post on a
   weekday morning US Eastern, and stay to answer comments for the first
   2 hours.
4. **Directory listings** (slow, but they compound): AlternativeTo (as an
   alternative to iLovePDF / Smallpdf / PDF24, tagged privacy), SaaSHub.
5. **Not now:** Product Hunt (a one-day spike before the funnel is proven is
   wasted), paid ads (the question is whether anyone wants this, not how cheap
   a click is).

## 3. Ready-to-post copy

Rule for every post: describe only what exists today. Auto-detecting document
boundaries and Pro are fake doors — do not mention them as features.

### Reddit (r/Bookkeeping)

> **Title:** I built a free tool that splits a scanned batch of invoices into
> separate, named PDFs — nothing gets uploaded
>
> Disclosure: I made this. I kept getting one 60-page scan from the office
> scanner that had to become 20 separate invoices, each named something useful.
>
> What it does: drop the PDF in, click the first page of each invoice, download
> a ZIP. Each file is named from the invoice number (or date) it finds on the
> first page, and you can edit names before downloading. A counter shows that
> every original page ended up in exactly one file, so nothing gets lost.
>
> It runs entirely in your browser — the PDF never leaves your machine, which
> matters for client documents.
>
> Scanned image-only PDFs have no text, so those fall back to numbered names.
> I'd really like to hear where it breaks on your invoices.
>
> <link with utm_campaign=bookkeeping>

### Show HN

> **Title:** Show HN: Split a batch of scanned invoices into named PDFs, in the browser
>
> I built this for one job: a single scanned PDF containing many invoices that
> has to become one file per invoice, each with a sensible name.
>
> You click the page each document starts on; it writes the PDFs with pdf-lib
> and names each one from the invoice number or date found on its first page
> (pdf.js text extraction, plain heuristics — no LLM, nothing uploaded). It
> also checks that every input page appears in the output exactly once and
> tells you if any were dropped or duplicated.
>
> Known limits: the naming has only been tested on a small set of invoices,
> image-only scans fall back to numbered names, and reordering by drag is
> mouse-only.
>
> <link with utm_source=hn>

### Answer template (existing threads)

> [Actual answer to their question first — e.g. how to do it with PDF24 or
> `qpdf --pages`.]
>
> If you'd rather click than script it: I made a free browser tool for exactly
> this — you mark where each document starts and it downloads a ZIP of
> separate PDFs, named from the invoice number on each. The file never leaves
> your computer. <link>

## 4. What to record

Fill this in as posts go out; it is the input for the next decision.

| Date | Channel | Link campaign | Visits | `pdf_selected` | `download_zip` | `auto_detect_clicked` | Notes |
|---|---|---|---|---|---|---|---|
| | | | | | | | |

Also check `public.signups` (query in `HANDOFF.md`) after each round.

## 5. When to stop and decide

Checkpoint: **2026-10-07** (two weeks).

- **≥ 30 strangers reach `download_zip`** → read the `auto_detect_clicked`
  ratio and decide as described in `HANDOFF.md`.
- **Visits but few `pdf_selected`** → the landing copy is failing, not the
  product. Rewrite the headline and the first screen, repost to one channel,
  and measure again.
- **`pdf_selected` but few `download_zip`** → the tool is failing people. That
  is the one case where the next work is code: watch where they drop off.
- **Almost no visits after all channels above** → per the handoff: do not add
  features. One more copy test, then move on.
