# Day_30_Add_protected_app_routes_via_layout_guard

## Goal

**Closes Phase D.** Two lines added + dead-branch cleanup in `app/(app)/layout.tsx`. After this commit, every page under the `(app)` route group **requires authentication**: a logged-out browser hitting `/` or `/trips` is instantly redirected to `/sign-in`. The pages under `(auth)` (`/sign-in`, `/sign-up`) stay public — they have their own layout with no guard.

This is the **real** protection. Day_28's session-aware header was *cosmetic* (logged-out users could still see `/trips`). Day_30's guard is enforced by `redirect()`.

## Summary

**Files at a glance**

| Group     | Files                                                            |
| --------- | ---------------------------------------------------------------- |
| Plan doc  | `plans/Day_30_Add_protected_app_routes_via_layout_guard.md`      |
| App code  | `app/(app)/layout.tsx` (edited)                                  |
| Index     | `docs/README.md` (Auth Detour checklist row flipped)             |

**What you'll run / what you'll see**

| Step                                                            | What happens                                                                                |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `pnpm dev` then browse `/` while logged out (no cookie)         | **Instant redirect to `/sign-in`.** The home page never renders. URL bar updates to `/sign-in`. |
| Browse `/trips` while logged out                                | **Instant redirect to `/sign-in`**. The trips page never renders. |
| Browse `/sign-in` while logged out                              | Renders normally. The `(auth)` layout doesn't have a guard. |
| Browse `/sign-up` while logged out                              | Renders normally. Same reason. |
| `/api/health` while logged out                                  | Returns `{"ok":true,"ts":...}`. API routes are intentionally unprotected. |
| Sign in via `/sign-in`, browse `/`                              | Renders normally. Header shows your name + Sign out. |
| Sign out, then browse `/trips`                                  | Redirect to `/sign-in`. Cookie was cleared. |
| `pnpm build`                                                    | Build summary unchanged from Day_28 (`/` and `/trips` already `ƒ Dynamic` from the session-aware header). Build is still clean. |

> Real route protection. Day_28's *cosmetic* header change becomes a *real* gate. Phase D complete.

## Commands

```bash
# Edit app/(app)/layout.tsx.
# Two changes: add the redirect after getSession, simplify the dead
# session ? ... : ... ternary in the nav.

# Verify locally.
nvm use
pnpm build         # should be clean
pnpm dev           # open /trips logged-out → redirect to /sign-in
```

## Files changed

- `plans/Day_30_Add_protected_app_routes_via_layout_guard.md` — **created**: this file.
- `app/(app)/layout.tsx` — **edited**:
  - **Added** `import { redirect } from "next/navigation";` to the top.
  - **Added** the **2-line guard** immediately after `getSession`:
    ```ts
    if (!session) {
      redirect("/sign-in");
    }
    ```
  - **Simplified** the nav: removed the `session ? (...) : (<Link href="/sign-in">Sign in</Link>)` ternary. After the guard, `session` is guaranteed non-null below — so the JSX is now unconditionally `<span>{session.user.name}</span><SignOutButton />` followed by the existing `<ThemeToggle />`. The dead "Sign in" link branch (which would never have been reachable anyway) is gone.
- `docs/README.md` — **edited**: Auth Detour checklist row "`(app)` layout reads session, redirects if absent" flips from **Concepts pending ⏳** to **Concepts covered ✅**, tagged `Day_30`. Covered: 15 → 16; pending: 6 → 5.

## Verification

