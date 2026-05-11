# Day_01_Add_task_doc_and_verify_scaffold

## Goal

Day 1 of the Buddies learning roadmap. The Next.js scaffold from `Infra_02` was code-complete but nobody had ever actually run `pnpm dev` on this branch — so "Day 1 done" wasn't real yet. This commit (a) ships the **task doc** that walks every config file in the scaffold and explains why each one is there, (b) records **Bug 01** which is the first thing that happened when we actually ran `pnpm dev` (a Node version mismatch — system Node 16 shadowed nvm's Node 20), and (c) verifies the fix with real terminal output. After this commit, Day 1 has a real "we ran it, it works" milestone, not a paper one.

## Summary

**Files at a glance**

| Group      | Files                                                                       |
| ---------- | --------------------------------------------------------------------------- |
| Plan doc   | `plans/Day_01_Add_task_doc_and_verify_scaffold.md`                          |
| Task (Day 1) | `docs/task/01_project_scaffolding.md`                                     |
| Bug journal | `docs/bug/01_pnpm_node_version_mismatch.md`                                |
| Index      | `docs/README.md`                                                            |

**What you'll run / what you'll see**

| Command                                            | What it does                                                                       |
| -------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Open `docs/task/01_project_scaffolding.md`         | Guided tour of `package.json`, `app/`, `tsconfig.json`, `next.config.mjs`, etc. + 5 retrospective tech decisions with alternatives. |
| Open `docs/bug/01_pnpm_node_version_mismatch.md`   | Full write-up of the first real bug — symptom, root cause, fix, and "how to avoid next time." |
| `nvm use && pnpm dev`                              | Switches Node to v20 (per `.nvmrc`), then starts Next.js dev on `localhost:3000`. |
| `curl -s http://localhost:3000/api/health`         | Returns `{"ok":true,"ts":<number>}` — proves the single Next.js app serves both UI and API. |
| Open `docs/README.md`                              | Task Journal now has Task 01; Bug Journal now has Bug 01; Day 1 row says "Task doc + Bug 01 closed; awaiting `day1_first_page.md` summary." |

> Pure docs commit — no app code touched. The verification was done with the existing `app/page.tsx` + `app/api/health/route.ts`.

## Commands

```bash
# 1. Activate the right Node version (one-time per shell — see Bug 01 for why)
cd /home/l910009/Documents/workspace/buddy
nvm use   # reads .nvmrc → switches to Node 20

# 2. Verify the scaffold actually runs
pnpm dev
# in another terminal:
curl -s http://localhost:3000/api/health
# open http://localhost:3000 in a browser → "Buddies — Day 1"
```

## Files changed

- `plans/Day_01_Add_task_doc_and_verify_scaffold.md` — **created**: this file.
- `docs/task/01_project_scaffolding.md` — **created**: ~270-line task doc following PROMPT.md §2.3 template. Walks each scaffold file (`package.json`, `app/layout.tsx`, `app/page.tsx`, `app/api/health/route.ts`, `tsconfig.json`, `next.config.mjs`, `tailwind.config.ts`, `.env.example`, `prisma/schema.prisma`) with WHAT it is + why it's shaped that way. Includes 5 retrospective tech decisions with alternatives considered (App Router vs Pages, pnpm vs npm, Tailwind vs CSS-in-JS, Prisma+MongoDB vs alts, single-app vs split). Acceptance criteria all ticked; "How I Tested It" reflects the real verification.
- `docs/bug/01_pnpm_node_version_mismatch.md` — **created**: ~95-line bug doc following PROMPT.md §2.2 template. Captures the very first error a real user hits when running `pnpm dev` for the first time: system Node 16 shadowing nvm's Node 20. Includes root cause (PATH ordering, not version availability), the one-command fix (`nvm use`), and the durable fix (nvm shell hook in `~/.bashrc`).
- `docs/README.md` — **edited**: added Bug Journal entry pointing to Bug 01; added Task Journal entry pointing to Task 01; updated the Day 1 row in the Progress Tracker to reflect what's still missing (the `day1_first_page.md` summary doc — that's the next commit).

## Verification

1. Open `docs/task/01_project_scaffolding.md` — top says **Status: ✅ Done**, every acceptance-criteria box is ticked, and "Bugs Encountered" links to Bug 01.
2. Open `docs/bug/01_pnpm_node_version_mismatch.md` — top says **Status: ✅ Resolved**, "Time to fix: ~2 minutes", "Outcome" section confirms the four verification steps all green.
3. Open `docs/README.md` — Bug Journal section has Bug 01; Task Journal has Task 01 under Phase 1; Day 1 progress row says "Task doc + Bug 01 closed; awaiting `day1_first_page.md` summary".
4. Run `git log --oneline -1` — top commit name is `Day_01_Add_task_doc_and_verify_scaffold` (no body, no Co-Authored trailer).

## Gotchas / decisions

- **No code changes.** Day 1 is on purpose a docs-only day — the goal is *understanding* what `Infra_02` already built, not adding to it. App code stays untouched.
- **Bug 01 ships with this commit, not its own.** The bug was discovered as part of verifying Day 1; bundling it here keeps "Day 1 verification" as one logical unit. Future bugs that surface on later days will get their own commits.
- **The task doc records decisions made elsewhere.** `Infra_02` made the actual technical choices (App Router, pnpm, Tailwind, Prisma+MongoDB, single-app). The task doc captures the *why* retrospectively so future-you doesn't have to dig through git log to find it.
- **Why `nvm use` and not "fix the system Node"?** Upgrading the system Node breaks other projects that depend on Node 16. nvm exists exactly so each project can pin its own version via `.nvmrc`. The bug doc spells out the durable fix (shell hook in `~/.bashrc`) for those who don't want to run `nvm use` every time.
- **The commit ends Day 1 verification but not Day 1 itself.** A second commit (`Day_02_*`) will add `docs/learning/day1_first_page.md` (the end-of-day synthesis doc) and flip the progress tracker to ✅. Splitting them keeps each commit small and reviewable.
