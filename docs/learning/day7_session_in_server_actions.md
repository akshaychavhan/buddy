# Day 7 — Reading the Session: `auth.api.getSession` in Server Components and Actions

> **Created:** 2026-06-08
> **Phase:** 3 — Auth & Backend Wiring (pulled forward by the Auth Detour)

---

## 🎯 What Are We Learning?

How a Server Component (or Server Action) **reads the current user's session** without writing client-side `fetch` calls, `useEffect`s, or session-context providers. After `Day_26` shipped, a user can sign up and sign in — but the rest of the app doesn't *know* they're signed in. Now we wire that knowledge into the server-render path.

By the end of this doc you should be able to:

1. Call `auth.api.getSession({ headers: await headers() })` from any Server Component, Server Action, or route handler and explain why this returns the session or `null`.
2. Know exactly what shape comes back — `{ user, session }` — and which fields are on each.
3. Build a session-aware UI in pure JSX: render *different markup* (signed-in vs signed-out) at the server, ship zero JavaScript for the branching logic.
4. Recognize when session-reading code accidentally drifts into a Client Component (and how to spot the cascade of errors).
5. Understand the difference between **`getSession`** (synchronous DB lookup) and **route-level protection** — the second is Day_29/Day_30's territory; this doc is about *reading*, not *gating*.

`Day_28` (the next code commit) applies everything here: sign-out action + a header that shows "Sign out" when authenticated, "Sign in" otherwise.

---

## 🤔 Why Does This Matter?

In a Pages-Router or Vite app, "is the user signed in?" usually flowed like this:

```tsx
"use client";
const { data: session, status } = useSession();      // NextAuth's client hook
if (status === "loading") return <Skeleton />;
if (!session) return <SignedOutHeader />;
return <SignedInHeader user={session.user} />;
```

Three problems:
- **Client-side fetch on every page**. The browser loads the page, then asks the server "am I signed in?", then re-renders. A flash of signed-out UI is common.
- **Hydration mismatch risk**. Server renders one thing (often "loading"), browser hydrates to another.
- **JavaScript for state management**. The whole "is the user signed in?" tree ships to the browser.

App Router collapses all of this:

```tsx
// app/(app)/layout.tsx (Server Component)
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function AppLayout({ children }) {
  const session = await auth.api.getSession({ headers: await headers() });
  return (
    <div>
      <Header session={session} />
      {children}
    </div>
  );
}
```

The session check runs **on the server**, **before any HTML is sent**. The browser receives a fully-rendered page that already shows the right header. No flicker. No client-side JS for the branching. No `useSession` hook.

For Buddies this means: the user sees their name in the header the instant the page paints — exactly the experience Clerk or NextAuth give you, but with our own DB and ~10 lines of code.

---

## 🧠 How It Works (The Concept)

### The session is in a cookie; the lookup hits the DB

