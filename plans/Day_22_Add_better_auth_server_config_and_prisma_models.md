# Day_22_Add_better_auth_server_config_and_prisma_models

## Goal

**Densest commit of the auth detour.** Five things land together:

1. Create `lib/auth.ts` — the minimal Better Auth config (Prisma adapter + email/password, no Google or magic-link yet).
2. Run `pnpm dlx @better-auth/cli generate --output prisma/schema.prisma` — the CLI introspects `lib/auth.ts` and appends 4 models (`User`, `Session`, `Account`, `Verification`) to the schema.
3. Drop the `Healthcheck` placeholder model from `Fix_01` — its only job was to keep `prisma generate` happy on an empty schema; the 4 new models now do that.
4. `pnpm db:push` — Atlas gains 4 collections (`user`, `session`, `account`, `verification`) + 5 indexes (2 unique, 3 lookup).
5. `pnpm prisma generate` — TypeScript types refresh; `prisma.user.*`, `prisma.session.*`, etc. autocomplete in the IDE.

After this commit, the server-side data layer for auth is complete. Nothing reads from these tables yet — `Day_23` ships the HTTP API surface (the catch-all route handler), and `Day_25`/`Day_26` ship the UI that writes to them.

## Summary

**Files at a glance**

| Group     | Files                                                                  |
| --------- | ---------------------------------------------------------------------- |
| Plan doc  | `plans/Day_22_Add_better_auth_server_config_and_prisma_models.md`      |
| App code  | `lib/auth.ts` (new)                                                    |
| Schema    | `prisma/schema.prisma` (4 models added by CLI; Healthcheck removed)    |
| Index     | `docs/README.md` (Auth Detour checklist row flipped)                   |

**What you'll run / what you'll see**

| Command                                                       | What it does                                                                                |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Write `lib/auth.ts`                                           | 11-line file: `betterAuth({ database: prismaAdapter(prisma, { provider: "mongodb" }), emailAndPassword: { enabled: true } })`. |
| `pnpm dlx @better-auth/cli generate --output prisma/schema.prisma --yes` | CLI loads `lib/auth.ts`, introspects features, appends 4 models to schema. Prints "🚀 Schema was overwritten successfully!" (misleading wording — existing models are preserved, just appended). |
| Edit schema: drop `Healthcheck`                               | Manually remove the 4-line placeholder + its comments. Update the comment block at the top to mention Better Auth. |
| `pnpm db:push`                                                | Atlas gets `user`, `session`, `account`, `verification` collections + their indexes. Output ends with "Your database indexes are now in sync." |
| `pnpm prisma generate`                                        | Refreshes `node_modules/.prisma/client/` so `prisma.user`, `prisma.session`, etc. have full TS types. |
| `pnpm typecheck && pnpm lint && pnpm build`                   | All green. `lib/auth.ts` compiles; existing routes unchanged. |
| Atlas UI → "Browse Collections"                               | Shows 4 new collections (all empty for now). |

> Densest commit of the detour. No new code on the request path yet — the API handler lands in `Day_23`.

## Commands

```bash
# Step 1: write lib/auth.ts (see Files changed below for content).

# Step 2: run the CLI to append models.
pnpm dlx @better-auth/cli generate --output prisma/schema.prisma --yes

# Step 3: manually edit prisma/schema.prisma to:
#   - Drop the Healthcheck model (4 lines)
#   - Drop the "Placeholder so prisma generate..." comments
#   - Update the top comment block to mention Better Auth

# Step 4: sync to Atlas.
pnpm db:push

# Step 5: refresh TS types.
pnpm prisma generate

# Step 6: full verification.
pnpm typecheck && pnpm lint && pnpm build
```

## Files changed