1. `cat app/(app)/layout.tsx | grep -E "(redirect|if \(!session)"` — shows the `import { redirect }` line and `if (!session) { redirect("/sign-in") }`.
2. `pnpm typecheck && pnpm lint` — both pass.
3. `pnpm build` — clean. Route summary unchanged from `Day_28` — the `(app)` routes (`/`, `/trips`) were already dynamic; the redirect doesn't change static-vs-dynamic.
4. `pnpm dev` then in a browser:
   - **Clear cookies for localhost** (DevTools → Application → Cookies → clear `better-auth.session_token` or the whole `localhost` origin).
   - Browse `/` → redirect to `/sign-in`. URL bar updates.
   - Browse `/trips` → redirect to `/sign-in`. URL bar updates.
   - Browse `/sign-in` → renders normally.
   - Sign in (use a real account) → redirect to `/`.
   - From `/`, click "Trips" → `/trips` renders normally with the three hardcoded trips.
   - Click "Sign out" → redirect to `/sign-in` (the existing sign-out flow). Try `/trips` again → redirect to `/sign-in`. The guard holds.
5. `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:PORT/` while logged out → `307` (Next's redirect status code). With `-L` it'll follow to `/sign-in` and return `200`.
6. `docs/README.md` Auth Detour Checklist: 16 covered, 5 pending, 4 deferred.

## Gotchas / decisions

- **The redirect happens server-side, in the layout, before the page renders.** The browser receives a `307 Temporary Redirect` response (or follows it via the RSC payload). The actual page component (`(app)/page.tsx`, `(app)/trips/page.tsx`, etc.) **never runs** for a logged-out user — even if it had a `prisma.trip.findMany()` call, that query wouldn't fire.
- **TypeScript narrowing works after the guard.** Before the `if`, `session` is `{user, session} | null`. After `if (!session) redirect(...)` (which is `never`-typed via `redirect`'s return type), TypeScript narrows `session` to `{user, session}` for the rest of the layout. So `session.user.name` is safe — no `?.` needed, no `!` non-null assertion.
- **The `(auth)` layout isn't affected.** It lives at `app/(auth)/layout.tsx` and has no `getSession` / `redirect` call. Logged-out users can always reach `/sign-in` and `/sign-up`. The file-system separation we set up in Day_06 / Day_07 (when we created the two route groups) was the foundation for this guard pattern.
- **No "redirect signed-in users away from /sign-in"** added in this commit. Day_29 noted this as a deferred follow-up. A signed-in user hitting `/sign-in` will see the sign-in form (could be confusing), but it's not a security issue — submitting just re-signs them in. We can add the inverse guard to `(auth)/layout.tsx` if/when this UX gap matters; for now, deferred.
- **Day_28's `session ?` ternary in the nav is now dead code.** Removed. The layout never renders for a logged-out user, so the "show Sign-in link" branch was unreachable. Removing it makes the code honest about the invariant ("if we got past the guard, the user is signed in").
- **Prefetch behavior**: Next's automatic prefetch (when a `<Link>` is in viewport) hits the layout-guard for prefetches too. A logged-in user hovering over `<Link href="/trips">` triggers a prefetch that succeeds (their session is valid). A logged-out user's prefetch would return a redirect, which the browser ignores for prefetches. Either way, no UX issue.
- **API routes still unprotected.** `/api/health` returns 200 regardless of auth state. `/api/auth/*` is delegated to Better Auth's own logic (which handles its own auth — e.g. `get-session` returns `null` for an anonymous request, not 401). For Buddies these are intentional: `/api/health` is a public uptime check; `/api/auth/*` needs to be reachable for sign-in itself to work.
- **No middleware added.** Day_29's doc explained the decision; this commit honors it. The repo doesn't have a `middleware.ts` at the root, and won't unless a real reason emerges.
- **The same a11y polish gaps from Day_25/Day_26/Day_28 still apply.** No new a11y debt added here — the changes are just to the layout's logic, not the visible chrome.
- **End-to-end auth picture (after this commit):**
  - Sign up via `/sign-up` (Day_25) → real user in Atlas.
  - Sign in via `/sign-in` (Day_26) → cookie set.
  - Header shows session state (Day_28) → name + Sign out button.
  - `(app)` routes require auth (Day_30) → no cookie = redirect to sign-in.
  - Missing: magic-link (Phase E, Day_31+Day_32), Google OAuth (Phase F, Day_33+Day_34+Day_35), close-out (Phase G, Day_36).
