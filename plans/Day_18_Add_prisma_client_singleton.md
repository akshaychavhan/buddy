# Day_18_Add_prisma_client_singleton

## Goal

First **code** commit of the Auth Detour. Implements the `PrismaClient` global-singleton pattern from `Day_15`'s learning doc in a fresh `lib/prisma.ts`. Adds a `"db:push"` script to `package.json` that calls `prisma db push --skip-generate` (the `--skip-generate` flag avoids a non-zero exit on the still-empty schema). Documents the `.env` → `.env.local` symlink as a one-time local setup step (it's not part of the commit — the symlink lives outside git — but the plan-file mentions it so future-you doesn't get stuck the same way I did).

After this commit, `pnpm db:push` connects to Atlas and reports "already in sync" against the empty schema, every subsequent commit can `import { prisma } from "@/lib/prisma"`, and the foundation is ready for `Day_19`'s Better Auth overview doc.

## Summary

**Files at a glance**

| Group     | Files                                                |
| --------- | ---------------------------------------------------- |
| Plan doc  | `plans/Day_18_Add_prisma_client_singleton.md`        |
| App code  | `lib/prisma.ts` (new), `package.json` (edited)       |
| Index     | `docs/README.md` (Auth Detour checklist row flipped) |

**What you'll run / what you'll see**

| Command                                                 | What it does                                                                                |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `nvm use && pnpm db:push`                               | New shortcut. Output: `Datasource "db": MongoDB database "buddies" at "cluster0…"` then `The database is already in sync with the Prisma schema.` Empty schema → no-op. Exit code 0. |
| `cat lib/prisma.ts`                                     | 11-line file: imports `PrismaClient`, defines `globalForPrisma`, exports the singleton, guards the `globalThis` write to dev mode. Matches Day_15's doc line-for-line. |
| `pnpm build && pnpm typecheck && pnpm lint`             | All green. The new file compiles; nothing imports it yet, so it tree-shakes out of the build. |

> First commit that touches `lib/`. The folder didn't exist before this commit.

## Commands

```bash
# Create the folder + singleton file (see Files changed below for content).
mkdir -p lib
# Then write lib/prisma.ts (11 lines, identical to Day_15's tiny example).

# Add the db:push script to package.json's scripts block.

# Verify locally.
nvm use
pnpm db:push       # should exit 0, report "already in sync"
pnpm build
pnpm typecheck
pnpm lint
```

## Files changed

- `plans/Day_18_Add_prisma_client_singleton.md` — **created**: this file.
- `lib/prisma.ts` — **created**: 11 lines. Imports `PrismaClient` from `@prisma/client`, declares a typed `globalForPrisma` view of `globalThis`, exports `prisma` (reusing the global instance or creating a fresh one), and writes the instance back to `globalThis.prisma` only when `NODE_ENV !== "production"`. Identical to the snippet in [Day 6 — Prisma in Next.js](../docs/learning/day6_prisma_in_nextjs.md)'s "Tiny Isolated Example" section.
- `package.json` — **edited**: adds `"db:push": "prisma db push --skip-generate"` to the `scripts` block, right after `"prisma:generate"`. The `--skip-generate` flag avoids a non-zero exit code when the schema has no models (`prisma generate` insists on having at least one model; until `Day_22` ships the four Better Auth models, the schema is empty). After `Day_22`, the flag is still useful — `pnpm db:push` becomes "sync only, don't regenerate"; `pnpm prisma:generate` becomes "regenerate types only, don't sync DB". Two commands, two concerns.
- `docs/README.md` — **edited**: Auth Detour checklist row "`lib/prisma.ts` singleton file ships + `db:push` script" flips from **Concepts pending ⏳** to **Concepts covered ✅**, tagged `Day_18`. Covered count: 3 → 4; pending: 19 → 18.

## Verification

1. `ls lib/` — shows `prisma.ts`.
2. `cat lib/prisma.ts` — exactly 11 lines, the singleton pattern.
3. `grep "db:push" package.json` — finds `"db:push": "prisma db push --skip-generate"`.
4. `nvm use && pnpm db:push` — exits 0; output ends with `The database is already in sync with the Prisma schema.`
5. `pnpm build && pnpm typecheck && pnpm lint` — all green.
6. `docs/README.md` Auth Detour Checklist shows the `lib/prisma.ts` singleton row under **Concepts covered ✅** with `Day_18` tag. Covered: **4**, pending: **18**.

## Gotchas / decisions

- **The `.env` symlink is NOT part of this commit.** Prisma CLI reads `.env`, not `.env.local`, by default. The fix is `ln -s .env.local .env` — a symlink that's gitignored implicitly because `.env.local` is, and explicitly because `.env` is too (verified in `Infra_03`'s `.gitignore`). The symlink lives outside the git history; you create it once on your machine when you first set up the repo locally. Documented here so future-you (or a new contributor) doesn't waste 5 minutes wondering why `pnpm db:push` says `Environment variable not found: DATABASE_URL`. **Action needed if missing:** from repo root, run `ln -s .env.local .env`.
- **`--skip-generate` is in the `db:push` script for a reason.** Without it, `prisma db push` runs `prisma generate` as a tail step. `generate` exits non-zero when there are no models in the schema — even though `db push` itself succeeded. The `--skip-generate` flag stops the tail step, so the script's exit code reflects only the DB sync. Run `pnpm prisma:generate` separately whenever you actually need fresh types (the first time will be `Day_22`, when models exist).
- **The singleton file is identical to Day_15's example.** Copy-paste from the learning doc into the file; no changes. This is the doc-first payoff: the code is the doc's example, made real.
- **Nothing imports `@/lib/prisma` yet.** The file ships but nothing references it — TypeScript notices nothing, the bundle tree-shakes it out, `pnpm build` doesn't include it. That's correct: the singleton is *ready* but not yet *used*. `Day_22` (Better Auth's `lib/auth.ts`) will be the first importer.
- **Why no `server-only` import?** Day_15's doc mentions the `server-only` package as an optional defense against accidentally importing `@/lib/prisma` into a Client Component. Skipping it for now — none of our `"use client"` files even know `prisma` exists. If we ever accidentally import it client-side, the build will fail loudly because `@prisma/client` can't be bundled for the browser. Adding `server-only` would be belt-and-suspenders; reconsider if we hit accidents.
- **Why `lib/` and not `src/lib/`?** Buddies doesn't have a `src/` directory — `tsconfig.json` resolves `@/*` from the repo root. So `lib/prisma.ts` is reachable as `@/lib/prisma`. No `src/` reorg is needed (or planned).
- **`globalThis as unknown as { prisma: ... }`** — TypeScript doesn't know `globalThis` has a `prisma` slot, so we lie to it. The `as unknown as` two-step is the idiomatic way to bypass the type system in a contained spot. Not pretty but correct.
- **`?? new PrismaClient()` not `|| new PrismaClient()`** — `??` only falls back on `null`/`undefined`. `||` would also fall back on any falsy value (empty string, 0, false), which doesn't apply here but is bad practice. `??` is the right operator for "use this if it's defined, else create a new one."
- **Connection verified against the real Atlas cluster:** `cluster0.23kbz3e.mongodb.net` (the URL hash is from your `.env.local`). The connection works; the empty-schema warning is expected and benign.
