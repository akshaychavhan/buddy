# Day_07_Add_auth_route_group_and_sign_in_stub

## Goal

Add the **second** route group, `(auth)`, with a centered shell that's visually distinct from the `(app)` group's eventual headered shell — and a `/sign-in` stub page inside it. After this commit the repo proves the route-group payoff: two URLs (`/` and `/sign-in`) sit side-by-side at the URL level, yet render with two different layouts. No conditional rendering, no `pathname` check anywhere.

The `/sign-in` page is intentionally a **stub** for now (just a heading + placeholder copy). Day 7 (the auth day, not this commit) will replace it with a real Better Auth form. This commit's job is to prove the *structural* split works.

## Summary

**Files at a glance**

| Group     | Files                                                            |
| --------- | ---------------------------------------------------------------- |
| Plan doc  | `plans/Day_07_Add_auth_route_group_and_sign_in_stub.md`          |
| App code  | `app/(auth)/layout.tsx` (new), `app/(auth)/sign-in/page.tsx` (new) |

**What you'll run / what you'll see**

| Command                                                    | What it does                                                                                |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `nvm use && pnpm dev`                                      | Starts dev server. |
| Browse `http://localhost:3000/`                            | Same Day 1 page rendered through the `(app)` group. No header yet (that lands in `Day_08`). |
| Browse `http://localhost:3000/sign-in`                     | A centered card with "Sign in" heading and a "real form lands Day 7" placeholder. **Visibly different layout** from `/` — centered, narrow, no chrome. |
| `pnpm build`                                               | Build summary shows route `/sign-in` listed at the URL level (not `/(auth)/sign-in`) — proves parentheses don't add a URL segment. |

> Second code commit of Day 2. Two route groups now exist. The structural split is the load-bearing concept here.

## Commands

```bash
# Create the (auth) group and the sign-in stub.
mkdir -p "app/(auth)/sign-in"

# Then write app/(auth)/layout.tsx and app/(auth)/sign-in/page.tsx
# (see Files changed below for content).

# Verify locally.
nvm use
pnpm dev
# Browse to / and /sign-in, see the layout difference.
```

## Files changed

- `plans/Day_07_Add_auth_route_group_and_sign_in_stub.md` — **created**: this file.
- `app/(auth)/layout.tsx` — **created**: Server Component, 11 lines. Centers its children vertically and horizontally using Tailwind: `flex min-h-screen items-center justify-center px-6 py-16`, with an inner `w-full max-w-sm` wrapper to keep auth content narrow. No header, no nav — that's the whole point of the auth shell.
- `app/(auth)/sign-in/page.tsx` — **created**: Server Component, 14 lines. Static stub: heading "Sign in", placeholder paragraph mentioning Better Auth lands on Day 7, and a meta-note pointing out the centered shell is the visible proof that route groups work. Uses the same dark-mode-aware text colors (`text-neutral-600 dark:text-neutral-400`) as Day 1's home page so light/dark mode looks consistent.

## Verification

1. `ls "app/(auth)/"` — shows `layout.tsx` and `sign-in/`.
2. `ls "app/(auth)/sign-in/"` — shows `page.tsx`.
3. `nvm use && pnpm dev` → open `http://localhost:3000/sign-in` → see the centered card with "Sign in" heading. Compare visually with `http://localhost:3000/` — same browser, different shell.
4. `pnpm build` — succeeds. Route summary lists `/sign-in` (not `/(auth)/sign-in`) under "Route (app)" — Next reports all routes under the `(app)` build group header but the URL itself respects route-group parentheses.
5. `pnpm typecheck && pnpm lint` — both pass.
6. `curl -s http://localhost:3000/api/health` — still returns `{"ok":true,"ts":<number>}`. Day 1 endpoint untouched.

## Gotchas / decisions

- **Why a stub page, not a real form?** Two reasons. First, the goal of *this* commit is to teach the route-group split — adding a form would distract. Second, the real sign-in form is a Day 7 (the auth day) deliverable that pulls in Better Auth, Zod validation, server actions, etc. Building a temporary form here would mean throwing away ~80 lines later.
- **Why a Server Component for the stub?** Same answer as the route-groups doc: default is Server. The stub is static text, no `useState`, no `onClick` — so there's no reason to opt into `"use client"`. The eventual real form *will* need `"use client"` for input state, but that's Day 7's problem.
- **Why `max-w-sm` inside the auth layout?** Auth forms (sign-in, sign-up, forgot-password, magic-link) are uniformly narrow — wider readable content lives in the `(app)` group. Locking `max-w-sm` (~384 px) in the layout means every future auth page inherits the right width without having to repeat it.
- **No tracker bump for the Day 2 row.** Same convention as the docs commits: status stays 🔄 In progress. Notes column still says "Doc 1 of 4: RSC vs Client Component boundary" — somewhat stale, but `Day_15` will overwrite the notes with the final summary. Keeping inter-commit churn low.
- **No `<Link>` from / to /sign-in yet.** That arrives in `Day_08` as part of the header. Right now both URLs exist independently and you navigate by typing them in the address bar. Looks empty; that's intentional — `Day_08` will demonstrate `<Link>` navigation as its own concept rather than burying it inside this commit.
- **`pnpm dev` cache.** Next.js caches the route tree at startup; if `pnpm dev` was already running before this commit, restart it to pick up `app/(auth)/`. Hot-reload handles file *contents*; new route folders sometimes need a server restart.
