# Day 7 — Protecting Pages: Middleware vs Layout-Guard

> **Created:** 2026-06-08
> **Phase:** 3 — Auth & Backend Wiring (pulled forward by the Auth Detour)

---

## 🎯 What Are We Learning?

How to **make `/trips` (and other `(app)` routes) require authentication**. After `Day_28` the header *shows* whether you're signed in, but a logged-out browser can still visit `/trips` and see the page — the protection is cosmetic. This doc covers the two real ways to fix that:

1. **Edge Middleware** (`middleware.ts` at the root) — runs before any request reaches a page; can inspect the cookie and `NextResponse.redirect()`.
2. **Layout-guard** — read the session at the top of a layout (`app/(app)/layout.tsx`) and `redirect()` if absent.

After this doc you should be able to:

- Explain what runs where, in what runtime (Edge vs Node), and what each can/can't access.
- Pick the right tool for Buddies given our Prisma + MongoDB constraint, and articulate why.
- Predict what `Day_30`'s code will look like (a 3-line addition to `(app)/layout.tsx`).
- Know the gotchas — request loops, sign-in/sign-up pages excluded, `prefetch` traps, public sub-routes.

`Day_30` ships the code. This commit is the *why* + the design decision.

---

## 🤔 Why Does This Matter?

A "protected page" sounds simple but has subtle correctness traps. If your protection has a hole, someone can read data they shouldn't. If your protection has a loop, every request becomes infinite redirects. If your protection runs in the wrong runtime, your app boots fine but breaks the moment a real user lands.

The two patterns (middleware, layout-guard) are both valid in the App Router. They have different cost/benefit profiles. Picking blindly = future pain. Picking deliberately = the rest of the codebase stays consistent.

For Buddies specifically: we picked Prisma + MongoDB Atlas on Day 6 (pulled forward by this detour). Prisma's MongoDB driver is a **Node-only library** — it uses `net` sockets and a custom binary. **Edge Middleware doesn't have Node APIs.** So middleware *can't* directly call `auth.api.getSession(...)` (which would transitively load Prisma). That single constraint shapes the decision.

---

## 🧠 How It Works (The Concept)

### Option A: Edge Middleware

A file at the **project root** named `middleware.ts` runs on Vercel/Cloudflare Edge for every request that matches its `matcher`. Sketch:

```ts
// middleware.ts (Edge runtime)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("better-auth.session_token");
  if (!session) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!sign-in|sign-up|api|_next).*)"],
};
```

What's good:
- **Fast**: redirect happens before Next.js compiles the page route. No wasted server work.
- **Centralized**: one file gates everything that matches the matcher.

