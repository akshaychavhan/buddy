# Day 7 — Better Auth Install: Package, Adapter, Schema-Generation Flow

> **Created:** 2026-05-15
> **Phase:** 3 — Auth & Backend Wiring (pulled forward by the Auth Detour)

---

## 🎯 What Are We Learning?

The end-to-end **install + setup flow** for Better Auth before we actually execute it. Three pieces:

1. **The package install** — what `pnpm add better-auth` brings in, what `BETTER_AUTH_SECRET` is and how to generate it.
2. **The Prisma adapter** — how Better Auth talks to our Mongo DB via the singleton from `Day_18`, and what the minimal `lib/auth.ts` config will look like.
3. **The CLI schema-generation flow** — `pnpm dlx @better-auth/cli generate` reads `lib/auth.ts` and writes the four auth models (User, Session, Account, Verification) into `prisma/schema.prisma`. After that, `pnpm db:push` syncs the new collections to Atlas.

By the end of this doc you can predict every diff that lands in the next three commits (`Day_21`, `Day_22`, `Day_23`). Doc-first preserved.

---

## 🤔 Why Does This Matter?

In `Day_19` we picked Better Auth and looked at its architecture from 10,000 feet. Now we zoom in to the *exact installation steps* — because two things are easy to get wrong:

1. **The CLI overwrites your schema file.** If you've hand-edited `prisma/schema.prisma`, the CLI's generate command might clobber your changes. Knowing what the CLI produces (before it produces it) means you can review the diff confidently instead of squinting at `git diff` afterward.

2. **The secret and the URL are foot-gun env vars.** Set `BETTER_AUTH_SECRET` to a non-random string ("changeme", a fixed dev secret committed in `.env`, etc.) and you've shipped a security hole. Set `BETTER_AUTH_URL` to the wrong value in production and OAuth callbacks fail with a `redirect_uri_mismatch` that's hard to debug. Both have safe defaults in this doc.

Reading the install flow once means the upcoming three commits are routine execution.

---

## 🧠 How It Works (The Concept)

### Step 1 — Install the package

```bash
pnpm add better-auth
```

That's it. One direct dependency. Internally Better Auth depends on:

