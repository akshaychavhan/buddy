# Day_02_Add_first_page_learning_doc_and_close_day_1

## Goal

Day 1's loop ends with a synthesis doc that revisits the two files we just shipped (`app/page.tsx` + `app/api/health/route.ts`) and turns "we typed `pnpm dev` and it worked" into "I can explain *why* it worked." This commit adds that synthesis doc and flips the Day 1 row in the master tracker from 🔄 In progress to ✅ Completed. After this commit, Day 1 is genuinely done — three learning docs, one task doc, one bug doc, and a verified-on-local dev server.

## Summary

**Files at a glance**

| Group          | Files                                                          |
| -------------- | -------------------------------------------------------------- |
| Plan doc       | `plans/Day_02_Add_first_page_learning_doc_and_close_day_1.md`  |
| Learning (Day 1) | `docs/learning/day1_first_page.md`                            |
| Index          | `docs/README.md`                                                |

**What you'll run / what you'll see**

| Command                                                                    | What it does                                                                                |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Open `docs/learning/day1_first_page.md`                                    | Line-by-line tour of `app/page.tsx` + `app/api/health/route.ts`, plus the Server vs Client Component anchor and a 5-question quiz with collapsible answers. |
| Open `docs/README.md`                                                      | Phase 1 learning section now lists three Day 1 docs; progress tracker shows Day 1 as ✅ Completed. |
| `grep -l "day1_first_page" docs/README.md`                                 | Returns `docs/README.md` — confirms the index links the new doc. |

> Pure docs commit — no app code touched. The learning doc references the same two files that already shipped in `Infra_02` (`app/page.tsx`, `app/api/health/route.ts`).

## Commands

```bash
# No commands need to run. Reading the doc IS the work.
# If you want to play with the example while reading:
nvm use && pnpm dev
# then open http://localhost:3000 and http://localhost:3000/api/health side-by-side.
```

## Files changed

- `plans/Day_02_Add_first_page_learning_doc_and_close_day_1.md` — **created**: this file.
- `docs/learning/day1_first_page.md` — **created**: ~165-line learning doc following PROMPT.md §2.1 template. Three sections of new substance: (1) line-by-line walkthrough of both files with every non-obvious detail called out, (2) Server Component vs Client Component anchor table previewing Day 2, (3) gotchas around `default export`, hardcoded `route.ts` filename, `Response.json()` vs `NextResponse.json()`, and `"use client"` ≠ `"use server"`. Ends with a 5-question quiz (answers in `<details>`) and a Day 2 preview.
- `docs/README.md` — **edited**: added the new learning doc to the Day 1 list in Phase 1; flipped the Day 1 progress tracker row to ✅ Completed with a note summarizing what Day 1 produced.

## Verification

1. Open `docs/learning/day1_first_page.md` — title is "Day 1 — First Page Walkthrough", contains the line-by-line tour of both files, has a quiz section, and links back to `day1_setup.md` / `day1_installation.md` / Task 01 / Bug 01.
2. Open `docs/README.md` — Phase 1 learning section shows **three** Day 1 entries (setup, installation, first_page); progress tracker Day 1 row says **✅ Completed**.
3. Run `git log --oneline -2` — top two commits are `Day_02_Add_first_page_learning_doc_and_close_day_1` and `Day_01_Add_task_doc_and_verify_scaffold`.
4. Run `ls docs/learning/` — exactly three Day-1 files plus `.gitkeep`.

## Gotchas / decisions

- **Why `Day_02_*` for a Day-1 doc?** Numbering follows `<Category>_NN_*` monotonic per category, not per calendar day. This is the second commit in the `Day_` category. Future Day-2 work will start at `Day_03_*`. The convention is named-by-creation-order, not by topic.
- **Quiz answers in `<details>` blocks.** Markdown renders them collapsed by default, so the reader gets the quiz "for real" before peeking at answers. Same pattern PROMPT.md §2.1 doesn't explicitly require but several Infra plan files have used.
- **Day 2's preview is concrete.** Listed the actual things Day 2 will cover (`layout.tsx` nesting, `loading.tsx`, `error.tsx`, first Client Component, nested routes, `<Link>`). Not just "we'll go deeper" — specific topics so we can spot scope creep early.
- **Nothing to verify in the browser.** Unlike Commit 1 (which required `pnpm dev` to prove the scaffold worked), this commit is pure documentation about something that already works. The verification is "open the file, read the words."
