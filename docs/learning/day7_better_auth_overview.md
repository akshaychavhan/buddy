# Day 7 — Better Auth Overview: What It Is and Why We Picked It

> **Created:** 2026-05-15
> **Phase:** 3 — Auth & Backend Wiring (pulled forward by the Auth Detour)

---

## 🎯 What Are We Learning?

**Better Auth** — the authentication library we're building Buddies' auth on top of. By the end of this doc you should be able to:

1. Explain what Better Auth *is* in one sentence (a TypeScript-first auth library that runs in your own Node process, talks to your own DB via an adapter, and exposes auth flows as plain function calls).
2. Compare it to the other options you'd reach for in 2026 — Clerk, NextAuth/Auth.js, Lucia, Supabase Auth, custom-rolled-with-bcrypt — and articulate the trade-offs.
3. Sketch its architecture: where the server config lives, where the API endpoints live, where it stores sessions, how plugins extend it.
4. Predict which files in Buddies will need to know about Better Auth (small list: `lib/auth.ts`, `app/api/auth/[...all]/route.ts`, the two Server Action files, the layout that checks the session).

We *use* this knowledge starting `Day_20` (the install learning doc) and especially `Day_22` (the actual `lib/auth.ts` config).

---

## 🤔 Why Does This Matter?

Auth is the single most common place where small projects ship broken code. The mistakes range from "stored passwords in plain text" (catastrophic) to "session token never expires" (annoying) to "OAuth callback URL leaks a CSRF token" (exploitable). Building your own auth is a way to learn things you don't want to learn the hard way.

So the question is never "should I use an auth library?" — it's "*which* one?"

Buddies could pick Clerk (hosted SaaS) and have sign-in working in 10 minutes. We could pick NextAuth/Auth.js — the de-facto default in the Next.js ecosystem for years. We could pick Lucia (small, minimalist, was popular in 2023–2024). We could pick Supabase Auth (bundled with their DB). Or we could write it ourselves with `bcrypt` and a `Session` table.

Each picks a different point in the trade-off space. Knowing where Better Auth sits — and why we picked that point — means future-you can explain "we use Better Auth because [reason X], and if [reason X] stops being true we'd revisit." That's the rigor we want.

---

## 🧠 How It Works (The Concept)

### What Better Auth *is*

Better Auth is a TypeScript library that you `pnpm add` into your project. It runs **inside your own Node process** (the same Next.js server that serves your pages), reads from **your own database** (via a pluggable adapter — Prisma, Drizzle, raw SQL), and exposes auth flows (sign-up, sign-in, session lookup, password reset, OAuth handshake) as plain function calls.

You configure it once in a file like `lib/auth.ts`:

```ts
// lib/auth.ts (simplified — full version lands in Day_22)
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "mongodb" }),
  emailAndPassword: { enabled: true },
});
```

Then you mount its HTTP handlers at `app/api/auth/[...all]/route.ts`:

```ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

And in Server Components / Server Actions you read the session:

```ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const session = await auth.api.getSession({ headers: headers() });
if (!session) redirect("/sign-in");
```

Three files. One config, one handler, one read. That's the API surface.

### Better Auth's architecture (at a glance)

```
┌─────────────────────────────────────────────────────────────┐
│  Browser                                                     │
│   ├─ form POST /api/auth/sign-up/email                       │
│   ├─ form POST /api/auth/sign-in/email                       │
│   ├─ POST /api/auth/sign-out                                 │
│   └─ GET  /api/auth/callback/google  ← OAuth round-trip      │
└─────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│  Next.js (Buddies)                                           │
│   app/api/auth/[...all]/route.ts                             │
│      └─ delegates everything to Better Auth's handler         │
│                                                              │
│   lib/auth.ts  (the betterAuth() instance)                   │
│      ├─ emailAndPassword: { enabled: true }                  │
│      ├─ socialProviders: { google: {...} }    (Day_35)       │
│      ├─ plugins: [magicLink({ sendMagicLink })] (Day_32)     │
│      └─ database: prismaAdapter(prisma, { provider: "mongodb" })
└─────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│  Prisma + MongoDB Atlas                                      │
│   User       — id, email, name, image, emailVerified         │
│   Session    — id, userId, token, expiresAt, ip, ua          │
│   Account    — id, userId, providerId, accountId, password   │
│   Verification — id, identifier, value, expiresAt            │
└─────────────────────────────────────────────────────────────┘
```

Three layers. The browser POSTs forms; the Next.js route handler delegates to Better Auth; Better Auth talks to Prisma; Prisma stores in MongoDB.

### How sessions work

Better Auth sets an **httpOnly cookie** named `better-auth.session_token` after sign-in. The cookie's value is the *token* — a random string — and Better Auth looks up the corresponding `Session` row in the DB by that token on every `getSession()` call.

This is the "database-backed session" pattern. Alternatives include JWTs (token *is* the data, no DB lookup) and stateful in-memory sessions (DB lookup but the data is cached in process memory). Better Auth picks DB-backed for two reasons: invalidation is easy (delete the row → user is signed out), and you can read the session from any process without a shared cache.

For Buddies the trade-off is fine — every API call already touches MongoDB anyway, so a `findUnique` on `Session` is cheap.

### Plugins

Better Auth's core is just email/password + session management. **Everything else is a plugin:**

- `socialProviders` (built-in but plugin-shaped) — Google, GitHub, Facebook, Apple, Discord, etc.
- `magicLink` plugin — email-link sign-in, what we'll add in `Day_32`
- `twoFactor` plugin — TOTP / SMS
- `passkey` plugin — WebAuthn / FIDO2
- `organization` plugin — multi-tenant orgs with member roles
- `admin` plugin — admin-only API endpoints

For the detour we'll use: email/password (core), magic-link (plugin in `Day_32`), Google social provider (in `Day_35`). All other plugins stay off.

### Type safety

Better Auth is **fully typed**, end to end. The `auth.api.getSession(...)` call returns a `Session & { user: User }` type that's *generated from your Better Auth config*. Add a custom field to the `User` model in your Better Auth config → TypeScript knows about it everywhere.

This is one of the bigger pitches over NextAuth/Auth.js (which historically had spotty TS types and required a lot of manual `next-auth.d.ts` augmentation).

---

## 💻 Comparison to Alternatives

### vs Clerk

**Clerk** is hosted SaaS. You point your app at Clerk's APIs; Clerk stores your users; Clerk handles OAuth, MFA, sign-up UI components, the works.

| | Clerk | Better Auth |
|---|---|---|
| Users stored | In Clerk's DB | In your DB |
| Time-to-first-sign-in | ~10 min | ~30 min (Day_19–Day_28) |
| Per-user cost | $0 up to 10k MAU then $25+/month | Free forever |
| Lock-in | High — migrating off Clerk = data export + custom migration | Low — your DB, your code |
| UI components | Drop-in `<SignIn />` React components | You build the form yourself |
| Compliance / audit | Clerk handles | You handle |

**Why not Clerk?** Cost trajectory + lock-in + you don't learn anything. Buddies is a learning project; "click two buttons in Clerk's dashboard" is the *opposite* of what we want.

### vs NextAuth / Auth.js

**NextAuth** is the old default. Renamed to **Auth.js** in 2023. Ships with built-in providers, used by tens of thousands of Next.js projects.

| | NextAuth / Auth.js | Better Auth |
|---|---|---|
| Maturity | Battle-tested, 7+ years old | Newer (2024+) but stable |
| TypeScript | Historically spotty; module augmentation needed | Native, types from config |
| API surface | Configuration-driven, hooks-based on client | Function calls, server-first |
| Plugin model | Adapters + providers | Adapters + providers + plugins |
| Session strategy | JWT (default) or DB | DB (default) |
| Documentation | Mature but sometimes outdated | Newer but actively maintained |

**Why not NextAuth?** Two things: (1) the API surface is more configuration-heavy than function-call-heavy, which felt verbose; (2) Better Auth's TypeScript story is stronger out of the box, and the auth detour is a place where types pay off (you want `session.user.id` to be typed without ceremony). NextAuth would have been a fine choice — this is a preference, not a verdict.

### vs Lucia

**Lucia** was the minimalist option from 2023–2024. Designed as a small toolkit you assemble, not a full library.

| | Lucia | Better Auth |
|---|---|---|
| Status | **Lucia v3 was deprecated by the author in 2025** — recommended to migrate to other libs | Active development |
| Philosophy | "Roll your own auth, with a tiny toolkit" | "Batteries-included library" |

**Why not Lucia?** It's deprecated. Lucia's author recommends migrating to libs like Better Auth or Auth.js, so this is the natural successor for projects that wanted Lucia's vibe.

### vs Supabase Auth

**Supabase Auth** is bundled with Supabase's hosted Postgres + storage + realtime DB.

| | Supabase Auth | Better Auth |
|---|---|---|
| Database | Supabase (Postgres) only | Any (Prisma adapter supports Mongo, Postgres, MySQL, SQLite) |
| Hosted | Yes (Supabase Cloud) | Self-hosted in your Node process |

**Why not Supabase?** We've already picked MongoDB (in PROMPT.md's Day 6 decision); Supabase forces Postgres. Switching to Supabase would mean rewriting `Day_15`/`Day_16`'s Prisma+Mongo work.

### vs custom-rolled (bcrypt + Session table + cookies + crypto.randomBytes)

| | Custom-rolled | Better Auth |
|---|---|---|
| Lines of code you write | ~500 (sign-up, sign-in, sign-out, sessions, CSRF, rate-limit, password reset, magic-link, OAuth) | ~50 |
| Pitfalls you can hit | All of them | Few (library handles the boilerplate) |
| Learning value | Very high | Medium |

**Why not custom?** Pedagogical *value* of custom-rolled is high, but Buddies is also trying to ship features (trips, expenses, maps). Better Auth is the right altitude — you understand what's happening (the doc explains it line-by-line), you write the config and the forms, but you don't reinvent CSRF protection.

### Decision summary

Better Auth wins on:
- **Your DB, your code** (no lock-in, no SaaS bill).
- **TypeScript-first** (no module augmentation).
- **Active maintenance** (post-Lucia, this is the "fresh-faced" option).
- **Plugin model** matches our roadmap (need magic-link → install the plugin; need passkeys → install the plugin).

Better Auth loses on:
- **Smaller community** vs NextAuth (you'll find fewer Stack Overflow answers).
- **Younger** — fewer years of "I hit this gotcha in production" wisdom.

For a 2026 learning project where the cost trajectory of Clerk would bite by 2027 and NextAuth's TS story is the secondary annoyance — Better Auth is the right call. If we'd been building this in 2022, the answer would have been NextAuth.

---

## 🚀 Applied to Buddies

> See: [Task — Auth Detour](../task/) — task doc will land during the detour.

What Better Auth touches in Buddies, file by file:

| File | Created in | Better Auth role |
|---|---|---|
| `lib/auth.ts` | `Day_22` | `betterAuth({...})` instance with config |
| `prisma/schema.prisma` | `Day_22` (additions) | adds `User`, `Session`, `Account`, `Verification` models via CLI |
| `app/api/auth/[...all]/route.ts` | `Day_23` | route handler that delegates GET/POST to Better Auth |
| `app/(auth)/sign-up/page.tsx` | `Day_25` | form posts to Better Auth via Server Action |
| `app/(auth)/sign-up/actions.ts` | `Day_25` | server action calls `auth.api.signUpEmail(...)` |
| `app/(auth)/sign-in/page.tsx` | `Day_26` | replaces Day_07 stub; form posts to Better Auth |
| `app/(auth)/sign-in/actions.ts` | `Day_26` | server action calls `auth.api.signInEmail(...)` |
| `app/(app)/actions.ts` | `Day_28` | sign-out action calls `auth.api.signOut(...)` |
| `app/(app)/layout.tsx` | edited `Day_28` + `Day_30` | reads session via `auth.api.getSession(...)`, redirects + shows session state |
| `lib/email.ts` | `Day_32` | magic-link email sender; wired into Better Auth's `magicLink` plugin |

Ten files. The bulk of the auth detour is *not* in Better Auth itself — it's in writing the UI forms and the Server Actions that call into Better Auth. That ratio is the win: Better Auth handles the security-critical bits; we focus on the UX.

---

## ⚠️ Gotchas & Beginner Mistakes

1. **Don't import `@/lib/auth` into a Client Component.** Same rule as Prisma — `@/lib/auth` indirectly imports `@prisma/client`, which is Node-only. Always reach auth through Server Components, Server Actions, or route handlers.

2. **The route handler must be a catch-all** (`[...all]`), not a specific path. Better Auth handles a *family* of endpoints (`/api/auth/sign-up/email`, `/api/auth/sign-in/email`, `/api/auth/sign-out`, `/api/auth/session`, `/api/auth/callback/google`, etc.). The catch-all is what routes all of them to Better Auth's handler.

3. **`BETTER_AUTH_SECRET` must be set in production.** In dev, Better Auth will use a deterministic default if the env var is missing — but it'll yell in the logs. In production, missing the secret means anyone can forge session tokens. We'll generate it in `Day_21` and put it in `.env.local`.

4. **`BETTER_AUTH_URL` must match the actual deployment URL.** OAuth providers check the redirect URI; if `BETTER_AUTH_URL` says `https://buddies.example.com` but you've deployed to `https://buddies.example.com.preview-12.vercel.app`, OAuth callbacks will fail with `redirect_uri_mismatch`. Easy to forget on preview deploys.

