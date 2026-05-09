# 📝 Commit Convention — Buddies

> **Purpose:** Make every commit self-documenting. A year from now, `git log` should read like a tutorial of how this project was built.

This convention is **mandatory** for all commits in this repository.

---

## 📐 The Format

```
<Category>_NN_Descriptive_name
```

That's it. PascalCase words joined by underscores, with a numbered prefix that tells you the **phase** the commit belongs to.

### Anatomy

| Part            | Rule                                               | Example                              |
| --------------- | -------------------------------------------------- | ------------------------------------ |
| **Category**    | One PascalCase word — what kind of work is this?   | `Infra`, `Day`, `Feat`, `Fix`, `Docs` |
| **NN**          | Two-digit zero-padded sequence within the category | `01`, `02`, `10`                     |
| **Descriptive name** | PascalCase words joined by `_`, present-tense verb-led | `Scaffold_root_nextjs`, `Fix_pnpm_version_conflict_in_ci` |

### Real examples from this repo

```
Infra_01_Collapse_existing_structure
Infra_02_Scaffold_root_nextjs
Infra_03_Tighten_gitignore_for_nextjs
Infra_04_Rewrite_ci_for_nextjs
Infra_05_Fix_pnpm_version_conflict_in_ci
Infra_06_Rewrite_readme_and_contributing
```

You can `grep` `git log` for `Infra_` and immediately see every infrastructure commit, in order, like chapter headings.

---

## 🏷️ Categories

| Category | When to use                                           | Example                                   |
| -------- | ----------------------------------------------------- | ----------------------------------------- |
| `Infra`  | Repo setup, CI, build config, dependencies, plumbing  | `Infra_03_Tighten_gitignore_for_nextjs`   |
| `Day`    | A learning day's work (lessons + the code that day)   | `Day_01_Project_setup`                    |
| `Feat`   | A user-facing app feature                             | `Feat_01_Trip_creation_form`              |
| `Fix`    | A standalone bug fix not bundled into a feature/day   | `Fix_01_Trip_list_pagination_off_by_one`  |
| `Docs`   | Pure docs work (learning notes, READMEs)              | `Docs_01_Add_better_auth_overview`        |

> 💡 **Don't invent categories.** If something doesn't fit, it's almost always `Infra` (plumbing) or `Docs` (writing). If a single commit honestly spans two categories, split it into two commits.

---

## 🔢 The numbered prefix

Numbers are **per-category, monotonically increasing** in the order commits land. They don't restart per branch or per release.

- `Infra_01`, `Infra_02`, `Infra_03`, `Infra_04`, `Infra_05`, `Infra_06`, ...
- `Day_01`, `Day_02`, ...
- `Feat_01`, `Feat_02`, ...

If you fix a mistake from `Infra_04` two commits later, the fix is its **own** commit (e.g. `Infra_05_Fix_pnpm_version_conflict_in_ci`) — not a renumber, not a force-push.

> 📌 **Why numbers?** They turn `git log --oneline` into a table of contents. Future-you (or a reader following the journey) can read the history top-to-bottom like a book.

---

## ✏️ Writing a good descriptive name

The descriptive name is **the verb + object** of the commit. Like a slide title: short, specific, memorable.

- ✅ **Verb-led** — `Scaffold_root_nextjs`, `Tighten_gitignore_for_nextjs`, `Fix_pnpm_version_conflict_in_ci`
- ✅ **Concrete** — `Rewrite_readme_and_contributing` not `Update_docs`
- ✅ **PascalCase, underscores** — every word starts capital, joined by `_`
- ✅ **Reads like a sentence** — drop conjunctions ("for", "and") only when they hurt readability

### Good vs. weak

| ✅ Good                                   | ❌ Weak                  | Why                                                      |
| ---------------------------------------- | ----------------------- | -------------------------------------------------------- |
| `Infra_02_Scaffold_root_nextjs`          | `Infra_02_Setup`        | "Setup" tells you nothing.                               |
| `Infra_05_Fix_pnpm_version_conflict_in_ci` | `Infra_05_Fix_ci`     | "Fix CI" is too vague — pin the specific symptom.        |
| `Day_07_Wire_better_auth_to_signup_form` | `Day_07_Auth_work`      | "Auth work" could be anything.                           |
| `Feat_03_Add_trip_categorization_tabs`   | `Feat_03_New_tabs`      | "New tabs" doesn't say what kind.                        |