- `arctic` (OAuth provider helpers — used when we add Google in `Day_35`)
- `oslo` (cookie + token utilities, password hashing)
- `kysely` (lightweight query builder used internally; we don't touch it)

You don't `pnpm add` any of these explicitly — Better Auth pulls them in. Net effect on `package.json`: one new `"better-auth": "^X.Y.Z"` line under `dependencies`. The lockfile grows; the source tree gains one line.

### Step 2 — Generate `BETTER_AUTH_SECRET`

Better Auth signs session tokens, magic-link tokens, and CSRF tokens with this secret. The threat model: if an attacker learns it, they can forge any session token. So:

```bash
openssl rand -base64 32
```

Produces something like:

```
eK2sR7nL9pV4mB3xZ6wQ8jT5dF1hG0yC=
```

Paste into `.env.local`:

```env
BETTER_AUTH_SECRET="eK2sR7nL9pV4mB3xZ6wQ8jT5dF1hG0yC="
```

Rules:
- Different secret in production (don't reuse the dev one).
- Never commit `.env.local` (it's gitignored).
- If you ever suspect it leaked: rotate. The rotation invalidates every active session — every user has to sign back in. Acceptable cost for a security recovery.

### Step 3 — Sketch `lib/auth.ts`

The minimal Better Auth config — what `Day_22` will land:

```ts
// lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "mongodb" }),
  emailAndPassword: { enabled: true },
});
```

Five lines of config. Three things to internalize:

- **`database: prismaAdapter(prisma, { provider: "mongodb" })`** — Better Auth uses our singleton from `lib/prisma.ts` (the one we built in `Day_18`). The `provider: "mongodb"` flag tells the adapter "use ObjectId/`@map("_id")` conventions" — important because the same adapter supports Postgres and SQLite where IDs are integers.
- **`emailAndPassword: { enabled: true }`** — turns on the email/password flow. Without this flag, sign-up/sign-in by password is *off*. Later we'll add `socialProviders: { google: {...} }` and `plugins: [magicLink({...})]` — but those are `Day_32` and `Day_35` work; for `Day_22` we keep it minimal.
- **No `secret`, no `baseURL` props in this snippet.** Better Auth reads `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` from `process.env` automatically. The env vars must be set; the code doesn't reference them.

### Step 4 — Run the CLI to generate the schema

This is the magic step. `Day_22` will run:

```bash
pnpm dlx @better-auth/cli generate --output prisma/schema.prisma
```

What happens:

1. The CLI imports `lib/auth.ts` (so `lib/auth.ts` must already exist — it's a chicken-and-egg ordering hint for `Day_22`).
2. It introspects which features are enabled (email/password? OAuth? magic-link? 2FA?).
3. For each enabled feature, it figures out which DB tables are required.
4. It **rewrites** `prisma/schema.prisma`, **appending** the required models (it preserves existing models — won't clobber your `Trip` model later when we add one).
5. The output is **stable** — running the CLI twice produces the same schema. So we can re-run after enabling more features (`Day_32` magic-link adds a `Verification`-table reuse; `Day_35` Google OAuth adds nothing new because the `Account` model already supports providers).

The four models the CLI writes (for our config — email/password + Mongo):

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
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model Account {
  id                    String    @id @default(auto()) @map("_id") @db.ObjectId
  userId                String    @db.ObjectId
  providerId            String                                    // "credential" | "google" | ...
  accountId             String                                    // provider's user id, or email for credential
  password              String?                                   // scrypt-hashed; credential provider only
  accessToken           String?
  refreshToken          String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  idToken               String?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([providerId, accountId])
  @@index([userId])
}

model Verification {
  id         String   @id @default(auto()) @map("_id") @db.ObjectId
  identifier String                                                // usually email
  value      String                                                // the token
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([identifier])
}
```

This is the same schema [Day 6 — MongoDB with Prisma](./day6_mongodb_with_prisma.md) predicted in its "Applied to Buddies" section. When the CLI runs in `Day_22`, every line should be recognizable.

### Step 5 — Push to Atlas

```bash
pnpm db:push
```

Now that the schema has four models, `pnpm db:push` (which is `prisma db push --skip-generate`) creates four collections in Atlas with JSON validators and the declared indexes. First time you'll see real collections in the Atlas UI's "Browse Collections" view.

After this, run:

```bash
pnpm prisma:generate
```

To generate the TypeScript types for the new models. **This is the step that wakes up the IDE** — after running it, `prisma.user.findUnique(...)` autocompletes in your editor with the full field list.

### Step 6 — Mount the API handler

```ts
// app/api/auth/[...all]/route.ts (Day_23)
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

Three lines. The `[...all]` is a Next.js **catch-all** route segment — it matches `/api/auth/sign-up/email`, `/api/auth/sign-in/email`, `/api/auth/sign-out`, `/api/auth/session`, `/api/auth/callback/google`, and many more. Better Auth's `toNextJsHandler` returns `{ GET, POST }` functions that dispatch each path to the right Better Auth flow.

After `Day_23`'s commit:

```bash
curl -s http://localhost:3000/api/auth/session
# {"session": null}
```

Returns valid JSON (not 404). That's the green light for the API surface.

### The order matters

The above six steps must run in **this exact order**, because each depends on the previous:

1. `pnpm add better-auth` → otherwise `import { betterAuth }` fails to resolve.
2. `BETTER_AUTH_SECRET` in `.env.local` → otherwise Better Auth boots with a warning and an unsafe default in dev.
3. Write `lib/auth.ts` → otherwise the CLI in step 4 has nothing to introspect.
4. `pnpm dlx @better-auth/cli generate` → otherwise `prisma/schema.prisma` has no auth models.
5. `pnpm db:push` → otherwise Atlas has no collections to query.
6. Mount the route handler → otherwise the browser can't actually call any endpoints.

The detour spreads these steps across **three commits**:

- `Day_21` handles steps 1 + 2 (package install + env secret).
- `Day_22` handles steps 3 + 4 + 5 (config + CLI + push).
- `Day_23` handles step 6 (route handler).

Each commit is independently testable. After `Day_21`, `pnpm dev` runs but Better Auth has no DB tables yet. After `Day_22`, the schema is in Atlas but there's no HTTP entry point. After `Day_23`, the full server-side API is up — but no UI exists to call it. UI lands `Day_25` onward.

---

## 💻 Tiny Isolated Example

The full minimum setup, side-by-side:

```env
# .env.local
DATABASE_URL="mongodb+srv://..."         # Day_17
BETTER_AUTH_SECRET="<openssl rand -base64 32 output>"  # Day_21
BETTER_AUTH_URL="http://localhost:3000"  # already in .env.example from Infra_02
```

```ts
// lib/auth.ts (Day_22)
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "mongodb" }),
  emailAndPassword: { enabled: true },
});
```

```ts
// app/api/auth/[...all]/route.ts (Day_23)
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

Three files. ~15 lines of code in `lib/auth.ts` and the route handler combined. After `Day_23`, every Better Auth endpoint is reachable; the schema is in Mongo; the secret is signing tokens.

---

## 🚀 Applied to Buddies

> See: [Task — Auth Detour](../task/) — task doc will land alongside `Day_22`.

Across the next three commits, here's what changes:

| Commit | What changes |
|---|---|
| `Day_21` | `package.json` gets `"better-auth": "^X"`. `.env.local` gets `BETTER_AUTH_SECRET` (your machine only). `.env.example` gets `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` documented now (avoids churn in `Day_34`). |
| `Day_22` | `lib/auth.ts` created (the snippet above). `prisma/schema.prisma` gains four models via CLI. `pnpm db:push` populates Atlas. `pnpm prisma:generate` updates types. |
| `Day_23` | `app/api/auth/[...all]/route.ts` created (three lines). `curl /api/auth/session` returns JSON instead of 404. |

After `Day_23`: the **server-side auth API surface is complete**. You can sign up via curl:

```bash
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"correct horse battery staple","name":"Test"}'
```

This returns a session + sets a cookie. The UI to do this via a form lands `Day_25`.

---

## ⚠️ Gotchas & Beginner Mistakes

1. **Don't commit `BETTER_AUTH_SECRET` to git.** Put it in `.env.local` (gitignored), never `.env` (committed as defaults). If it ever lands in the repo, rotate immediately and force-pull the bad commit out of history (`git filter-repo` or `git filter-branch`).

2. **`lib/auth.ts` must exist before the CLI runs.** The CLI reads it to introspect features. Order: write the config, *then* run `pnpm dlx @better-auth/cli generate`. `Day_22` lands them together but in this order.

3. **Re-run `pnpm prisma:generate` after the CLI updates the schema.** The CLI updates `prisma/schema.prisma` but doesn't regenerate types — that's a separate step (and one we deliberately keep separate from `db:push`, see `Day_18`'s `--skip-generate` decision).

4. **The CLI's first run is non-trivial — second runs are idempotent.** After `Day_22`, re-running `pnpm dlx @better-auth/cli generate` would produce no diff (same config → same schema). You can re-run safely whenever you change `lib/auth.ts` (e.g. enabling magic-link in `Day_32`).

5. **`BETTER_AUTH_URL` must match the deployed URL.** In dev: `http://localhost:3000` (already in `.env.example`). In production: the canonical URL (e.g. `https://buddies.example.com`). If they mismatch, OAuth callbacks fail. The env var is consumed by Better Auth's URL-building code internally.

6. **The catch-all route handler must NOT use route groups in its path.** `app/api/auth/[...all]/route.ts` is correct; `app/(api)/auth/[...all]/route.ts` would be confusing because the URL becomes `/api/auth/*` anyway (the route group doesn't change the URL — see [Day 2 — Layouts and Route Groups](./day2_layouts_and_templates.md)) — but it's cleaner to keep API routes outside route groups by convention.

7. **`emailAndPassword: { enabled: true }`** is the *only* feature flag we set in `Day_22`. Default settings include reasonable scrypt params, 8-character minimum password length, and a 7-day session expiry. We accept the defaults; `Day_24`'s doc covers what they are.

8. **The CLI writes to `prisma/schema.prisma` — preserve your generator/datasource blocks.** The CLI is smart enough to *append* models, not clobber the file. But if you've heavily customized the generator block (e.g. multi-client setup), inspect the diff carefully. Our generator block is the default `prisma-client-js`, so there's no risk.

---

## 🧪 Quick Quiz

**1.** What does `pnpm dlx @better-auth/cli generate` do?

<details>
<summary>Show answer</summary>

It imports `lib/auth.ts`, introspects which features are enabled (email/password? OAuth? magic-link?), figures out which Prisma models are required for those features, and **appends** those models to `prisma/schema.prisma`. The CLI is idempotent — running it twice with the same config produces no diff. The generated schema is the source of truth.
</details>

**2.** Why does `lib/auth.ts` need to exist before the CLI runs?

<details>
<summary>Show answer</summary>

The CLI reads `lib/auth.ts` to figure out what features are enabled — without that file there's nothing to introspect. Order matters: write the config, then run the generate command. `Day_22` does them in this order in the same commit.
</details>

**3.** What's the difference between `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL`?

<details>
<summary>Show answer</summary>

`BETTER_AUTH_SECRET` is a high-entropy random string (32+ bytes) used to **sign tokens** — session tokens, magic-link tokens, CSRF tokens. If it leaks, an attacker can forge tokens — so it must stay in `.env.local` (gitignored) and be different in production.

`BETTER_AUTH_URL` is the canonical URL of your app — `http://localhost:3000` in dev, your real domain in prod. It's used in **OAuth redirect URI** construction; if it mismatches what's registered in Google Cloud Console (Day_34), OAuth callbacks fail with `redirect_uri_mismatch`. It's not a secret — but it does have to be correct.
</details>

**4.** After `Day_21` (install) but before `Day_22` (config + CLI + push), can I run `curl /api/auth/session` and get a valid response?

<details>
<summary>Show answer</summary>

No. Three reasons: (1) no `lib/auth.ts` exists yet, so the next-imports fail to resolve; (2) no DB tables exist yet, so any DB query would fail; (3) no `app/api/auth/[...all]/route.ts` route handler exists yet, so the URL 404s. All three of those are wrapped up by the end of `Day_23`. `Day_21` is just the package + the secret, nothing more.
</details>

**5.** I rotate `BETTER_AUTH_SECRET` in production. What happens to logged-in users?

<details>
<summary>Show answer</summary>

Every active session is invalidated — every user has to sign back in. That's because Better Auth's session token is signed with the secret; after rotation, the old signatures no longer verify. This is by design: rotation is a **security recovery** action (you'd do it if you suspected the old secret leaked), so forcing every user to re-authenticate is the *desired* outcome, not a regression. For routine maintenance (not security recovery), don't rotate.
</details>

---

## 📌 Key Takeaways

- **`pnpm add better-auth`** brings in one direct dep + ~3 transitives (`arctic`, `oslo`, `kysely`).
- **`BETTER_AUTH_SECRET`** signs tokens — generate with `openssl rand -base64 32`, store in `.env.local`, never commit, rotate on leak.
- **`BETTER_AUTH_URL`** is the canonical app URL — must match what OAuth providers see, otherwise callbacks fail.
- **`lib/auth.ts` config** is small: `database: prismaAdapter(prisma, { provider: "mongodb" })` + `emailAndPassword: { enabled: true }`. Reads env vars automatically.
- **`pnpm dlx @better-auth/cli generate`** introspects `lib/auth.ts` and appends required models to `prisma/schema.prisma`. **Order matters** — write `lib/auth.ts` first.
- **Six-step install flow**: install → secret → config → CLI generate → `db push` → mount route handler. Spread across `Day_21`/`Day_22`/`Day_23`.
- **After `Day_23`**, the server-side API surface is complete (`curl /api/auth/session` works). UI lands `Day_25` onward.
- **The CLI is idempotent** — safe to re-run when config changes (e.g. enabling magic-link in `Day_32`).

---

## 🔗 References

- [Better Auth — Installation](https://www.better-auth.com/docs/installation)
- [Better Auth — CLI](https://www.better-auth.com/docs/concepts/cli)
- [Better Auth — Prisma adapter](https://www.better-auth.com/docs/adapters/prisma)
- [Better Auth — Next.js integration](https://www.better-auth.com/docs/integrations/next)
- Local: [Day 7 — Better Auth Overview](./day7_better_auth_overview.md) — the architecture this install populates
- Local: [Day 6 — MongoDB with Prisma](./day6_mongodb_with_prisma.md) — predicted the four-model schema the CLI will write

---

## ➡️ What's Next?

- **`Day_21` (next commit)** — `pnpm add better-auth`. Generate `BETTER_AUTH_SECRET`. Scaffold Google OAuth env vars in `.env.example` (avoids churn in `Day_34`).
- **`Day_22`** — Write `lib/auth.ts` with the minimal config. Run `pnpm dlx @better-auth/cli generate`. Run `pnpm db:push`. Atlas gets four collections.
- **`Day_23`** — `app/api/auth/[...all]/route.ts`. After this, `curl /api/auth/session` returns valid JSON.