5. **Sessions are stored in the DB.** Sign-out works by deleting the session row. If your DB is unreachable, sign-out fails silently. The user is *also* effectively signed out (no session can be looked up), but it's worth knowing the mechanism.

6. **Passwords are hashed with scrypt by default.** Better Auth doesn't use bcrypt; it uses scrypt (Node's built-in, similar threat model). You don't write the hashing code — it's a config detail.

7. **Better Auth's TypeScript types are *generated from your config*.** If you add a custom field to `User` in `lib/auth.ts`, you need to re-generate (and `pnpm prisma generate` after the schema change). Stale types are a real source of confusion.

8. **`auth.api.getSession()` is synchronous in some examples, async in others.** It's `async` in Next.js (because reading the request headers is sync but the DB lookup is async). Always `await` it.

---

## 🧪 Quick Quiz

**1.** In one sentence, what does Better Auth do?

<details>
<summary>Show answer</summary>

It's a TypeScript auth library that runs in your Node process, stores users/sessions in your DB via a Prisma (or other) adapter, and exposes sign-up/sign-in/session-lookup as plain function calls — with email/password built in and OAuth/magic-link/passkeys/etc as plugins.
</details>

**2.** Why didn't we pick Clerk?

<details>
<summary>Show answer</summary>

Three reasons: (1) Clerk stores users in *their* DB, which means lock-in — migrating off later costs us a data export and a custom migration. (2) Clerk's free tier is generous but it caps at 10k MAU; we'd be paying $25+/month once Buddies grew, where Better Auth stays free forever. (3) "Click two buttons in Clerk's dashboard" doesn't teach us anything about how sessions, tokens, and OAuth actually work.
</details>

