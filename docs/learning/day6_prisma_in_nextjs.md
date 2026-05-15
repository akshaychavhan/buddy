# Day 6 — Prisma in Next.js: The Global-Singleton Pattern

> **Created:** 2026-05-15
> **Phase:** 2 — Core App Plumbing (pulled forward by the Auth Detour)

---

## 🎯 What Are We Learning?

How to wire **Prisma** — our type-safe database client — into a Next.js App Router project without leaking database connections during development. Three things:

1. **What `PrismaClient` is** — a generated, fully-typed query API for our database. Strict typing comes from running `prisma generate` against `prisma/schema.prisma`.
2. **The global-singleton pattern** — why instantiating `new PrismaClient()` on every module import in Next.js dev mode is a bug, and the ~10-line fix that solves it.
3. **Where Prisma code is allowed to live** — server-only. Never imported into a Client Component, never bundled to the browser.

By the end of this doc you should know exactly what file `Day_18` will create (`lib/prisma.ts`) and why every Prisma usage in this codebase will go through it.

We use this rule starting `Day_18` (creating the singleton) and continuously through the rest of the auth detour (every `auth.ts` and Server Action reads from `prisma`).

---

## 🤔 Why Does This Matter?

Imagine writing this in three places:

```ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export async function getTrips() { return prisma.trip.findMany(); }
```

It works. Each call instantiates a Prisma client, opens a database connection, queries, returns. Fine in production.

But Next.js dev mode does something subtle: **Fast Refresh re-evaluates modules on every save**. Each re-evaluation runs that `new PrismaClient()` line again. Each new client opens a new connection pool. After 10 saves, you have 10 connection pools. After an hour of coding, your MongoDB Atlas free-tier hits its connection limit and reads start failing with mysterious "too many connections" errors.

The fix is to **store the single client on `globalThis`** so Fast Refresh sees the same instance across re-evaluations. Five extra lines of code, zero connection leaks, identical behavior in production (where `globalThis` doesn't matter because there's no re-evaluation).

This isn't a Prisma-specific quirk — it's how *every* "create once, reuse forever" client should be wired in Next.js dev. Future days will use the same pattern for the Resend email client, the Cloudinary uploader, and so on.

---

## 🧠 How It Works (The Concept)

### `PrismaClient` is generated, not imported from a library

When you run `pnpm prisma generate`, Prisma reads `prisma/schema.prisma` and writes a TypeScript module into `node_modules/.prisma/client/`. That module is what `@prisma/client` re-exports.

So the type of `prisma.user.findUnique(...)` literally depends on the *current state* of your schema. Add a `name String` field to the `User` model → re-run `pnpm prisma generate` → `prisma.user.create({ data: { ... } })` now requires `name`.

**Practical consequence:** every time you edit `prisma/schema.prisma`, you must re-run `prisma generate`. Most projects wire this into `postinstall` so CI doesn't forget. Buddies will too — `Day_18`'s plan covers the `package.json` script setup.

### The singleton pattern

The classic Next.js Prisma pattern is this:

```ts
// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

// Reuse the same instance across Fast Refresh in dev.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

Let's unpack what each line does:

1. **`globalForPrisma`** — a typed view of `globalThis` that lets us pretend it has a `prisma` slot. `globalThis` is the same object across all module evaluations within a single Node process, so anything stored on it survives Fast Refresh.

2. **`export const prisma = globalForPrisma.prisma ?? new PrismaClient()`** — if `globalThis.prisma` already exists (because we instantiated it on a previous module load), reuse it. Otherwise, create a fresh client. The `??` operator does the right thing for `undefined`.

3. **`if (process.env.NODE_ENV !== "production")`** — only store on `globalThis` in dev. In production there's no Fast Refresh, so the assignment is harmless — but skipping it makes the intent explicit and avoids potential issues with multi-process serverless cold starts (each worker gets its own client, which is what we want there).

The result: every `import { prisma } from "@/lib/prisma"` in the codebase gets the same client instance throughout a dev session. Connection pool stays at one.

### Server-only — full stop

`PrismaClient` is a Node.js library. It uses the filesystem (`@prisma/client`'s engine binary), TCP sockets, environment variables. **None of this exists in the browser.**

If you accidentally import `@/lib/prisma` into a Client Component, Next.js will yell — and rightly so. Two ways this happens by accident:

1. You import a helper that *itself* imports prisma into a `"use client"` file. The whole transitive graph gets shipped to the browser. Build error.
2. You forget to mark a server action correctly. Server Actions are server-side by default; just don't `"use client"` the wrapper.

To defend against (1), some teams use the `server-only` package:

```ts
// lib/prisma.ts
import "server-only";
// ...
```

That single import throws a build-time error if `lib/prisma.ts` ever ends up in a client bundle. We won't add `server-only` yet — we'll see if accidents happen first — but the option is on the table.

### Where Prisma lives in the App Router

```
lib/
└── prisma.ts        ← singleton instance, the ONLY place new PrismaClient() runs

