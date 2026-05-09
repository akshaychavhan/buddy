# Infra_06_Rewrite_readme_and_contributing

## Goal
Both top-level docs still describe the old two-app monorepo (Expo mobile + Next.js API) and the old commit style (Conventional Commits). We're rewriting them to match what the repo actually is now: **one Next.js 14 app at the root**, with `Infra_NN_Descriptive_name` commits and per-commit notes in `plans/`. Visitors landing on the README should see the truth in five seconds.

## Summary

**Files at a glance**

| Group              | Files              |
| ------------------ | ------------------ |
| Plan doc           | `plans/Infra_06_Rewrite_readme_and_contributing.md` |
| Top-level docs     | `README.md`, `CONTRIBUTING.md` |

**What you'll run / what you'll see**

| Command                                | What it does                                                       |
| -------------------------------------- | ------------------------------------------------------------------ |
| Open `README.md`                       | Single Stack section, web-first framing, single Quick Start block. |
| Open `CONTRIBUTING.md`                 | One-command local setup, new commit convention, single-app structure. |
| `grep -niE 'expo\|react native\|apps/mobile\|apps/api' README.md CONTRIBUTING.md` | Should return nothing. ✅ |

> Pure docs commit — no code or build commands.

## Commands
```bash
# After editing, audit that no Expo/RN/monorepo references remain:
grep -niE 'expo|react native|apps/mobile|apps/api' README.md CONTRIBUTING.md
```

## Files changed
- `plans/Infra_06_Rewrite_readme_and_contributing.md` — **created**: this file.
- `README.md` — **edited**: rewritten lead, single Stack block (was Mobile + Backend), new Project Structure tree, Quick Start collapsed to one block, Roadmap drops mobile-only items.
- `CONTRIBUTING.md` — **edited**: Quick Start now `pnpm install && pnpm dev` from root, Commit Convention section rewritten for `Infra_NN_Descriptive_name` + `plans/` workflow, Project Structure tree updated.

## Verification
1. Open `README.md` — first paragraph reads as a web-first Next.js app, not a mobile app.
2. Open `CONTRIBUTING.md` — Quick Start block has only one set of commands (no mobile + backend split).
3. Run `grep -niE 'expo|react native|nativewind|mmkv|apps/mobile|apps/api' README.md CONTRIBUTING.md` → empty. ✅
4. Run `pnpm dev` and follow the README's Quick Start verbatim — should land at `http://localhost:3000`. ✅

## Gotchas / decisions
- **`docs/COMMIT_CONVENTION.md` left for the next commit.** It still documents the old Conventional Commits scheme. Updating it here would balloon this commit; we'll retire/rewrite it as part of `Infra_07` alongside `setup_repo.sh`, `PROMPT.md`, and `FUTURE_SCOPE.md`. CONTRIBUTING.md links to a placeholder note flagging this.
- **Roadmap V1 drops "Offline mode" and "Local notifications".** Those were mobile-app features (service workers / Expo Notifications). Web equivalents (PWA, web push) move to `FUTURE_SCOPE.md` in `Infra_07`.
- **Tech stack collapses Mobile + Backend into one Stack section.** The split made sense for two apps; with one app, separating them is just clutter. TanStack Query and i18next get a "added when needed" tag because we deferred them.
- **The `plans/` workflow now lives in CONTRIBUTING.md.** New contributors (and future-you) need to know that every commit ships with a matching `plans/<commit-name>.md`.
