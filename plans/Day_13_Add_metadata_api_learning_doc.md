# Day_13_Add_metadata_api_learning_doc

## Goal

Fourth and final doc-first commit of Day 2. Teaches Next.js's Metadata API — the App Router's declarative replacement for `next/head` and `_document.tsx`. Covers the `metadata` export, `title.template` for composed titles, static `export const metadata` vs dynamic `generateMetadata`, OpenGraph and Twitter card metadata, and the file-based metadata family (favicon, og-image, robots, etc. — listed only, not built).

After reading this, `Day_14`'s code commit (broaden root metadata + add per-page exports across `/`, `/trips`, `/sign-in`) reads like a direct application of the doc, not a surprise.

Pure docs commit — no app code touched.

## Summary

**Files at a glance**

| Group     | Files                                                       |
| --------- | ----------------------------------------------------------- |
| Plan doc  | `plans/Day_13_Add_metadata_api_learning_doc.md`             |
| Learning  | `docs/learning/day2_metadata_api.md`                        |
| Index     | `docs/README.md` (Learning Journal entry + tracker)         |

**What you'll run / what you'll see**

| Command                                                | What it does                                                                                |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| Open `docs/learning/day2_metadata_api.md`              | ~340 lines: where `metadata` exports live, top-down merge, `title.template` pattern, static vs dynamic with `generateMetadata`, OpenGraph + Twitter card gotchas, file-based metadata family table, 8 gotchas, 5-question quiz with `<details>` answers. |
| Open `docs/README.md`                                  | Day 2 Learning Journal subsection now lists **four** docs — the full Day 2 doc set per PROMPT.md spec. |
| `ls docs/learning/day2_*.md`                           | Four files: rsc-vs-client, layouts-and-templates, loading-and-error, metadata-api. |

> Pure docs commit. Code applying the API lands in `Day_14`. Coverage checklist stays unchanged — the **covered** flip happens when code ships.

## Commands

```bash
# Nothing to run. Reading the doc IS the work.
# Optional sanity check:
pnpm typecheck && pnpm lint
```

## Files changed

- `plans/Day_13_Add_metadata_api_learning_doc.md` — **created**: this file.
- `docs/learning/day2_metadata_api.md` — **created**: ~340-line learning doc following PROMPT.md §2.1. Sections:
  - **What/Why**: replaces `next/head` with a declarative server-side approach. Better SEO, better share previews, smaller client bundle.
  - **How It Works**: where to export `metadata`, top-down merge rule, `title.template` + `default` pattern, static `export const metadata` vs dynamic `export async function generateMetadata`, OpenGraph + Twitter card mechanics, file-based metadata family.
  - **Tiny Isolated Example**: three files (root layout with template, home using default, `/trips` setting its segment) producing `<title>Trips · Buddies</title>` automatically.
  - **Applied to Buddies**: the per-page changes `Day_14` will ship across `/`, `/trips`, `/sign-in` + root template.
  - **Gotchas**: 8 items including the `next/head` no-op trap, the Client-Component "metadata silently ignored" trap, the `openGraph.title` template no-apply trap (and the matching `twitter.title` one), the request-level dedupe between `generateMetadata` and the page itself, `metadata` is not reactive.
  - **Quiz**: 5 questions with `<details>` answers covering template composition, static-vs-dynamic, Client-Component restriction, `openGraph.title` template behavior, and the `next/head` retirement.
- `docs/README.md` — **edited**:
  1. Adds `day2_metadata_api.md` link under Phase 1 → Day 2 in Learning Journal (after loading-and-error).
  2. Progress tracker Day 2 row notes bumped to "10 of 12 commits: full Day 2 doc set + route groups + nav + loading + error + Client island done; metadata code + close-out pending".
  3. Coverage checklist is **not** changed by this commit — the metadata-API rows remain pending. They flip in `Day_14` when the code actually ships.

## Verification

1. Open `docs/learning/day2_metadata_api.md` — title is "The Metadata API: Per-Page Titles, OpenGraph, and Friends", contains the file-based metadata table (favicon / icon / opengraph-image / robots.txt / sitemap.xml / manifest.json), the `title.template`/`default` mechanics, the static-vs-dynamic distinction, and 5 quiz items in `<details>` blocks.
2. Open `docs/README.md` — under **Phase 1 → Day 2** in Learning Journal there are now **four** entries — the full Day 2 doc set required by `PROMPT.md` is complete.
3. Run `git log --oneline -2` — top two commits are `Day_13_Add_metadata_api_learning_doc` and `Day_12_Add_theme_toggle_client_component_island`.
4. Run `ls docs/learning/day2_*.md` — exactly four files.
5. `docs/README.md` checklist counts unchanged: 19 covered, 3 pending, 3 deferred. (Metadata-API rows flip in `Day_14`.)

## Gotchas / decisions

- **No checklist row flips in this commit.** Same convention as `Day_09`: a learning doc *teaches* concepts but the boxes flip when the code that uses them lands in the repo. `Day_14` flips the three metadata rows.
- **Why all four PROMPT.md docs in a row, not interleaved?** They could land between code commits, but each doc + code pair feels self-contained. The four Day-2 docs combined are still <1500 lines and they read well as a sequence. Reading the metadata doc *before* `Day_14`'s code change is the doc-first habit kept intact.
- **No `generateMetadata` example with `await` in this commit.** The doc shows the pattern, but Day 2 doesn't have any DB queries to drive a real example. Day 6 (`/trips/[id]` with Prisma + MongoDB) will use `generateMetadata` for real; we'll add a per-day learning doc then.
- **`opengraph-image.png` and friends are explicitly *not* added.** The file-based metadata family is mentioned in the doc as a table only — Day 2's scope is the object API. A proper OG-image effort (probably with Next's `next/og` ImageResponse for dynamic generation) is a separate Day-5+ effort.
- **No mention of `viewport` export.** Next.js 14 introduced a separate `viewport` export (split from `metadata` for performance). It's relevant when we add color-scheme overrides for the theme toggle — deferred to Day 3 when the real theme switching lands.
- **Tracker notes bump to "10 of 12"** but covered count stays at 19. The "10 of 12" counts *commits*, not concepts. The two numbers will only re-align at `Day_15`.