**3.** Where does Better Auth store session data?

<details>
<summary>Show answer</summary>

In our database — a `Session` row per active session, keyed by a random token that's also stored in an httpOnly cookie on the user's browser. Every `getSession()` call looks up the row by token. Sign-out works by deleting the row. Different from JWT-based auth (where the token IS the data) — Better Auth is "database-backed sessions."
</details>

**4.** What does `app/api/auth/[...all]/route.ts` do?

<details>
<summary>Show answer</summary>

It's a Next.js catch-all route handler that delegates every `/api/auth/*` request to Better Auth. Better Auth handles a family of endpoints — `/api/auth/sign-up/email`, `/api/auth/sign-in/email`, `/api/auth/sign-out`, `/api/auth/session`, `/api/auth/callback/google` — and the catch-all matches all of them with one file.
</details>

**5.** Can I import `@/lib/auth` in a Client Component?

<details>
<summary>Show answer</summary>

No. `@/lib/auth` imports `@/lib/prisma`, which is Node-only (uses filesystem and TCP sockets that don't exist in the browser). Always reach the session through a Server Component, Server Action, or route handler. If a Client Component needs the user's name, fetch it on the server and pass it as a prop.
</details>

---

## 📌 Key Takeaways

- **Better Auth runs in your Node process** and stores in **your DB** via the Prisma adapter — no SaaS, no lock-in.
- **Three-file architecture:** `lib/auth.ts` (config), `app/api/auth/[...all]/route.ts` (handler), `app/(auth)/*/actions.ts` (your Server Actions calling into auth).
- **Database-backed sessions** — `Session` row + httpOnly cookie. Sign-out deletes the row.
- **Plugin model** — core is email/password + sessions; OAuth/magic-link/passkeys/2FA/orgs are plugins.
- **TypeScript types generated from config** — adding a custom `User` field updates types everywhere.
- **Won over Clerk** (lock-in, cost), **NextAuth** (TS story, API verbosity), **Lucia** (deprecated), **Supabase Auth** (forces Postgres), **custom-rolled** (security risk + slower).
- **Server-only** — never import `@/lib/auth` into a `"use client"` file.
- **`BETTER_AUTH_SECRET` is critical in production**, `BETTER_AUTH_URL` must match the deployed URL or OAuth callbacks fail.

---

## 🔗 References

- [Better Auth — Official docs](https://www.better-auth.com/docs/introduction)
- [Better Auth — Prisma adapter](https://www.better-auth.com/docs/adapters/prisma)
- [Better Auth — Plugins overview](https://www.better-auth.com/docs/concepts/plugins)
- [Better Auth — Comparison vs NextAuth](https://www.better-auth.com/docs/comparison) (the author's framing)
- [Lucia deprecation notice](https://github.com/lucia-auth/lucia/discussions/1707) — why we didn't pick Lucia
- Local: [Day 6 — Prisma in Next.js](./day6_prisma_in_nextjs.md) — the singleton Better Auth's adapter will reuse
- Local: [Day 6 — MongoDB with Prisma](./day6_mongodb_with_prisma.md) — why the four auth models need `@db.ObjectId` everywhere

---

## ➡️ What's Next?

- **`Day_20` (next commit)** — Learning doc: the Better Auth install + Prisma-adapter flow, *before* we actually install it. Walks through what the CLI does, what `lib/auth.ts` will look like, what the four generated models will be.
- **`Day_21`** — `pnpm add better-auth`. Manual step: generate `BETTER_AUTH_SECRET` with `openssl rand -base64 32` and paste into `.env.local`. Adds Google OAuth env vars to `.env.example` now (avoid churn later).
- **`Day_22`** — First *real* `lib/auth.ts`. Runs the Better Auth CLI to write four models into `prisma/schema.prisma`. `pnpm db:push` applies them to Atlas.
- **`Day_23`** — `app/api/auth/[...all]/route.ts`. After this, `curl /api/auth/session` returns `null`-session JSON instead of 404.
