# Day 6 — MongoDB with Prisma: ObjectIds, `@map("_id")`, and No Migrations

> **Created:** 2026-05-15
> **Phase:** 2 — Core App Plumbing (pulled forward by the Auth Detour)

---

## 🎯 What Are We Learning?

How Prisma's MongoDB support differs from its more popular PostgreSQL/MySQL support. Three things:

1. **MongoDB IDs aren't integers** — they're 24-character hex strings called **ObjectIds**. Prisma needs `@db.ObjectId` annotations on every ID + foreign-key field, and the standard ID idiom is `id String @id @default(auto()) @map("_id") @db.ObjectId`.
2. **There are no migrations** — only `prisma db push`. Schema changes apply to MongoDB collections directly, with no `prisma/migrations/` folder, no `_prisma_migrations` collection, no `migrate dev` / `migrate deploy` flow.
3. **Relations look different** — no `JOIN`s. Prisma fakes relations on top of MongoDB by storing ID references in arrays/fields. Some operations (raw queries, certain indexes) have MongoDB-specific syntax.

By the end of this doc you should be able to predict the exact `prisma/schema.prisma` we'll get out of `Day_22`'s Better Auth CLI run, recognize the four ID-field annotations on every model, and know which `prisma <command>`s are allowed and which aren't.

We *use* all this starting `Day_18` (`db:push` script) and especially `Day_22` (Better Auth CLI writes the four auth models with these exact annotations).

---

## 🤔 Why Does This Matter?

Most Prisma tutorials online assume PostgreSQL — `id Int @id @default(autoincrement())`, `prisma migrate dev`, integer foreign keys. That's the world Prisma was *born* in. MongoDB support is more recent and intentionally divergent.

If you skim a Postgres tutorial and paste its schema into a MongoDB project, three things happen:

1. **`prisma generate` works** (the types compile fine).
2. **`prisma db push` either fails with "ObjectId required" or silently creates a collection whose IDs are 32-bit ints**, which MongoDB hates.
3. **Foreign keys break at insert time** — MongoDB stores `_id` as ObjectIds; querying with an integer returns nothing.

Knowing the MongoDB-with-Prisma idioms means: (a) you read Better Auth's generated schema and immediately recognize *why* every line is shaped the way it is, (b) you can extend the schema with new models without breaking the conventions, and (c) you can debug "why doesn't my `findUnique` find this trip?" before reaching Stack Overflow.

---

## 🧠 How It Works (The Concept)

### MongoDB ObjectIds (the 24-char hex string)

MongoDB doesn't use auto-incrementing integers. Every document has an `_id` field — by default a **12-byte ObjectId** rendered as 24 hex characters (e.g. `507f1f77bcf86cd799439011`). The ObjectId encodes a timestamp + a machine identifier + a process identifier + a counter, which means:

- IDs are roughly sortable by creation time (the first 4 bytes are a Unix timestamp).
- IDs don't need a central authority — any client can generate one offline.
- Collisions are statistically impossible for sane workloads.

