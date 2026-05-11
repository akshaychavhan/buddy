# Day_03_Add_task_doc_for_day_2_app_shell

## Goal

Open Day 2 by writing the **Task 02 — App Shell** doc — a full task scope (goal, acceptance criteria, tech decisions, 4-commit implementation plan, gotchas) for the work that will land across the next several commits: route groups `(app)`/`(auth)`, nested layouts, `loading.tsx`, `error.tsx`, and the first Client Component island. No app code in this commit — pure planning, the same way Day 1 opened with Task 01 before any verification work.

## Summary

**Files at a glance**

| Group     | Files                                                  |
| --------- | ------------------------------------------------------ |
| Plan doc  | `plans/Day_03_Add_task_doc_for_day_2_app_shell.md`     |
| Task doc  | `docs/task/02_app_shell.md`                            |
| Index     | `docs/README.md`                                       |

**What you'll run / what you'll see**

| Command                                                | What it does                                                                             |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| Open `docs/task/02_app_shell.md`                       | Full Day 2 scope: 4-commit plan (route groups → loading/error → Client Component → learning docs + close-out), 5 tech decisions, gotcha list. |
| Open `docs/README.md`                                  | Task Journal now lists Task 02; Day 2 progress row stays ⏸️ until learning docs land in Day_06. |
| `ls docs/task/`                                        | Two files: `01_project_scaffolding.md`, `02_app_shell.md`.                              |

> Pure docs commit — no app code, no `app/(app)/` folder yet. Those land in `Day_04_Add_route_groups_and_layouts`.

## Commands

```bash
# Nothing to run. Reading the task doc IS the work for this commit.
# Optional sanity check:
pnpm typecheck && pnpm lint
```

## Files changed

- `plans/Day_03_Add_task_doc_for_day_2_app_shell.md` — **created**: this file.
- `docs/task/02_app_shell.md` — **created**: Task 02 scope, follows PROMPT.md §2.3 template. 5 tech decisions (route groups, `error.tsx` client requirement, root-level `loading.tsx`, theme-toggle stub, deferred auth pages), 4-commit implementation plan with file lists per commit, 11 acceptance criteria (3 deferred), open question on `app/page.tsx` placement.
- `docs/README.md` — **edited**: adds Task 02 entry in Task Journal under Phase 1.

## Verification

1. Open `docs/task/02_app_shell.md` — title is "Task 02 — App Shell", status 📝 Planning, contains the 4-commit plan (Commit A → D), 5 numbered tech decisions, and the Gotchas section with the `app/page.tsx` placement open question.
2. Open `docs/README.md` — Task Journal section now lists **two** tasks: `Task 01 — Project Scaffolding` and `Task 02 — App Shell`.
3. Run `git log --oneline -2` — top two commits are `Day_03_Add_task_doc_for_day_2_app_shell` and `Day_02_Add_first_page_learning_doc_and_close_day_1`.
4. Run `ls docs/task/` — exactly two files.

## Gotchas / decisions

- **Numbering jumps Day_03 even though it's the start of Day 2.** Per the buddy convention, `<Category>_NN_*` is monotonic *per category*, not per calendar day. This is the third commit in the `Day_` category (`Day_01`, `Day_02`, `Day_03`).
- **Task doc written before any code.** Matches Task 01's pattern: doc → commits → close-out doc. Forces the open question (`app/page.tsx` placement) to surface *before* we start typing JSX.
- **Day 2 closes in `Day_06_*`, not `Day_05_*`.** The plan is 4 commits inside Day 2 (route-groups → loading/error → client-component → learning-docs-close). Names of future commits aren't locked yet — only this one's plan is committed.
- **Open question deferred to Commit A:** whether to move `app/page.tsx` into `(app)/page.tsx` or keep `/` outside the app shell. Task doc documents the question; the answer happens when we type the code.
