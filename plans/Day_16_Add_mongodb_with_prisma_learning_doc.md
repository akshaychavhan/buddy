# Day_16_Add_mongodb_with_prisma_learning_doc

## Goal

Second doc-first commit of the Auth Detour. Teaches the MongoDB-specific quirks of using Prisma — the `ObjectId` type, the `id String @id @default(auto()) @map("_id") @db.ObjectId` idiom, why there are no migrations (only `prisma db push`), how relations are faked without JOINs, and the small set of Prisma features that don't carry over from the SQL-flavored version. After reading this, the reader will recognize *exactly* what Better Auth's CLI generates in `Day_22` and be able to extend the schema with new models confidently.

Pure docs commit — no code, no schema edits, no `prisma db push` run. The schema will be edited only when models actually exist to be edited.

## Summary

**Files at a glance**

| Group     | Files                                                          |
| --------- | -------------------------------------------------------------- |
| Plan doc  | `plans/Day_16_Add_mongodb_with_prisma_learning_doc.md`         |
| Learning  | `docs/learning/day6_mongodb_with_prisma.md`                    |
| Index     | `docs/README.md` (Learning Journal + Auth Detour checklist row) |

**What you'll run / what you'll see**

| Command                                                    | What it does                                                                                |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Open `docs/learning/day6_mongodb_with_prisma.md`           | ~330 lines: ObjectId mechanics, the 5-part ID idiom, foreign-key `@db.ObjectId`, `db push` semantics, why no migrations, relations faking, index syntax, the predicted Better Auth schema diff, 8 gotchas, 5-question quiz. |
| Open `docs/README.md` Learning Journal                     | Phase 2 → Day 6 now lists **two** docs (this one joins Day_15's singleton-pattern doc). |
| Open `docs/README.md` Auth Detour Checklist                | "MongoDB-with-Prisma quirks" row flips from pending → covered. Covered: 2, pending: 20. |

> Pure docs commit. The first time the schema is actually edited is `Day_22` (Better Auth CLI generates models).

## Commands

```bash
# Nothing to run. Reading the doc IS the work.
# Optional sanity check:
pnpm typecheck && pnpm lint
```

## Files changed

- `plans/Day_16_Add_mongodb_with_prisma_learning_doc.md` — **created**: this file.
- `docs/learning/day6_mongodb_with_prisma.md` — **created**: ~330-line learning doc following PROMPT.md §2.1. Sections:
  - **What/Why**: most Prisma tutorials assume Postgres; MongoDB support diverges in three key places (IDs, migrations, relations).
  - **How It Works**:
    - ObjectId mechanics (timestamp + machine + process + counter; rendered as 24-char hex; sortable by creation time).
    - The 5-part ID idiom unpacked: `id String`, `@id`, `@default(auto())`, `@map("_id")`, `@db.ObjectId`.
    - Foreign keys also need `@db.ObjectId` (the silent-failure trap).
    - `prisma db push` is stateless (no migration files); how it updates JSON validators + indexes.
    - Why MongoDB doesn't have traditional migrations.
    - Relations faked via separate queries (Prisma stitches N+1; fine for sane data sizes).
    - Indexes declared in-schema via `@unique`, `@@unique`, `@@index`.
    - Features that don't apply: `prisma migrate dev/deploy`, raw SQL, advanced index types, DB-level FK constraints.
  - **Tiny Isolated Example**: a minimal User + Session schema showing every annotation, plus a query that returns user + unexpired sessions.
  - **Applied to Buddies**: the **predicted** full schema diff for `Day_22` (four Better Auth models — User, Session, Account, Verification — with every annotation called out). Reading this is preparation for the diff that lands in `Day_22`.
  - **Gotchas**: 8 items including missing `@db.ObjectId` on FKs, `prisma migrate dev` fails, no auto-backfill, `@map("_id")` mandatory, app-level cascade, `prisma studio` for debugging.
  - **Quiz**: 5 questions with `<details>` answers covering the ID idiom, missing-ObjectId silent failure, no migration files, app-level cascade, DateTime mapping.
- `docs/README.md` — **edited** twice:
  1. **Auth Detour Coverage Checklist:** moves the "MongoDB-with-Prisma quirks" row from **Concepts pending ⏳** to **Concepts covered ✅**, tagged `Day_16`. Covered count: 1 → 2; pending: 21 → 20.
  2. **Learning Journal Phase 2 → Day 6:** adds the new doc as a second entry under the Day 6 subsection.

## Verification

1. Open `docs/learning/day6_mongodb_with_prisma.md` — title is "MongoDB with Prisma: ObjectIds, `@map("_id")`, and No Migrations", contains the 5-part ID idiom unpack, the predicted four-model schema for `Day_22`, the 8 gotchas, and 5 quiz items in `<details>` blocks.
2. Open `docs/README.md` — under **Phase 2 → Day 6** in Learning Journal there are now **two** entries: `day6_prisma_in_nextjs.md` and `day6_mongodb_with_prisma.md`.
3. Open `docs/README.md` — Auth Detour Checklist shows MongoDB-with-Prisma row under **Concepts covered ✅** with `Day_16` tag. Covered count is **2**, pending is **20**.
4. Run `git log --oneline -2` — top two commits are `Day_16_Add_mongodb_with_prisma_learning_doc` and `Day_15_Add_prisma_in_nextjs_learning_doc`.
5. Run `ls docs/learning/day6_*.md` — exactly two files.
6. `pnpm typecheck && pnpm lint` — both pass.

## Gotchas / decisions

- **The "Applied to Buddies" section shows the FUTURE schema, not the current one.** This is intentional: the reader sees the exact diff that lands in `Day_22` before it lands, so when the diff appears, every line is recognizable. The current `prisma/schema.prisma` still has only the empty datasource block — that's correct for the moment.
- **No schema edit in this commit.** Same convention as `Day_05` (the layouts doc didn't create any folders; the code commit did). Doc-first means "doc explains the upcoming code change before it lands."
- **No `prisma db push` run** because the schema is still empty. Running `db push` against an empty schema does nothing meaningful — it'll be exercised for the first time in `Day_22` when there are actual models.
- **The doc is intentionally heavy on the negative space.** "Prisma+Mongo *doesn't* have migrations / *doesn't* have raw SQL / *doesn't* enforce FK constraints" — these are the surprises a Postgres user brings into this codebase. Naming them in the doc means they won't hit as surprises mid-debug.
- **Where the Auth Detour checklist row moves to:** **Concepts covered ✅** — even though no code shipped. Reason: the *learning* concept is covered. Codifying that "MongoDB-with-Prisma quirks" is a concept the reader holds in mind is what this commit accomplishes. The "MongoDB Atlas provisioned" row stays pending — that's `Day_17`, a separate concept (cloud provisioning vs Prisma idioms).
- **Tracker notes column unchanged.** Day 2 row is still "11 of 12 commits"; the tracker won't change until `Day_36`'s close-out. Auth Detour progress lives in the new checklist, not the tracker.