In Prisma terms, the type of a MongoDB ID is **`String`** (because that's how it serializes), but it needs the `@db.ObjectId` native-type annotation so Prisma knows to map it to MongoDB's ObjectId on read/write — not a plain string.

### The standard ID idiom

Every MongoDB model in a Prisma schema starts with this line:

```prisma
id String @id @default(auto()) @map("_id") @db.ObjectId
```

Let's unpack it:

- **`id String`** — the field is called `id` in your TypeScript code, typed as `String`.
- **`@id`** — this is the primary key.
- **`@default(auto())`** — when creating a new document, let MongoDB generate the ObjectId automatically. Don't pass `id` in `prisma.user.create({ data: { ... } })` — Mongo will assign one.
- **`@map("_id")`** — in the actual MongoDB document, the field is named `_id` (Mongo's reserved name), even though your code calls it `id`.
- **`@db.ObjectId`** — the native MongoDB type is `ObjectId`, not `string`.

You'll see this exact line at the top of every model: `User`, `Session`, `Account`, `Verification`, `Trip`, `Membership`, etc. Memorize it; it's the most-typed line in a Prisma+Mongo schema.

### Foreign keys (relations) need `@db.ObjectId` too

When one model references another by ID, the foreign-key field also needs `@db.ObjectId`. For example, in Better Auth's schema:

```prisma
model Session {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  userId    String   @db.ObjectId           // ← also ObjectId, not plain String
  // ... other fields
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

Skip the `@db.ObjectId` on `userId` and Prisma generates the client fine — but at query time, the join silently fails because Mongo treats your "string" foreign key as a literal string, not an ObjectId.

### No migrations — `prisma db push` instead

For PostgreSQL/MySQL, the lifecycle is:

```
edit schema → prisma migrate dev → migration file written → run on every env
```

For MongoDB, it's:

```
edit schema → prisma db push → schema applied directly to MongoDB
```

`prisma db push` is **stateless** — there's no record of what was pushed before. Each run "syncs the current schema to the current DB" by:

1. Updating MongoDB's JSON-schema validator on each collection (so future inserts must match).
2. Creating any new indexes you've added.
3. Optionally dropping fields/indexes the schema no longer mentions (with a confirmation prompt).

What `db push` does **not** do:

- It doesn't generate a migration file (no `prisma/migrations/` folder).
- It doesn't drop or rename collections automatically.
- It doesn't carry data through schema changes — adding a required field to an existing collection doesn't backfill; you need to write a one-off script or accept that old documents fail validation.

For dev work this is liberating: edit schema, push, done. For prod migration of real data, you'd write your own scripts.

### Why no migrations?

MongoDB historically didn't enforce a schema at all — every document in a collection could have different fields. The schema-validation feature was added later, and it's optional. So "migrating" doesn't really mean "altering tables" the way it does in SQL; it means "updating the JSON validator and trusting your code to update documents in bulk if needed."

Prisma's MongoDB support follows this model: there's no equivalent of `ALTER TABLE`, so there's no migration file. Just push the latest schema and write data-migration scripts on the side when needed.

### Relations: Prisma fakes them

MongoDB has no `JOIN`. Prisma fakes relations by:

- For **1:N** (User has many Sessions): the child model (`Session`) has a `userId String @db.ObjectId` field; Prisma populates `user` by issuing a second query when you `include: { user: true }`.
- For **N:N** (Trip has many Buddies, Buddy has many Trips): one side stores `tripIds String[] @db.ObjectId`; the other stores `buddyIds String[] @db.ObjectId`. Prisma issues N+1 queries to materialize. Performance is fine for small lists; you'd switch to an aggregation pipeline for large ones.

For the auth detour we only need 1:N relations (User has many Sessions, User has many Accounts, etc.) — Better Auth's schema is the canonical example.

### Indexes: declared in-schema, applied by `db push`

```prisma
model User {
  id    String @id @default(auto()) @map("_id") @db.ObjectId
  email String @unique
}
```

The `@unique` on `email` becomes a unique index in MongoDB after `db push`. Compound indexes:

```prisma
@@index([userId, expiresAt])
@@unique([provider, providerAccountId])
```

These compile to MongoDB indexes. `prisma studio` (the GUI) shows them; `db.collection.getIndexes()` in the Mongo shell shows them.

### What's *not* available in Prisma+Mongo

Honesty check — some Prisma features don't work or work differently in MongoDB mode:

- **`prisma migrate dev` / `prisma migrate deploy`** — Postgres/MySQL only. Use `db push` instead.
- **Raw SQL** (`$queryRaw`) — replaced by `$runCommandRaw` for raw MongoDB commands.
- **Some advanced index types** (gin, gist, full-text in Postgres) — MongoDB has its own equivalents but Prisma doesn't surface all of them yet.
- **Foreign-key constraints at the DB level** — MongoDB doesn't enforce them. Cascade behaviors (`onDelete: Cascade`) are implemented in Prisma at the application level: when you delete a User, Prisma issues a second `deleteMany` for related Sessions. Skip the Prisma client and delete via the Mongo shell, and the cascade doesn't run.

None of these matter for the auth detour, but worth knowing so you don't reach for tools that won't work.

---

## 💻 Tiny Isolated Example

A minimal MongoDB-flavored Prisma schema:

```prisma
// prisma/schema.prisma — minimal example

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

model User {
  id        String    @id @default(auto()) @map("_id") @db.ObjectId
  email     String    @unique
  name      String?
  createdAt DateTime  @default(now())
  sessions  Session[]
}

model Session {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  userId    String   @db.ObjectId
  expiresAt DateTime
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}
```

After `pnpm prisma db push`:
- MongoDB has two collections: `User` and `Session`.
- `User` has a unique index on `email`.
- `Session` has an index on `userId`.
- Deleting a `User` (via Prisma) cascades to delete their `Session`s.

A query:

```ts
const user = await prisma.user.findUnique({
  where: { email: "akshay@rtledgers.com" },
  include: { sessions: { where: { expiresAt: { gt: new Date() } } } },
});
```

Returns a `User` with an array of unexpired sessions. Two MongoDB queries fire under the hood: one for `User`, one for `Session`. Prisma stitches them in app code.

---

## 🚀 Applied to Buddies

> See: [Task — Auth Detour](../task/) — task doc will land during the detour.

In `Day_22`, Better Auth's CLI will write **four** models into `prisma/schema.prisma`:

```prisma
model User {
  id            String    @id @default(auto()) @map("_id") @db.ObjectId
  email         String    @unique
  emailVerified Boolean   @default(false)
  name          String?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  sessions      Session[]
  accounts      Account[]
}

model Session {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  userId    String   @db.ObjectId
  token     String   @unique
  expiresAt DateTime
  ipAddress String?
  userAgent String?
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model Account {
  id                    String    @id @default(auto()) @map("_id") @db.ObjectId
  userId                String    @db.ObjectId
  providerId            String                                    // "credential" | "google" | ...
  accountId             String                                    // the provider's own user id, or email for credential
  password              String?                                   // hashed (credential provider only)
  accessToken           String?
  refreshToken          String?
  accessTokenExpiresAt  DateTime?
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([providerId, accountId])
  @@index([userId])
}

model Verification {
  id         String   @id @default(auto()) @map("_id") @db.ObjectId
  identifier String                                                // usually email
  value      String                                                // the token
  expiresAt  DateTime

  @@index([identifier])
}
```

Notice every ID and every foreign key has the `@db.ObjectId` annotation. The `@unique` and `@@unique` and `@@index` declarations become MongoDB indexes after `db push`. The relations cascade-delete from User down to Sessions and Accounts (Verification is independent — it's the email-verification + magic-link token store).

Expect this exact diff in `prisma/schema.prisma` after `Day_22`'s CLI run. Recognizing every piece is the payoff of reading this doc first.

---

## ⚠️ Gotchas & Beginner Mistakes

1. **Forgetting `@db.ObjectId` on a foreign key.** `userId String` compiles fine but queries silently return nothing because Mongo expects an ObjectId, not a plain string. Always: `userId String @db.ObjectId`.

2. **Trying `prisma migrate dev` on MongoDB.** Fails with "MongoDB doesn't support migrations." Use `prisma db push`. This is *not* a setup error — it's a fundamental difference.

3. **No automatic backfill on schema changes.** Adding `nickname String?` is harmless (existing docs default to null). Adding `nickname String` (required) means existing docs fail validation and writes succeed but reads-with-strict-validation will start failing. Always make new fields optional in dev, or backfill before tightening.

4. **`@map("_id")` is required, not optional.** Forget it and Prisma will look for a field literally named `id` in your MongoDB documents, won't find it (because Mongo uses `_id`), and every read returns no rows. The error message is unhelpful. Always include `@map("_id")` on the ID field of every model.

5. **`prisma.user.create({ data: { id: "..." } })` is a footgun.** With `@default(auto())`, Mongo generates the ID. If you pass your own ID string, Prisma will *try* to use it — but it has to be a valid 24-char ObjectId hex, or Mongo rejects the insert. Just don't pass `id`; let `auto()` work.

6. **`onDelete: Cascade` is app-level, not DB-level.** Bypass Prisma (e.g. delete a User directly in `mongosh`) and the cascade doesn't run. Sessions and Accounts become orphaned. If you ever need to do bulk deletes outside the Prisma client, write a script that uses the Prisma client.

7. **`prisma studio` works with MongoDB.** It's a useful GUI to inspect the auth tables after sign-up. Run `pnpm prisma studio` — opens on `localhost:5555`. We'll use this during the detour to verify sign-up creates a User + Account row.

8. **Compound indexes have a syntax surprise.** `@@unique([provider, accountId])` becomes a compound unique index in Mongo. `@@index([userId, expiresAt])` becomes a compound non-unique index. The order matters for query optimization — most-selective field first.

---

## 🧪 Quick Quiz

**1.** What does each part of `id String @id @default(auto()) @map("_id") @db.ObjectId` do?

<details>
<summary>Show answer</summary>

- `id String` — field named `id` in TypeScript, typed as `String`
- `@id` — primary key
- `@default(auto())` — MongoDB auto-generates the ObjectId on insert
- `@map("_id")` — actual MongoDB field name is `_id`, not `id`
- `@db.ObjectId` — native MongoDB type is `ObjectId` (binary 12-byte), not a plain string

Five distinct directives on one field. Memorize the line — every MongoDB model needs it.
</details>

**2.** Why does my Prisma query `prisma.session.findMany({ where: { userId: someUserIdString } })` return zero rows even though the session exists in MongoDB?

<details>
<summary>Show answer</summary>

Most likely the `userId` field in your schema is missing the `@db.ObjectId` annotation. Without it, Prisma queries with a plain string; MongoDB stores ObjectIds and doesn't match plain strings to them. Fix: `userId String @db.ObjectId` in the schema, run `prisma generate`, restart your dev server.
</details>

**3.** Where do my migration files live for the MongoDB-flavored Prisma setup?

<details>
<summary>Show answer</summary>

They don't exist. MongoDB-with-Prisma uses `prisma db push` exclusively — there's no `prisma/migrations/` folder, no migration history, no `_prisma_migrations` collection. The schema is "the source of truth"; each `db push` syncs it to the DB. For prod data migrations, write one-off scripts using the Prisma client.
</details>

**4.** I want to delete a user and have all their sessions go away too. Does Prisma's `onDelete: Cascade` work for MongoDB?

<details>
<summary>Show answer</summary>

Yes — but it's enforced *at the application layer*, not the database. When you call `prisma.user.delete({ where: { id } })`, Prisma's client first runs a `deleteMany` on Sessions where `userId` matches, then deletes the User. If you delete the User outside Prisma (e.g. in `mongosh`), no cascade runs and Sessions become orphaned. Always go through the Prisma client for app-level operations.
</details>

**5.** Can I store a `Date` field on a MongoDB model?

<details>
<summary>Show answer</summary>

Yes — Prisma's `DateTime` type maps to MongoDB's native `Date` (BSON Date, milliseconds since epoch). Standard pattern: `createdAt DateTime @default(now())` and `updatedAt DateTime @updatedAt`. Reads come back as JavaScript `Date` objects in TypeScript. No string parsing needed.
</details>

---

## 📌 Key Takeaways

- **MongoDB IDs are 24-char hex ObjectIds**, not integers. Use `id String @id @default(auto()) @map("_id") @db.ObjectId`.
- **Foreign keys need `@db.ObjectId` too**. Skip it and queries silently fail to match.
- **No migrations** — use `prisma db push`. Schema is the source of truth; each push syncs to the DB. No `prisma/migrations/` folder.
- **Relations are faked** — no JOIN, Prisma issues separate queries and stitches. Fine for sane data sizes.
- **Indexes declared in-schema** (`@unique`, `@@unique`, `@@index`) become MongoDB indexes after `db push`.
- **`onDelete: Cascade` is app-level.** Bypass Prisma → no cascade. Always delete through the client.
- **`prisma migrate dev` doesn't work** in MongoDB mode. `prisma db push` is the only schema-sync tool.
- **`prisma studio` works** — useful for inspecting Users/Sessions during the auth detour.

---

## 🔗 References

- [Prisma docs — MongoDB connector](https://www.prisma.io/docs/orm/overview/databases/mongodb)
- [Prisma docs — Prototyping your schema with `db push`](https://www.prisma.io/docs/orm/prisma-migrate/workflows/prototyping-your-schema)
- [MongoDB docs — ObjectId](https://www.mongodb.com/docs/manual/reference/method/ObjectId/)
- [Better Auth docs — Prisma adapter](https://www.better-auth.com/docs/adapters/prisma) (will be referenced in Day_20's doc)
- Local: [Day 6 — Prisma in Next.js: The Global-Singleton Pattern](./day6_prisma_in_nextjs.md) — the singleton this schema will be queried through

---

## ➡️ What's Next?

- **`Day_17` (next commit)** — Manual MongoDB Atlas provisioning. The plan file walks you through creating a free-tier cluster, the IP allowlist, the DB user, and pasting the connection string into `.env.local`. No code change.
- **`Day_18`** — First code commit of the detour. Creates `lib/prisma.ts` (the singleton from Day_15's doc), adds a `"db:push"` npm script.
- **`Day_22`** — Better Auth's CLI writes the four auth models into `prisma/schema.prisma`. The "Applied to Buddies" section above is the schema you'll see in the diff.