---

## 🧾 Per-commit plan files in `/plans/`

**Every commit ships with a matching beginner-friendly walkthrough at `plans/<commit-name>.md`.** This is not optional — it's the load-bearing part of the convention.

The plan file is **written first**, the changes follow, and they get committed together as one atomic commit.

### Required sections in every plan file

1. **Goal** — 3–4 sentences. What are we doing, why does a beginner care?
2. **Summary** — a 30-second TL;DR with two tables:
   - **Files at a glance** — `Group | Files`
   - **What you'll run / what you'll see** — `Command | What it does`
3. **Commands** — exact shell commands, copy-pasteable.
4. **Files changed** — bullets with `created` / `edited` / `deleted` labels + one-line plain-English notes.
5. **Verification** — 2–4 numbered steps proving it worked.
6. **Gotchas / decisions** — only the surprising stuff. If nothing's tricky, write "Nothing tricky here." and move on.

See [`plans/Infra_02_Scaffold_root_nextjs.md`](../plans/Infra_02_Scaffold_root_nextjs.md) for a fully-fleshed example.

### Workflow

```bash
# 1. Decide on the next commit name
#    e.g. Infra_07_Retarget_setup_script_and_commit_convention

# 2. Create plans/<name>.md FIRST. Use the template above.

# 3. Make the actual changes (code, docs, whatever).

# 4. Stage everything together.
git add .

# 5. Commit with the matching name as the message.
git commit -m "Infra_07_Retarget_setup_script_and_commit_convention"
```

---

## 📝 Commit message body

The commit **subject** is the `<Category>_NN_Descriptive_name` — that's what shows up in `git log --oneline`.

You generally don't need a body. The plan file at `plans/<name>.md` is the body. If you really want context inside `git log` itself, add a one-paragraph body — but never duplicate the plan file's contents.

---

## ❌ Anti-patterns

```
update                              ❌ Update what?
Fix bug                             ❌ Which bug? Which symptom?
WIP                                 ❌ Squash before pushing.
Infra_2_setup                       ❌ Use Infra_02_, not Infra_2_. Lowercase descriptive part.
Infra-02-scaffold-root-nextjs       ❌ Underscores, not hyphens. PascalCase, not lowercase.
infra_07_setup_script               ❌ Capitalize the category: `Infra_`.
feat(day4/task05): add trip cards   ❌ This is the OLD Conventional Commits style — don't use.
```

---

## 🧭 Why this scheme (and not Conventional Commits)?

This repo used to follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat(scope): …`). It's a great scheme for production codebases with thousands of contributors and automated changelog tooling. But for **a public learning journey**, two things mattered more:

1. **Readability as a tutorial.** `git log --oneline` should read like chapter headings. `Infra_02_Scaffold_root_nextjs` tells you exactly what happens at chapter 2 of the infrastructure track. `feat(infra): scaffold next.js` doesn't communicate sequence.
2. **No tooling overhead.** Conventional Commits earns its keep when you wire up commitlint, husky, semantic-release, auto-changelogs. We don't. So we'd be paying its complexity tax with none of its rewards.

If the repo grows beyond a learning project, this convention can be retired the same way Conventional Commits was — pick what serves the readers best.

---

## 📋 Quick Reference Cheat Sheet

```
FORMAT:    <Category>_NN_Descriptive_name
CATEGORY:  Infra | Day | Feat | Fix | Docs   (PascalCase)
NN:        Zero-padded two-digit, monotonic per category (01, 02, ..., 10, 11)
NAME:      PascalCase, underscores, verb-led, concrete
PLAN FILE: plans/<commit-name>.md is REQUIRED, committed together

GOOD:  Infra_02_Scaffold_root_nextjs
GOOD:  Day_07_Wire_better_auth_to_signup_form
GOOD:  Fix_03_Trip_list_off_by_one_pagination
BAD:   update
BAD:   Infra_02_Setup
BAD:   feat(infra): scaffold next.js
```

---

**Stick to this from commit #1 and your git history will read beautifully forever.**