- `plans/Day_22_Add_better_auth_server_config_and_prisma_models.md` — **created**: this file.
- `lib/auth.ts` — **created**: 11 lines. Imports `betterAuth` from `better-auth`, `prismaAdapter` from `better-auth/adapters/prisma`, and the singleton `prisma` from `@/lib/prisma`. Exports `auth = betterAuth({ database: prismaAdapter(prisma, { provider: "mongodb" }), emailAndPassword: { enabled: true } })`. No Google, no magic-link — those land in `Day_32` and `Day_35` (`emailAndPassword` is the only enabled feature).
- `prisma/schema.prisma` — **edited**:
  - **Removed:** the `Healthcheck` model (created in `Fix_01`) and its placeholder comments.
  - **Added by CLI:** four models — `User`, `Session`, `Account`, `Verification` — with relations, indexes, and `@@map(...)` directives that map them to lowercase MongoDB collection names (`user`, `session`, `account`, `verification`).
  - **Updated:** the top-of-file comment block to mention that Better Auth's CLI generated these models.
  - **Surprise:** the CLI does NOT add `@db.ObjectId` annotations or `@default(auto())` (which Day_16's doc predicted it would). The Day_16 prediction was based on idiomatic Prisma+MongoDB code; Better Auth's CLI uses its own ID generation (token-based strings, not Mongo ObjectIds) so it intentionally leaves the IDs as plain `String @id @map("_id")`. This is correct behavior; the Day_16 prediction was slightly off.
- `docs/README.md` — **edited**: Auth Detour checklist row "`lib/auth.ts` Better Auth server config + User/Session/Account/Verification models in schema" flips from **Concepts pending ⏳** to **Concepts covered ✅**, tagged `Day_22`. Covered: 7 → 8; pending: 15 → 14.

## Verification

1. `cat lib/auth.ts` — 11 lines, exports `auth`, uses Prisma adapter with `provider: "mongodb"`.
2. `grep "model " prisma/schema.prisma` — shows exactly four model declarations: `User`, `Session`, `Account`, `Verification`. No `Healthcheck`.
3. `pnpm db:push` — output: "The database is already in sync with the Prisma schema." (after the initial push that created the collections).
4. `pnpm prisma generate` — exits 0; no errors.
5. `pnpm typecheck && pnpm lint && pnpm build` — all green.
6. **In MongoDB Atlas UI** → "Browse Collections" — shows 4 collections (user, session, account, verification), each currently empty (0 documents). 5 indexes total: `user.email` unique, `session.token` unique, `session.userId` non-unique, `account.userId` non-unique, `verification.identifier` non-unique.
7. **In your IDE** — typing `prisma.user.` should autocomplete with `findUnique`, `findMany`, `create`, etc., with full type info for the User fields.
8. `docs/README.md` Auth Detour Checklist: 8 covered, 14 pending, 4 deferred.

## Gotchas / decisions

- **The CLI says "overwritten" but actually appends.** Misleading output. The schema's `generator client` block, `datasource db` block, and any pre-existing models (like `Healthcheck`) are preserved. Only "the file's contents were rewritten to add the new models" is what's meant. Don't panic.
- **The 4 generated models use plain `String @id @map("_id")`, not `@db.ObjectId @default(auto())`.** This contradicts Day_16's prediction. Reason: Better Auth generates its own ID strings (token-based, e.g. for sessions) rather than letting MongoDB assign ObjectIds. The ID field is still a string, still stored in MongoDB's `_id` field, but it's *not* a Mongo ObjectId. This is intentional Better Auth design.
- **`Day_16`'s "Applied to Buddies" schema preview was slightly wrong.** The model shapes are correct (fields, relations, indexes) but the ID-field annotations are different. Worth noting in a future Bug_NN doc or Day_16 erratum if we want to be rigorous. For now, the difference is benign — `String @id @map("_id")` works fine, just less Mongo-idiomatic than `@db.ObjectId`.
- **`@@map(...)` directives** rename the MongoDB collections to lowercase (`user`, `session`, etc.) while keeping the Prisma model names PascalCase (`User`, `Session`). Better Auth's convention. Atlas UI shows the lowercase names.
- **`db push` won't drop the `Healthcheck` collection from Atlas.** Even with `--accept-data-loss`, Prisma reports "already in sync" because the model is no longer in the schema — but the orphan collection (with 0 docs) persists in MongoDB. To clean it up, you can manually drop it in the Atlas UI ("Browse Collections" → click `Healthcheck` → ⋯ → "Drop Collection"). Harmless if left in place. Documenting here for completeness.
- **5 indexes created.** Two unique (`user.email`, `session.token`), three non-unique (`session.userId`, `account.userId`, `verification.identifier`). The unique-on-`email` is what enforces "one account per email"; without it, two `User` rows could share an email. The unique-on-`token` enforces "no two sessions share a cookie value."
- **Atlas TLS connectivity blip during testing.** During the first `db push` attempt, Atlas threw "fatal alert: InternalError" for all three replica-set nodes — turned out to be an IP allowlist or paused-cluster issue that resolved itself (or was fixed in the Atlas dashboard) within ~5 minutes. The retry succeeded. If you hit this in the future: check Atlas dashboard for cluster status and IP allowlist before assuming code is broken.
- **`postinstall: prisma generate`** (from `Fix_01`) will now generate against the real 4-model schema on every install. The Healthcheck workaround can be considered fully retired.
- **Nothing in `app/` references the new tables yet.** `lib/auth.ts` is exported but unimported. `prisma.user` is typed but uncalled. The next two commits (`Day_23` for the route handler, `Day_25` for sign-up) are the first users.
- **The Day_22 commit doesn't touch `.env.local`.** `BETTER_AUTH_SECRET` is already set from `Day_21`; `DATABASE_URL` from `Day_17`. Nothing new needed.