app/
├── api/auth/[...all]/route.ts   ← imports `prisma` (Day_23)
├── (auth)/sign-up/actions.ts    ← imports `prisma` (Day_25)
├── (auth)/sign-in/actions.ts    ← imports `prisma` (Day_26)
└── (app)/layout.tsx             ← imports `auth` (which imports prisma) (Day_30)
```

Every Server Component, Server Action, and route handler reaches `prisma` through the singleton. Never `new PrismaClient()` anywhere else.

---

## 💻 Tiny Isolated Example

The smallest possible usage:

```ts
// lib/prisma.ts — the singleton
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

```tsx
// app/(app)/trips/page.tsx — eventual usage (Day 6 proper)
import { prisma } from "@/lib/prisma";

export default async function TripsPage() {
  const trips = await prisma.trip.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <ul>
      {trips.map((t) => <li key={t.id}>{t.name}</li>)}
    </ul>
  );
}
```

Two files. The first is wired once and never touched again. The second is a Server Component that `awaits` the DB query directly — no `useEffect`, no client-side fetch, no API route in between. **This is the App Router's data-fetching pitch in one component.**

For the auth detour specifically, we won't query `prisma.trip` yet (that's Day 6 proper). But `prisma.user` and `prisma.session` will get plenty of action starting `Day_22`.

---

## 🚀 Applied to Buddies

> See: [Task — Auth Detour](../task/) — task doc will be added during the detour.

The auth detour's Prisma touchpoints (across the next ~20 commits):

| File | Created in | Reads `prisma` for |
|---|---|---|
| `lib/prisma.ts` | `Day_18` | the singleton itself |
| `lib/auth.ts` | `Day_22` | Better Auth's Prisma adapter passes `prisma` to Better Auth |
| `app/api/auth/[...all]/route.ts` | `Day_23` | session reads via Better Auth handlers |
| `app/(auth)/sign-up/actions.ts` | `Day_25` | indirectly via Better Auth (`auth.api.signUpEmail`) |
| `app/(auth)/sign-in/actions.ts` | `Day_26` | indirectly via Better Auth |
| `app/(app)/layout.tsx` (edited) | `Day_30` | `auth.api.getSession(...)` for the route guard |

Notice: **most code doesn't import `prisma` directly.** Better Auth wraps it. Your application code calls Better Auth APIs and Better Auth talks to Prisma underneath. Clean separation.

---

## ⚠️ Gotchas & Beginner Mistakes

1. **Don't `new PrismaClient()` anywhere except `lib/prisma.ts`.** Every other file imports the singleton. If you find yourself typing `new PrismaClient(` elsewhere, you're about to leak connections in dev. Search the codebase for `new PrismaClient` periodically — there should be exactly one match.

2. **Re-run `prisma generate` after every schema edit.** Otherwise TS will use stale types and the runtime will mismatch. Symptoms: `prisma.newModel is undefined`, type errors saying a field doesn't exist when it clearly does in schema. Fix: `pnpm prisma generate` and reload your editor's TS server.

