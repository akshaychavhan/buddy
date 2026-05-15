# Fix_01_Repair_prisma_client_typecheck_in_ci

## Goal

CI failed on `pnpm typecheck` after `Day_18_Add_prisma_client_singleton` landed. Error: `Module '"@prisma/client"' has no exported member 'PrismaClient'`. Root cause: `lib/prisma.ts` imports `PrismaClient` from `@prisma/client`, but **`@prisma/client` only exports `PrismaClient` after `prisma generate` runs against a schema with at least one model**. The schema was still empty (waiting for Day_22's Better Auth CLI to add User/Session/Account/Verification), so the generated client was empty too — no `PrismaClient` export, no typecheck.

Two-part fix: (1) add a minimal `Healthcheck` placeholder model to `prisma/schema.prisma` so `prisma generate` has *something* to emit a client for; (2) add a `postinstall: prisma generate` hook to `package.json` so every fresh `pnpm install` (local or CI) regenerates the client automatically. The placeholder model gets overwritten by Better Auth's CLI in `Day_22`.

This is a `Fix_*` commit (per `docs/COMMIT_CONVENTION.md`) — repairing a real bug shipped in a prior `Day_*` commit. Not part of the auth-detour numbering.

## Summary

**Files at a glance**

| Group     | Files                                                              |
| --------- | ------------------------------------------------------------------ |
| Plan doc  | `plans/Fix_01_Repair_prisma_client_typecheck_in_ci.md`             |
| Schema    | `prisma/schema.prisma` (placeholder model added)                   |
| Config    | `package.json` (`postinstall` script added)                        |

**What you'll run / what you'll see**

| Command                                  | What it does                                                                        |
| ---------------------------------------- | ----------------------------------------------------------------------------------- |
| `pnpm install` (fresh checkout)          | Now runs `prisma generate` automatically as a post-install step. Populates `@prisma/client` with the `PrismaClient` export. |
| `pnpm typecheck`                         | Passes. `lib/prisma.ts` imports `PrismaClient` cleanly because generate ran. |
| `pnpm prisma generate`                   | Exits 0 (schema has a model). Output: `✔ Generated Prisma Client (v5.22.0) ...` |

> Tiny commit, big effect: CI goes from red to green; local installs no longer need a manual `pnpm prisma generate`.

## Commands

```bash
# Edit prisma/schema.prisma (see Files changed for the placeholder model).
# Edit package.json (add postinstall script).

# Verify locally.
nvm use
pnpm prisma generate    # exits 0 cleanly
pnpm typecheck          # no errors
pnpm lint               # no warnings
```

## Files changed

- `plans/Fix_01_Repair_prisma_client_typecheck_in_ci.md` — **created**: this file.
- `prisma/schema.prisma` — **edited**: appends a 4-line `Healthcheck` model with `id` (ObjectId) and `ok` (boolean default true). The comment above it states *"Placeholder so `prisma generate` produces a PrismaClient export. Removed in Day_22 when Better Auth's CLI writes the real User/Session/Account/Verification models."* Future-you reading the schema knows this is temporary scaffolding, not part of the data model.
- `package.json` — **edited**: adds `"postinstall": "prisma generate"` to the `scripts` block. Now `pnpm install` (local or CI) automatically generates the client. Combined with the placeholder model, every install produces a working `@prisma/client` import path.

## Verification

1. Open `prisma/schema.prisma` — sees the `Healthcheck` model with the "temporary, removed in Day_22" comment above it.
2. Open `package.json` — sees `"postinstall": "prisma generate"` in the `scripts` block.
3. `pnpm prisma generate` — exits 0; output ends with `✔ Generated Prisma Client (v5.22.0)`.
4. `pnpm typecheck` — exits 0; no errors.
5. `pnpm lint` — exits 0; no warnings.
6. **CI:** after pushing, the failing typecheck job re-runs and passes.

## Gotchas / decisions

- **Why a placeholder model, not just `postinstall: prisma generate || true`?** I tried the `|| true` approach first — it swallows generate's non-zero exit when the schema is empty, but **TypeScript still fails the import** because generate produces no `PrismaClient` even when its exit code is suppressed. The `@prisma/client` package's `default.d.ts` re-exports from `.prisma/client/default` — and `.prisma/client/default` is only written when generate has at least one model to process. Therefore: the schema *must* have a model. `|| true` is not enough.
- **Why `Healthcheck` and not a more useful temporary model?** Three reasons. (1) The name signals "this is plumbing, not domain data." (2) It's small enough that a reader sees it once and ignores it. (3) The matching `/api/health` route (from Day 1) gives it a vague thematic justification — even though they're unrelated mechanically (the API route doesn't query the model).
- **Underscore-prefixed names are illegal in Prisma.** First try used `_Healthcheck`; Prisma's schema validator rejected it ("This line is invalid. It does not start with any known Prisma schema keyword"). Switched to `Healthcheck`. Worth knowing: Prisma model names must start with an uppercase letter, no leading punctuation.
- **`postinstall` runs prisma generate on every `pnpm install`.** That's the point — CI installs from scratch every run, so it needs the hook. Local installs already worked because we'd previously run generate manually; the hook makes the local flow idempotent too (no more "did I generate yet? let me check"). Cost: ~3 seconds added to every install. Worth it.
- **Why is this a `Fix_*` commit instead of folded into `Day_18` (squashed/amended)?** Two reasons. (1) Day_18 is already pushed; rewriting public history would be a force-push to a shared branch — see [feedback_check_gh_account_before_push.md](../../.claude/projects/-home-l910009-Documents-workspace-buddy/memory/feedback_check_gh_account_before_push.md)-adjacent principle of "don't rewrite shared history without explicit approval." (2) The `Fix_NN_*` convention exists precisely for "repair a real bug in a prior commit without rewriting" — that's what this is.
- **What happens to `Healthcheck` after `Day_22`?** Better Auth's CLI **appends** models to `schema.prisma` (per Day_20's doc). It won't delete the `Healthcheck` model. We'll explicitly delete it in `Day_22`'s commit as the last step of "schema is now Better Auth's reality, no more placeholders." The plan file for Day_22 will mention this.
- **The placeholder model gets a real collection in Atlas.** When `pnpm db:push` runs (already did during Day_18 verification), Atlas now has an empty `Healthcheck` collection. Harmless; cleaned up when Day_22's schema removal + `db push` drops it. Don't worry about it.
- **No coverage-checklist row to flip.** This commit doesn't *teach* a new concept; it fixes a bug. The Auth Detour Checklist stays at 6 covered, 16 pending, 4 deferred. The relevant entry to amend after-the-fact would be "Day_18's checklist row" — but it's already correct (the singleton + script *do* ship and *do* work). Documenting the fix in this plan file is enough.
