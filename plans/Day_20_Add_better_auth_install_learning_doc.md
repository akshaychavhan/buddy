# Day_20_Add_better_auth_install_learning_doc

## Goal

Second Phase B doc. Walks through the **end-to-end install + setup flow** for Better Auth *before* executing it. Covers six steps spread across the next three commits: install the package (`Day_21`), generate `BETTER_AUTH_SECRET` (`Day_21`), write `lib/auth.ts` (`Day_22`), run `pnpm dlx @better-auth/cli generate` to populate the schema (`Day_22`), `pnpm db:push` to Atlas (`Day_22`), mount `app/api/auth/[...all]/route.ts` (`Day_23`). After reading, the diffs in those three commits read as routine execution.

Pure docs commit — no package install, no config, no CLI run.

## Summary

**Files at a glance**

| Group     | Files                                                          |
| --------- | -------------------------------------------------------------- |
| Plan doc  | `plans/Day_20_Add_better_auth_install_learning_doc.md`         |
| Learning  | `docs/learning/day7_better_auth_install.md`                    |
| Index     | `docs/README.md` (Learning Journal + Auth Detour checklist)    |

**What you'll run / what you'll see**

| Command                                                    | What it does                                                                                |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Open `docs/learning/day7_better_auth_install.md`           | ~330 lines: six-step install flow walked through with exact commands; what each step changes; the predicted four-model schema diff for `Day_22`; minimal `lib/auth.ts` (5 lines of config); three-line route handler; order-dependence rationale; 8 gotchas; 5 quiz items. |
| Open `docs/README.md` Learning Journal                     | Phase 3 → Day 7 subsection now lists **two** docs (this one joins Day_19's overview doc). |
| Open `docs/README.md` Auth Detour Checklist                | "Better Auth install + adapter" row flips from pending → covered. Covered: 5 → 6; pending: 17 → 16. |

> Pure docs commit. The actual install begins in `Day_21`.

## Commands

```bash
# Nothing to run. Reading the doc IS the work.
# Optional sanity check:
pnpm typecheck && pnpm lint
```

## Files changed

- `plans/Day_20_Add_better_auth_install_learning_doc.md` — **created**: this file.
- `docs/learning/day7_better_auth_install.md` — **created**: ~330-line learning doc following PROMPT.md §2.1. Sections:
  - **What/Why**: install matters because the CLI rewrites `prisma/schema.prisma` and the env vars are footguns — knowing the flow first prevents stalls.
  - **How It Works**: six numbered steps with exact commands and expected outputs. (1) `pnpm add better-auth` brings in arctic/oslo/kysely transitively. (2) `openssl rand -base64 32` for `BETTER_AUTH_SECRET`. (3) Sketch of minimal `lib/auth.ts` — 5 lines of config. (4) `pnpm dlx @better-auth/cli generate` — what it introspects, what it writes. (5) `pnpm db:push` — collections appear in Atlas. (6) `app/api/auth/[...all]/route.ts` — three-line mount.
  - **The predicted schema diff**: the four Better Auth models with every annotation explained; mirrors `Day_16`'s prediction so the eventual `Day_22` diff is recognizable.
  - **Order matters**: explicit rationale for why steps must run in this order; chicken-and-egg between `lib/auth.ts` (must exist for CLI) and the CLI (writes models the config references).
  - **Tiny Isolated Example**: `.env.local` + minimal `lib/auth.ts` + minimal route handler side-by-side.
  - **Applied to Buddies**: table mapping each of the six steps to the three commits (`Day_21`, `Day_22`, `Day_23`); a `curl` example that works after `Day_23`.
  - **Gotchas**: 8 items — never commit `BETTER_AUTH_SECRET`, `lib/auth.ts` must exist before CLI runs, re-run `prisma:generate` after schema changes, CLI is idempotent, `BETTER_AUTH_URL` must match deployed URL, catch-all route convention, default config defaults, CLI preserves existing schema content.
  - **Quiz**: 5 questions with `<details>` answers covering CLI mechanics, ordering chicken-and-egg, secret-vs-URL distinction, what works after each commit, and what rotation costs.
- `docs/README.md` — **edited** twice:
  1. **Learning Journal:** adds the install doc as a second entry under **Phase 3 → Day 7** (after the overview doc from `Day_19`).
  2. **Auth Detour Checklist:** flips "Better Auth install + adapter" row from pending → covered, tagged `Day_20`. Covered: 5 → 6; pending: 17 → 16.

## Verification

1. Open `docs/learning/day7_better_auth_install.md` — title is "Better Auth Install: Package, Adapter, Schema-Generation Flow", contains the six-step flow with `openssl`/`pnpm dlx`/`db:push` commands, the predicted four-model schema (matches Day_16's prediction word-for-word in structure), the order-matters explanation, 8 gotchas, 5 quiz items in `<details>` blocks.
2. Open `docs/README.md` — under **Phase 3 → Day 7** in Learning Journal there are now **two** entries.
3. Open `docs/README.md` — Auth Detour Checklist shows "Better Auth install + adapter" under **Concepts covered ✅** with `Day_20` tag. Covered: **6**, pending: **16**.
4. Run `git log --oneline -2` — top two commits are `Day_20_Add_better_auth_install_learning_doc` and `Day_19_Add_better_auth_overview_learning_doc`.
5. Run `ls docs/learning/day7_*.md` — exactly two files.
6. `pnpm typecheck && pnpm lint` — both pass.

## Gotchas / decisions

- **The doc shows the predicted schema diff identically to `Day_16`'s.** Two docs predicting the same upcoming `Day_22` diff is intentional: `Day_16` framed it through "MongoDB conventions," this doc frames it through "Better Auth requirements." Same artifact, two perspectives. When `Day_22` actually runs the CLI and the four models appear, both predictions hold.
- **The doc covers what happens *after* `Day_23`** (the `curl` example). That's intentional — by stitching `Day_21` through `Day_23` into one mental flow here, the reader's brain holds "Phase B = three commits = end-to-end server API surface" as a unit. Each individual commit's plan file zooms into its own scope; this learning doc is the bigger picture.
- **No mention of magic-link plugin or Google provider config here.** Those are `Day_31`/`Day_32` (magic-link) and `Day_33`–`Day_35` (Google OAuth) territory; this doc is intentionally narrow to email/password + the minimum config. Adding plugin syntax would make the install doc sprawl; better to leave it for the focused docs that introduce each plugin.
- **Six-step ordering is the load-bearing part of the doc.** If the user only reads one section, it's the order-matters table. That section explains why we *can't* land `lib/auth.ts` first as its own commit (CLI has nothing to introspect) and why we *can't* run `db:push` before the CLI generates models (schema is still empty).
- **No `.env.example` change in this commit.** Documenting `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` is a `Day_21` task (per the plan-file convention — that's the install commit, when scaffolding env vars is natural).
