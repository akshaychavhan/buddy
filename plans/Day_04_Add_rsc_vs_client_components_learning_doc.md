# Day_04_Add_rsc_vs_client_components_learning_doc

## Goal

Open Day 2 with the **most fundamental App Router concept**: the line between Server Components (the default) and Client Components (opt-in via `"use client"`). Every code commit that follows in Day 2 — the error boundary, the theme-toggle, the eventual sign-in form — depends on this boundary being internalized. This commit ships only the learning doc and one index entry plus the Day-2 tracker flip. No app code is touched.

The doc is doc-first by design: future-you, walking `git log` six months from now, meets the rule **before** seeing the code that depends on it.

## Summary

**Files at a glance**

| Group     | Files                                                            |
| --------- | ---------------------------------------------------------------- |
| Plan doc  | `plans/Day_04_Add_rsc_vs_client_components_learning_doc.md`      |
| Learning  | `docs/learning/day2_rsc_vs_client_components.md`                 |
| Index     | `docs/README.md`                                                 |
| Task doc  | `docs/task/02_app_shell.md`                                      |

**What you'll run / what you'll see**

| Command                                                  | What it does                                                                        |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Open `docs/learning/day2_rsc_vs_client_components.md`    | ~270 lines: boundary rule, what crosses (props vs functions), gotchas, 5-question quiz with collapsible answers. |
| Open `docs/README.md`                                    | Phase 1 Day 2 section now lists this doc; progress tracker Day 2 row shows 🔄 In progress. |
| Open `docs/task/02_app_shell.md`                         | Status reads 🔄 In Progress; Implementation Plan section now lists the **12-commit** sequence, not the original 4-commit one. |

> Pure docs commit — no app code, no new folders under `app/`. Those start in `Day_06`.

## Commands

```bash
# Nothing to run. Reading the doc IS the work.
# Optional sanity check:
pnpm typecheck && pnpm lint
```

## Files changed

- `plans/Day_04_Add_rsc_vs_client_components_learning_doc.md` — **created**: this file.
- `docs/learning/day2_rsc_vs_client_components.md` — **created**: ~270-line learning doc following PROMPT.md §2.1 template. Sections: What/Why/How (file-level boundary, what props can cross), Tiny Isolated Example (`page.tsx` Server + `counter.tsx` Client, ~20 lines combined), Applied to Buddies (Day 2 file-by-file Server/Client table), 7 gotchas (directive-must-be-line-1, `"use client"` ≠ `"use server"`, no `async` in Client, don't over-mark, functions can't cross, `error.tsx` rule, browser-only APIs), 5-question quiz.
- `docs/README.md` — **edited**: adds `day2_rsc_vs_client_components.md` under Phase 1 → Day 2 in Learning Journal; flips Day 2 progress-tracker row from `⏸️ Not started` to `🔄 In progress` with notes "Doc 1 of 4: RSC vs Client Component boundary".
- `docs/task/02_app_shell.md` — **edited**: Status `📝 Planning` → `🔄 In Progress`; Implementation Plan section replaced with the 12-commit table (Day_04 through Day_15) matching the approved plan.

## Verification

1. Open `docs/learning/day2_rsc_vs_client_components.md` — title is "Server Components vs Client Components: The Boundary Rule", contains the file-level boundary explanation, the prop-serialization table, the 7 gotchas, and 5 quiz items with `<details>` answer blocks.
2. Open `docs/README.md` — under **Phase 1 — Foundations** in the Learning Journal there are now **two** Day 2 entries planned but only this one linked yet; progress tracker shows Day 2 row as **🔄 In progress**.
3. Open `docs/task/02_app_shell.md` — Status header reads **🔄 In Progress**; Implementation Plan section lists exactly 12 commits (`Day_04` through `Day_15`).
4. Run `git log --oneline -2` — top two commits are `Day_04_Add_rsc_vs_client_components_learning_doc` and `Day_03_Add_task_doc_for_day_2_app_shell`.
5. Run `ls docs/learning/` — exactly four files plus `.gitkeep`: three Day-1 docs + this new one.

## Gotchas / decisions

- **Doc-first opener, no code.** Day 2 deliberately starts with concepts. The first code change lands in `Day_06`. The user can step away after this commit and the repo still builds — nothing in `app/` moved.
- **Why this doc first (not layouts)?** Both layouts and `error.tsx` require knowing the Server/Client distinction. Layouts are tactical; the boundary is foundational. Order matters: foundation before walls.
- **Task 02 doc rewrite happens here.** The plan changed from 4 coarse commits to 12 fine commits *after* the task doc was written. Updating the task doc now (not at close-out) keeps the repo's truth honest commit-by-commit, instead of waiting two weeks for a retrospective.
- **Tracker flip to 🔄 In progress.** Day 1 ran the same pattern: ⏸️ → 🔄 → ✅. We're mid-day-2; the tracker should reflect that.
- **No links to commits not yet created.** The doc's "What's Next?" section forward-references `Day_05`/`Day_06`/`Day_11`/`Day_12` by **commit number**, not by markdown link. Those plan files don't exist yet, and we don't want broken links sitting in the repo. They'll resolve naturally as each commit lands.