What's hard:
- **Edge runtime**, not Node. No filesystem, no `@/lib/prisma`, no full `@/lib/auth`. You can read the cookie, but you can't **verify the session against the DB** without an Edge-compatible HTTP call (Better Auth has one — `auth.api.getSessionFromHeaders()` — but it adds a round-trip through your own `/api/auth` route).
- **Cookie-only check is insecure for some flows**: if your session token is JWT-style (Better Auth's isn't — it's a random token validated against the DB), reading the cookie value tells you nothing about validity. We'd be checking *presence*, not *validity*. A user with an expired session cookie would slip through.
- **Matcher patterns are easy to get wrong**: forget to exclude `/sign-in` and you get an infinite redirect loop (logged-out user → redirect to /sign-in → middleware checks again → redirect to /sign-in → forever). Forget to exclude `/api/auth` and sign-in itself can't work.
- **Doesn't compose with route groups**: `matcher` is a string/regex over the URL path. The fact that `/trips` is conceptually under `(app)` is invisible. You match by URL, not by file-system grouping.

### Option B: Layout-Guard

The pattern we previewed in Day_27. The layout reads the session and redirects:

```tsx
// app/(app)/layout.tsx (Server Component, Node runtime)
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div>
      <Header session={session} />
      {children}
    </div>
  );
}
```

What's good:
- **Full Node runtime**. `auth.api.getSession` works — it queries Prisma against MongoDB, validates the session row against `expiresAt`, returns the actual `{ user, session }` or `null`. Real DB-backed validity check.
- **Composes with route groups**: protection automatically applies to every page under `(app)` — `/`, `/trips`, future `/settings`, `/profile`. Adding a new page to the group means it's protected by default. No matcher to maintain.
- **`(auth)` group is naturally excluded**: `/sign-in` and `/sign-up` live under `(auth)`, which has its own layout that *doesn't* call `redirect()`. Logged-out users can reach them, even though `(app)` routes redirect.
- **Less to get wrong**: no regex matcher, no Edge/Node mismatch, no fallthrough holes.

What's hard:
- **Slower** in the sense that the page route compiles before the redirect happens. The server does a little extra work for a logged-out user before issuing the redirect. For sane traffic levels this is negligible; for hyperscale you'd consider middleware as an optimization layer.
- **Adds a per-request DB query** for every page load (the `getSession` call). One indexed query against a small `Session` collection — cheap in absolute terms, but a real cost if your traffic is huge or your DB is far from your server.

### The decision: layout-guard for Buddies

Three reasons:

1. **Prisma + MongoDB forces our hand**. Edge middleware can't reach Prisma directly. Going middleware means adding a `/api/auth/get-session` round-trip (HTTP from middleware → our own route handler → Prisma → MongoDB → back). That's *more* work per request than the layout-guard's single Prisma call, and adds a brand new failure mode (middleware-to-API request timeout).
2. **Composition is the right primitive here**. We already have route groups (`(app)`, `(auth)`). They have layouts. The layout is the natural place to put "everyone under here needs auth." Middleware would re-encode that structural fact as a URL pattern, which would drift as the file tree grows.
3. **Honest validation**. A cookie-presence check (what middleware can cheaply do) is not the same as a real session validation. With layout-guard, the same `getSession` we use to *show* the user's name is the one that *gates* the page. If the session is in the DB and not expired, you're in; otherwise you're out. There's no second source of truth to keep in sync.

When would we revisit? If Buddies grows so large that the per-request `getSession` DB query becomes the bottleneck (unlikely until thousands of QPS), or if we add a CDN tier where we want unauthenticated requests rejected before they hit the origin server. Both are problems we don't have. Don't optimize for them now.

### The `Day_30` patch in two lines

```tsx
// app/(app)/layout.tsx — after Day_30
const session = await auth.api.getSession({ headers: await headers() });
if (!session) redirect("/sign-in");          // <-- two lines added
```

That's it. The existing `session ? <SignOut /> : <SignIn />` ternary in the header becomes redundant — if we redirect on no-session, the layout never renders for a logged-out user. We'll simplify in `Day_30` (remove the dead branch).

### The unprotected-routes story (`/sign-in`, `/sign-up`, `/api/health`)

After `Day_30`:
- `/` and `/trips` → require auth, redirect to `/sign-in` if logged out.
- `/sign-in` and `/sign-up` → unprotected. They live under `(auth)`, which has its own layout (`app/(auth)/layout.tsx`) that does *not* call `redirect()`.
- `/api/health` and `/api/auth/[...all]` → unprotected. API routes aren't under a `(app)` layout; they have their own files.

This natural-by-file-system separation is the layout-guard's biggest UX win: you never have to add a new path to a matcher list. Drop a new page into `(app)/whatever/page.tsx` → it's protected. Drop one into `(auth)/whatever/page.tsx` → it's public-to-the-unauthenticated. The file system *is* the rule book.

---

## 💻 Tiny Isolated Example

The smallest workable protection — one layout, three lines added:

```tsx
// app/(app)/layout.tsx
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  return <main>{children}</main>;
}
```

A logged-out user hitting `/trips`:
1. Browser sends GET `/trips`.
2. Next.js renders `(app)/layout.tsx`.
3. Layout calls `getSession` — returns `null` (no cookie or expired cookie).
4. Layout calls `redirect("/sign-in")` — throws a `NEXT_REDIRECT` signal.
5. Next.js catches the signal, sends `307 Temporary Redirect` to `/sign-in`.
6. Browser follows the redirect to `/sign-in`. Done.

The `/trips` page **never renders**. Layout-guard short-circuits before the page-component code runs. Even if the page did `prisma.trip.findMany()` directly, the query never fires.

---

## 🚀 Applied to Buddies

> See: [Task — Auth Detour](../task/) — task doc will land in `Day_30`.

`Day_30` (the next code commit) ships **one edit, two lines added** to `app/(app)/layout.tsx`:

```diff
   const session = await auth.api.getSession({ headers: await headers() });
+  if (!session) {
+    redirect("/sign-in");
+  }
```

Plus a simplification: the existing `session ? <SignOut /> : <Link href="/sign-in">Sign in</Link>` ternary becomes always-`<SignOut />` (the logged-out branch is now unreachable in this layout).

After `Day_30`:
- Logged-out user visits `/trips` → instant redirect to `/sign-in`.
- Logged-out user visits `/sign-in` → renders normally.
- Signed-in user visits `/trips` → renders with the trip list (unchanged).
- Signed-in user visits `/sign-in` → renders (TODO: should we also redirect signed-in users away from sign-in? deferred — see Gotchas).

---

## ⚠️ Gotchas & Beginner Mistakes

1. **Redirect loops are the classic middleware bug.** If your middleware redirects every unauthenticated request to `/sign-in`, but you forgot to **exclude `/sign-in` itself**, you get an infinite redirect. With layout-guard this can't happen — `/sign-in` is under `(auth)`, which has a different layout with no guard.

2. **Edge runtime constraints are real.** `middleware.ts` runs on the Edge — no `fs`, no `net` (low-level), no native binaries. Prisma's MongoDB driver fails to load. If you must use middleware, you have to either (a) use Better Auth's edge-compatible session helper or (b) make an HTTP fetch to your own `/api/auth/get-session`. Both add complexity.

3. **The "layout doesn't re-run on `redirect()`" trap.** When the layout throws `NEXT_REDIRECT`, the page below it never renders — but the layout itself **doesn't re-render either** for the redirected URL. The redirect is followed by the browser as a fresh request. There's no infinite re-render risk in the layout itself.

4. **Signed-in users on `/sign-in`** — should they be redirected away? Most apps do (sending them to `/`). For Buddies, deferred for now: we don't have it, and the cost is just "user sees a sign-in form they could ignore." If you fix this, add a layout-guard *inversion* at `app/(auth)/layout.tsx`: `if (session) redirect("/")`.

5. **API routes don't get the layout-guard.** `app/api/health/route.ts` and `app/api/auth/[...all]/route.ts` are not Server Components and don't have a wrapping layout. If you want `/api/whatever` to require auth, you need to call `getSession` inside the route handler itself, or check the cookie. For Buddies, `/api/health` is intentionally public (it's a uptime check); `/api/auth/*` is delegated to Better Auth, which has its own logic.

6. **Prefetch behavior is fine here.** Next.js's automatic prefetch (when a `<Link>` is in viewport, Next pre-fetches the destination's RSC payload) will hit the layout-guard for prefetches too. A logged-out user hovering over a `<Link href="/trips">` will trigger a prefetch that returns the redirect. The browser doesn't follow prefetch redirects, so no UX impact — and the page isn't actually rendered.

7. **`redirect()` in a Server Component throws.** This is by design — Next.js needs to short-circuit rendering. You can't put it inside a `try/catch` that catches all errors (the catch would swallow `NEXT_REDIRECT`). Same lesson as `Day_24`'s sign-up gotcha.

8. **Don't conflate "protection" with "data ownership".** The layout-guard ensures *someone is logged in*. It doesn't ensure *the logged-in user owns the data they're requesting*. If `/trips/[id]` shows trip details, the page itself still needs to check `trip.ownerId === session.user.id` (or `trip.members.includes(session.user.id)`). Authorization (per-row access) is separate from authentication (is there a user at all).

---

## 🧪 Quick Quiz

**1.** Why can't Edge Middleware call `auth.api.getSession` directly?

<details>
<summary>Show answer</summary>

`auth.api.getSession` transitively imports `@/lib/prisma`, which imports `@prisma/client`. Prisma's MongoDB driver is Node-only — it uses `net` sockets, the filesystem, and a native binary. Edge runtime doesn't expose Node APIs, so the import fails to resolve at bundle time (or fails at runtime). To use middleware for auth, you'd need Better Auth's edge-compatible session helper (which fetches via HTTP from your own auth endpoint) or read the cookie value directly (which only checks presence, not validity).
</details>

**2.** With our layout-guard, what gets redirected: requests to `/trips`, `/sign-in`, both, or neither?

<details>
<summary>Show answer</summary>

`/trips` only. It lives under `(app)`, whose layout calls `redirect("/sign-in")` when there's no session. `/sign-in` lives under `(auth)`, whose layout doesn't redirect — anyone (signed in or not) can reach it. This file-system-based separation is the win: dropping a page into `(app)/foo/page.tsx` makes it protected; into `(auth)/foo/page.tsx` makes it public.
</details>

**3.** A signed-in user clicks a `<Link href="/trips">`. Next prefetches the route. What happens?

<details>
<summary>Show answer</summary>

The prefetch hits the layout, which calls `getSession`, which succeeds (cookie + DB row both valid), so no redirect. The layout renders, the page renders, the RSC payload is cached client-side. When the user actually clicks, the navigation feels instant because the payload is already there. Layout-guard is prefetch-compatible.
</details>

**4.** Why don't we use middleware as a "first line of defense" even with layout-guard as a backup?

<details>
<summary>Show answer</summary>

Two reasons. (1) Defense-in-depth sounds good but here the "first line" would only check cookie presence (cheap from Edge), not validity. A real attacker would fake a cookie value or send an expired one, and the cheap check passes them through anyway. So the middleware would only catch the cases the layout-guard already catches faster (no cookie at all). (2) Two sources of truth = drift. If we ever change the auth cookie name, we'd have to update middleware *and* the layout. With one guard, one place to update.
</details>

**5.** Authorization vs authentication — give a concrete example for Buddies.

<details>
<summary>Show answer</summary>

Authentication = "is *someone* logged in?" — what the layout-guard does. Authorization = "does this *specific* user have permission to see this *specific* data?" — needed for, e.g. `/trips/[id]`. A signed-in user satisfies authentication but a trip might belong to someone else. The page itself must check `trip.ownerId === session.user.id || trip.members.includes(session.user.id)`. The layout-guard alone is not enough; per-page ownership checks are a separate concern, and Day_30 doesn't address them — that's a follow-up for when we add real trip CRUD later.
</details>

---

## 📌 Key Takeaways

- **Two patterns for route protection**: Edge Middleware (`middleware.ts`) or Layout-Guard (inside a `(group)/layout.tsx`).
- **Buddies picks layout-guard** because Prisma+MongoDB is Node-only — Edge middleware can't run our session check.
- The layout-guard pattern: `const session = await auth.api.getSession({headers: await headers()}); if (!session) redirect("/sign-in");`
- **Composes with route groups**: drop a page under `(app)/` and it's protected; under `(auth)/` and it's public. The file system is the rule book.
- **Doesn't loop**: `/sign-in` lives under `(auth)`, which has no guard. Logged-out users can always reach it.
- **Honest validation**: same `getSession` we use to render the user's name is the one that gates the route. No second source of truth.
- **Authorization is separate**: the guard ensures *someone* is logged in, not that the user owns the data. Per-page ownership checks are still needed.
- **Don't put `redirect()` inside a `try/catch` that catches all errors** — same lesson as the sign-up flow's `NEXT_REDIRECT` swallow trap.

---

## 🔗 References

- [Next.js docs — Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Next.js docs — `redirect()` in a Server Component](https://nextjs.org/docs/app/api-reference/functions/redirect)
- [Better Auth — Protected routes](https://www.better-auth.com/docs/concepts/protected-routes)
- [Next.js docs — Authentication patterns](https://nextjs.org/docs/app/building-your-application/authentication)
- Local: [Day 7 — Reading the Session](./day7_session_in_server_actions.md) — the `getSession` call this doc builds on
- Local: [Day 7 — Email/Password Flow](./day7_email_password_flow.md) — the `NEXT_REDIRECT` trap also applied here
- Local: [Day 2 — Layouts and Route Groups](./day2_layouts_and_templates.md) — the `(app)`/`(auth)` structure the layout-guard exploits

---

## ➡️ What's Next?

- **`Day_30` (next commit)** — Apply this doc. Add `if (!session) redirect("/sign-in")` to `app/(app)/layout.tsx`. Simplify the now-unreachable logged-out branch of the header. After this, `/trips` actually requires auth.
- **Phase E** — `Day_31` doc + `Day_32` code: magic-link via Resend (pulls forward a slice of Day 11).
- **Phase F** — `Day_33`–`Day_35`: Google OAuth (registration + provider + button).
- **Phase G** — `Day_36` close-out: Day 2 + Day 6 (partial) + Day 7 tracker flips.