3. **Don't import `@/lib/prisma` into a Client Component.** It'll either fail to compile (`@prisma/client` can't be bundled for the browser) or — if you somehow get it past the build — leak server secrets. Server-only code stays in Server Components, Server Actions, and route handlers.

4. **`globalThis` is per-process, not per-request.** The singleton is shared across all in-flight requests in a single Node process. That's fine: `PrismaClient` is designed for concurrent use; you don't need a client per request.

5. **MongoDB doesn't migrate — it pushes.** Unlike PostgreSQL/MySQL with `prisma migrate`, MongoDB with Prisma uses `prisma db push`. The schema becomes a JSON validator on the collection; there are no migration files. This makes dev iteration fast and makes "rolling back a schema change" mean "edit the schema and push again." Don't look for migration files — they don't exist.

6. **`process.env.DATABASE_URL` is read once at startup.** If you change it in `.env.local` while `pnpm dev` is running, restart the dev server. Same applies to all env vars Prisma reads.

7. **Prisma logs are noisy in dev.** Once you start running queries, you'll see SQL-like logs in the terminal. If you want to suppress: `new PrismaClient({ log: [] })`. We'll keep them on during the detour so the user can *see* the queries fire.

8. **The CLI vs the runtime.** `pnpm prisma <something>` runs the **CLI**. `import { prisma } from "@/lib/prisma"` runs the **client**. They share a schema but they're different tools. Schema operations (`generate`, `db push`, `studio`) are CLI; queries (`findMany`, `create`) are client.

---

## 🧪 Quick Quiz

**1.** Why is `new PrismaClient()` directly inside `app/(app)/trips/page.tsx` a bug in Next.js dev mode?

<details>
<summary>Show answer</summary>

Every Fast Refresh re-evaluates the module, which runs `new PrismaClient()` again. Each new instance opens its own database connection pool. Over a coding session you accumulate dozens of pools and hit MongoDB Atlas's connection limit. The singleton on `globalThis` ensures one client instance survives all re-evaluations.
</details>

**2.** Why does the singleton store on `globalThis` only when `NODE_ENV !== "production"`?

<details>
<summary>Show answer</summary>

Production doesn't have Fast Refresh — modules are evaluated once at startup, so there's no re-evaluation to worry about. Storing on `globalThis` in production is a no-op at best and a footgun at worst (in serverless environments where multiple workers might race). Guarding with the env check makes the intent explicit and avoids any cross-worker weirdness.
</details>

**3.** Can I `import { prisma } from "@/lib/prisma"` inside a Client Component (`"use client"`)?

<details>
<summary>Show answer</summary>

No. `@prisma/client` is a Node-only package — it uses the filesystem, TCP sockets, and env vars that don't exist in the browser. Next.js will refuse to compile, or worse, the build will succeed but the page will crash on hydration. Always reach the DB through Server Components, Server Actions, or route handlers — and pass the *resulting data* (plain JSON) to Client Components as props.
</details>

**4.** I edited `prisma/schema.prisma` to add a `nickname String?` field on `User`. `prisma.user.create(...)` still doesn't accept `nickname` in the type. Why?

<details>
<summary>Show answer</summary>

The generated client is stale. Run `pnpm prisma generate` and reload your editor's TypeScript server. Some teams hook `prisma generate` into `postinstall` or a pre-commit hook so it never gets out of sync.
</details>

**5.** Where do migrations live for our MongoDB setup?

<details>
<summary>Show answer</summary>

They don't. Prisma+MongoDB uses `prisma db push` — the schema is applied directly as a JSON validator on the collection. No `prisma/migrations/` folder, no `_prisma_migrations` table. If you need to roll back, edit the schema and push again. Day 16's learning doc covers this in more detail.
</details>

---

## 📌 Key Takeaways

- **`PrismaClient` is generated** from `prisma/schema.prisma` via `pnpm prisma generate`. Edit schema → regenerate.
- **One instance per process.** Use the global-singleton pattern in `lib/prisma.ts`. Everything else imports from there.
- **The `globalThis` trick is only needed in dev** — production has no Fast Refresh, so the env-guarded assignment skips the store.
- **Server-only.** Never import `@/lib/prisma` into a `"use client"` file. Use Server Components, Server Actions, and route handlers as the boundary.
- **MongoDB doesn't migrate** — it pushes. Day 16 details this.
- **Most app code reaches Prisma indirectly** — through Better Auth, through Server Actions. Direct queries are for pages that render lists or details.
- **Run `prisma generate` after every schema edit**, and reload the TS server.

---

## 🔗 References

- [Prisma docs — Best practice for instantiating Prisma Client with Next.js](https://www.prisma.io/docs/orm/more/help-and-troubleshooting/help-articles/nextjs-prisma-client-dev-practices)
- [Prisma docs — Generating the client](https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/generating-prisma-client)
- [Next.js docs — Server Components data fetching](https://nextjs.org/docs/app/building-your-application/data-fetching/fetching)
- [`server-only` package on npm](https://www.npmjs.com/package/server-only) — optional guard against accidental client imports
- Local: [Day 2 — Server vs Client Components](./day2_rsc_vs_client_components.md) — the Server/Client boundary `prisma` must respect

---

## ➡️ What's Next?

- **`Day_16` (next commit)** — Learning doc: MongoDB-with-Prisma quirks. `ObjectId`, `@map("_id")`, why no migrations.
- **`Day_17`** — Manual MongoDB Atlas provisioning. No code change — you set up the cloud cluster and paste the connection string into `.env.local`.
- **`Day_18`** — Create `lib/prisma.ts` (the singleton from this doc) and add a `"db:push"` script to `package.json`. First code commit of the auth detour.
- **`Day_22`** — Better Auth + Prisma adapter; the four auth models join `prisma/schema.prisma`. First commit to actually *use* the singleton.
