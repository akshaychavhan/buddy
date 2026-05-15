# Day_05_Add_layouts_and_templates_learning_doc

## Goal

Second doc-first commit of Day 2. Teaches how the App Router maps folder → URL, what `layout.tsx` does (and why it persists across navigation), what `template.tsx` does (and why we don't need it), and the route-group `(name)` rule that makes "two shells, same URL tree" possible. This is the **map** the reader will hold in mind when the first code commit (`Day_06`) creates `app/(app)/layout.tsx` and moves `app/page.tsx` into it.

Pure docs commit — same shape as `Day_04`. No app code touched.

## Summary

**Files at a glance**

| Group     | Files                                                          |
| --------- | -------------------------------------------------------------- |
| Plan doc  | `plans/Day_05_Add_layouts_and_templates_learning_doc.md`       |
| Learning  | `docs/learning/day2_layouts_and_templates.md`                  |
| Index     | `docs/README.md`                                               |

**What you'll run / what you'll see**

| Command                                                    | What it does                                                                                |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Open `docs/learning/day2_layouts_and_templates.md`         | ~280 lines: folder-to-URL mapping, layout tree, route groups, `(app)`/`(auth)` worked example for Buddies, 8 gotchas, 5-question quiz. |
| Open `docs/README.md`                                      | Day 2 Learning Journal subsection now lists **two** docs.                                   |
| `ls docs/learning/`                                        | Five files: three Day-1 docs + two Day-2 docs (`day2_rsc_vs_client_components.md`, `day2_layouts_and_templates.md`). |

> Pure docs commit. The first code change (creating `app/(app)/layout.tsx` and moving the home page) lands in `Day_06`.

## Commands

```bash
# Nothing to run. Reading the doc IS the work.
# Optional sanity check:
pnpm typecheck && pnpm lint
```

## Files changed

- `plans/Day_05_Add_layouts_and_templates_learning_doc.md` — **created**: this file.
- `docs/learning/day2_layouts_and_templates.md` — **created**: ~280-line learning doc following PROMPT.md §2.1. Sections: folder = URL segment, `page.tsx` makes it real, `layout.tsx` wraps everything below, layout tree vs URL tree, route groups `(name)`, layout-vs-template comparison table, what you can put in a layout (`children` is required, layouts are Server Components, can `await` data, don't receive `params`), Tiny Isolated Example showing two shells / three URLs, Day 2 target folder layout, 8 gotchas, 5-question quiz with `<details>` answers.
- `docs/README.md` — **edited**: adds `day2_layouts_and_templates.md` link under Phase 1 → Day 2 in Learning Journal (right after the RSC-vs-Client doc).

## Verification

1. Open `docs/learning/day2_layouts_and_templates.md` — title is "Layouts, Templates, and Route Groups", contains the folder-to-URL mapping diagram, the layout-vs-template comparison table, the Day 2 target folder layout under "Applied to Buddies", and 5 quiz items in `<details>` blocks.
2. Open `docs/README.md` — under **Phase 1 → Day 2** in Learning Journal there are now **two** entries: the RSC-vs-Client doc and this new layouts doc.
3. Run `git log --oneline -2` — top two commits are `Day_05_Add_layouts_and_templates_learning_doc` and `Day_04_Add_rsc_vs_client_components_learning_doc`.
4. Run `ls docs/learning/day2_*.md` — exactly two files.
5. Progress tracker row for Day 2 in `docs/README.md` still reads **🔄 In progress** (no flip needed — that happened in `Day_04`; close-out is `Day_15`).

## Gotchas / decisions

- **Why the layouts doc before any code?** The `Day_06` commit will create one new folder, one new file, and `git mv` an existing file — three things at once. Without this doc, that diff is opaque. With this doc, the diff is "we just did exactly what the doc described."
- **Tracker row stays 🔄.** Day 2 is mid-flight; status doesn't change every commit. Only `Day_04` (flip to 🔄) and `Day_15` (flip to ✅) touch the status column. Other Day-2 commits can update the **Notes** column if they reveal new content — but to keep churn low, we won't.
- **Notes column unchanged.** Could update it to "Doc 2 of 4: layouts + route groups" but that's chatty and not informative beyond the `git log`. Leaving the notes at "Doc 1 of 4" from `Day_04`; `Day_15` will rewrite the notes to the final summary.
- **Forward-references use commit *numbers*, not links.** The doc's "What's Next?" section mentions `Day_06`/`Day_07`/`Day_08`/`Day_09` but doesn't link to plan files that don't exist yet. Same convention as `Day_04`'s doc.
- **No `Day_06` files created yet.** The temptation is "while we're here, write the `Day_06` plan file too." Resisted — one commit, one concept, one set of new files. Future-you walking `git log` sees a single tidy step.