When a user signs in (via `Day_26`'s flow), Better Auth set a cookie:

```
better-auth.session_token=<random-token>; HttpOnly; SameSite=Lax; Max-Age=604800
```

The cookie's *value* is the token. The token itself contains no user data. To find out who's signed in, Better Auth has to:

1. Read the cookie from the request headers.
2. Look up the `Session` row in MongoDB where `token` matches.
3. Check `expiresAt` is in the future.
4. Join the `Session` to the `User` row.
5. Return both.

That's what `auth.api.getSession({ headers })` does in one call. It takes the request's headers (so it can read the cookie), runs the lookup, returns `{ user, session } | null`.

### The exact return shape

```ts
const session = await auth.api.getSession({
  headers: await headers(),
});

// session is:
//
// {
//   session: {
//     id: string,               // ObjectId-ish — Better Auth's own random ID
//     token: string,            // matches the cookie value
//     userId: string,           // points at user.id
//     expiresAt: Date,          // 7 days from sign-in by default
//     ipAddress: string | null,
//     userAgent: string | null,
//     createdAt: Date,
//     updatedAt: Date,
//   },
//   user: {
//     id: string,
//     name: string,
//     email: string,
//     emailVerified: boolean,
//     image: string | null,
//     createdAt: Date,
//     updatedAt: Date,
//   },
// }
//
// ...or null if no cookie / cookie is stale / session is expired.
```

Two important details:
- **It's `null`, not undefined.** Cleanly checkable: `if (!session) return <SignedOutThing />;`.
- **The `user` is the database row.** Whatever's in your `User` model is here. Today that's `name`, `email`, `image`. Tomorrow if we add `nickname`, we'll get it for free after rerunning `prisma generate`.

### Where you can call it

The same `auth.api.getSession({ headers })` call works in:

| Caller                          | When it runs                              | Example use |
|---|---|---|
| Server Component                | During SSR/RSC render of any page or layout | Header that shows the user's name |
| Server Action                   | When a form submits or `formAction` fires | Sign-out: read the session to know whose to delete; trip create: stamp `createdBy` |
| Route Handler (`route.ts`)      | When `/api/something` is hit              | `/api/my-trips` returning the current user's trips |
| Middleware (Edge)               | ⚠️ Not directly — see gotchas             | We don't use middleware in this detour |

All four contexts have access to `headers()` from `next/headers` (or the request object). The session call shape is identical.

### The 3-line pattern Day_28's header will ship

```tsx
// components/header.tsx (Server Component)
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function Header() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <header>
      <Link href="/">Buddies</Link>
      {session ? (
        <SignOutButton userName={session.user.name} />
      ) : (
        <Link href="/sign-in">Sign in</Link>
      )}
    </header>
  );
}
```

The conditional `session ? ... : ...` runs **server-side**. The browser sees either a sign-in link or a sign-out button — never both, never a flicker. The `<SignOutButton>` itself is a small Client Component (it has an `onClick` or a `<form action>`), but the *decision* about which to render is server-side.

### Sign-out: a one-line Server Action

```ts
// app/(app)/actions.ts
"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function signOutAction() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/sign-in");
}
```

Internally `signOut`:
1. Reads the session cookie from `headers`.
2. Looks up the `Session` row.
3. Deletes it from Mongo.
4. Sets a `Set-Cookie` header that clears `better-auth.session_token`.
5. Returns.

The user is now signed out. The redirect kicks them back to `/sign-in`.

### Why we don't use a client-side `useSession()` hook

Better Auth ships a `createAuthClient` for client-side use. We're not using it for one reason: **performance**.

A client-side `useSession()` hook fetches the session over the network from `/api/auth/get-session`. That's an extra round-trip on every page load, after the page already rendered. The server-side `auth.api.getSession({ headers })` happens *during* the initial render — zero extra round-trips, no flicker.

We'll consider the client SDK later if we ever need *reactive* session state in the browser (e.g. a multi-tab "you got signed out" indicator). For Day 7, server-side reads cover 95% of needs.

---

## 💻 Tiny Isolated Example

The smallest useful session-aware page:

```tsx
// app/me/page.tsx (Server Component)
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function MePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div>
      <h1>Hello {session.user.name}</h1>
      <p>Signed in as {session.user.email}</p>
      <p>Session expires {session.session.expiresAt.toLocaleString()}</p>
    </div>
  );
}
```

A 15-line page that:
- Reads the session server-side.
- Redirects to `/sign-in` if absent.
- Shows the user's name + email + session expiry if present.
- Ships **zero JavaScript** to the browser.

Compare that to the Pages-Router equivalent (probably 60+ lines with `getServerSideProps`, `useSession`, redirects, loading states). The App Router is *small* once you internalize the pattern.

---

## 🚀 Applied to Buddies

> See: [Task — Auth Detour](../task/) — task doc will land alongside `Day_28`.

`Day_28` ships two things in one commit:

| File | Role |
|---|---|
| `app/(app)/actions.ts` | Server Action `signOutAction()` — calls `auth.api.signOut`, redirects to `/sign-in` |
| `app/(app)/layout.tsx` (edit) | Reads session via `auth.api.getSession(...)`. Header now conditionally renders: "Sign in" link when logged out, user-name + "Sign out" button (a tiny Client form posting to `signOutAction`) when logged in |

After `Day_28`:
- Logged-out user visits `/` → header shows "Sign in" link → clicks → goes to `/sign-in` → signs in → redirected to `/` → header now shows their name + "Sign out".
- Click "Sign out" → session row deleted from Mongo → cookie cleared → redirect to `/sign-in`.

No client-side state. No `useSession` hook. No flicker.

`Day_30` (Phase D) goes further: the `(app)` layout will *redirect* unauthenticated users away from `/trips`, not just show a "Sign in" link. That's route protection. This doc is just about *reading*; the protection layer comes next.

---

## ⚠️ Gotchas & Beginner Mistakes

1. **Always `await headers()`.** Next.js 14.2's `headers()` is technically sync (returns `ReadonlyHeaders`), but Next 15 makes it async, and Better Auth's API expects `Promise<Headers> | Headers`. `await headers()` works in both versions — sync values pass through `await` as no-ops. Future-proof at zero cost.

2. **Never call `getSession` from a Client Component.** `auth.api.*` imports `@/lib/auth`, which transitively imports `better-auth`, which transitively imports `@/lib/prisma` and DB drivers. Bundling any of that for the browser fails. If you need session info in a Client Component, **pass it as a prop** from the Server Component parent: `<SomeClientThing user={session.user} />`.

3. **`session` is `null`, not `undefined`.** Better Auth uses `null` consistently. Always: `if (!session) ...` or `if (session === null) ...`. Don't write `if (session === undefined)`.

4. **Performance: one call per render is fine; ten calls is wasteful.** If your layout calls `getSession`, and the page also calls `getSession`, you've done the DB lookup twice. For now we have one call per request (in the layout). If we ever need it in multiple places, the right fix is to `cache()`-wrap `getSession` so React de-dupes per request.

5. **The `image` field is `null` for credential sign-ups.** Only OAuth providers (Google, GitHub) populate `user.image`. Code that reads `user.image` needs a fallback (default avatar, initials, etc.).

6. **Don't store `session` in a global.** Each request has its own session. `globalThis.session = ...` would leak between users — a critical security bug. Always read fresh per request.

7. **Middleware can read the session too**, but it runs on the **Edge runtime**, which doesn't include Prisma or `@/lib/prisma`. You'd need Better Auth's edge-compatible session validator (a separate API). We're using **layout guards** in `Day_30` instead — Server Components inside layouts run on Node, full access to Prisma. Simpler.

8. **`session.session.expiresAt` vs `session.user.createdAt`.** Two different `Date` fields. The first is when the *current cookie* expires (rolling 7-day window from sign-in). The second is when the *user account* was created. Don't confuse them.

---

## 🧪 Quick Quiz

**1.** I call `auth.api.getSession({ headers: await headers() })` from a Server Component. The user has a valid signed-in cookie. What gets returned?

<details>
<summary>Show answer</summary>

`{ user, session }` — an object with two non-null properties. `user` is the database row (name, email, image, etc.); `session` is the session metadata (token, expiresAt, userId, etc.). If the cookie were missing or expired, you'd get `null` (not `undefined`).
</details>

**2.** Why can't I call `auth.api.getSession` from a Client Component (`"use client"`)?

<details>
<summary>Show answer</summary>

`auth.api.getSession` imports `@/lib/auth` → `better-auth` → `@/lib/prisma` → `@prisma/client`. The Prisma client is Node-only — it uses the filesystem and TCP sockets that don't exist in the browser. Webpack will refuse to compile, or the build will succeed but the page will crash on hydration. The right pattern: read the session in a Server Component, pass the relevant fields as props to a Client Component child.
</details>

**3.** My layout calls `getSession` and my page also calls `getSession`. Does that hit the DB twice?

<details>
<summary>Show answer</summary>

Yes — without optimization, each call is a fresh DB query. For most cases that's fine (auth queries are cheap and indexed). If it ever matters, wrap your getter in React's `cache()`: `export const getSessionCached = cache(() => auth.api.getSession({ headers: headers() }))`. Then both call sites share the result for the duration of the request.
</details>

**4.** I want to redirect unauthenticated users away from `/dashboard`. Should I do it in the page, the layout, or middleware?

<details>
<summary>Show answer</summary>

For Buddies: in the **layout** (`app/(app)/layout.tsx`). Layouts run on Node, can use Prisma directly via `@/lib/auth`, and apply to every page below them in one place. Putting the check in each page is repetitive. Middleware runs on the Edge runtime — Prisma isn't available there — so it'd require Better Auth's edge-compatible session validator, which adds a step we don't need yet. Day_30 ships this layout-guard pattern.
</details>

**5.** I sign out — what happens in Mongo and in the browser?

<details>
<summary>Show answer</summary>

Two things, atomically: (1) Better Auth issues a `prisma.session.delete({ where: { token } })` against the current session row, removing it from Mongo. (2) Better Auth sets a `Set-Cookie: better-auth.session_token=; Max-Age=0` header on the response, telling the browser to delete the cookie. Next request, no cookie = no session lookup = signed out.
</details>

---

## 📌 Key Takeaways

- **`await auth.api.getSession({ headers: await headers() })`** is the one-line session read. Works in any server-side context.
- Returns **`{ user, session } | null`**. The `user` is your full Prisma `User` row; `session` is the session metadata.
- Call it in **Server Components, Server Actions, route handlers** — never in `"use client"` files.
- **Branch the JSX server-side**: `{session ? <X /> : <Y />}`. The browser sees one or the other, never both, never flickering.
- **Sign out** is `auth.api.signOut({ headers })` + redirect. One line, deletes the session row, clears the cookie.
- **Pass session data to Client Components as props**, not by re-reading the session client-side.
- We're skipping Better Auth's client SDK (`createAuthClient`) for now — server-side reads cover 95% of needs and avoid extra round-trips.
- **Layout-guard for route protection** (Day_30), not middleware. Middleware = Edge runtime = no Prisma.

---

## 🔗 References

- [Better Auth — Session management](https://www.better-auth.com/docs/concepts/session-management)
- [Better Auth — `getSession` API](https://www.better-auth.com/docs/concepts/api#get-session)
- [Next.js docs — `headers()`](https://nextjs.org/docs/app/api-reference/functions/headers)
- [Next.js docs — `cache()` for request-scoped memoization](https://nextjs.org/docs/app/building-your-application/caching#react-cache-function)
- Local: [Day 7 — Better Auth Overview](./day7_better_auth_overview.md) — what `auth.api.*` is
- Local: [Day 7 — Email/Password Flow](./day7_email_password_flow.md) — the Server Action pattern this complements
- Local: [Day 2 — Server vs Client Components](./day2_rsc_vs_client_components.md) — the boundary `getSession` must respect

---

## ➡️ What's Next?

- **`Day_28` (next commit)** — Apply this doc. Create `app/(app)/actions.ts` with `signOutAction`. Edit `app/(app)/layout.tsx` to read the session and render either a "Sign in" link or a user-name + "Sign out" button. End-to-end sign-up → sign-in → sign-out loop works in the browser.
- **`Day_29`** — Learning doc on **route protection**: middleware vs layout guard trade-offs. We use layout guard.
- **`Day_30`** — Edit `app/(app)/layout.tsx` to `redirect("/sign-in")` if `session === null`. After this, `/trips` is protected.
