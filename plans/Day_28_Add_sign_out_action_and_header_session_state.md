# Day_28_Add_sign_out_action_and_header_session_state

## Goal

**Closes Phase C.** Two pieces in one commit:

1. **Sign-out Server Action** (`app/(app)/actions.ts`) — 10 lines. Calls `auth.api.signOut({ headers })`, then `redirect("/sign-in")`. Deletes the Session row from Mongo and clears the cookie.
2. **Session-aware header** (`app/(app)/layout.tsx` edited + `app/(app)/sign-out-button.tsx` new) — the layout becomes `async`, reads the session via `auth.api.getSession(...)`, and **conditionally renders the nav**: when logged in, shows the user's name + a "Sign out" button; when logged out, shows the existing "Sign in" link.

After this commit, the **full sign-up → sign-in → sign-out loop works end-to-end** in the browser. The header always reflects the current state. No client-side `useSession` hook, no flicker.

## Summary

**Files at a glance**

| Group     | Files                                                              |
| --------- | ------------------------------------------------------------------ |
| Plan doc  | `plans/Day_28_Add_sign_out_action_and_header_session_state.md`     |
| App code  | `app/(app)/actions.ts` (new), `app/(app)/sign-out-button.tsx` (new), `app/(app)/layout.tsx` (edited) |
| Index     | `docs/README.md` (Auth Detour checklist row flipped)               |

**What you'll run / what you'll see**

| Step                                                            | What happens                                                                                |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `pnpm dev` then browse `/` while logged-out                     | Header shows: Buddies · Trips · **Sign in** · 🌓. No name, no Sign out. |
| Sign in via `/sign-in`, return to `/`                           | Header now shows: Buddies · Trips · **{your name}** · **Sign out** · 🌓. The Sign-in link is gone. |
| Click **Sign out**                                              | Button text shows "Signing out…" briefly. Then redirect to `/sign-in`. Cookie is cleared; Session row deleted from Mongo. |
| Navigate back to `/` (or refresh `/sign-in`)                    | Header is back to logged-out state (Sign in link). |
| `pnpm build`                                                    | `/` flips from `○ (Static)` to `ƒ (Dynamic)` — correct, because the layout now reads cookies via `headers()` which disables static prerendering. `/trips` was already dynamic. `/sign-in` and `/sign-up` stay static (they're in `(auth)`, not `(app)`). |

> Full sign-up → sign-in → sign-out loop works in the browser. Phase C complete.

## Commands

```bash
# Create the two new files; edit the layout.
# (See Files changed below for content.)

# Verify locally.
nvm use
pnpm build
pnpm dev
# Sign in via /sign-in, then click Sign out in the header.
```

## Files changed

- `plans/Day_28_Add_sign_out_action_and_header_session_state.md` — **created**: this file.
- `app/(app)/actions.ts` — **created**: 10 lines, `"use server"` at the top. Exports `signOutAction()` (no args, no return). Calls `await auth.api.signOut({ headers: await headers() })`, then `redirect("/sign-in")` outside any try/catch (same pattern as sign-up / sign-in). Lives at the `(app)` group level so multiple routes can import it via `@/app/(app)/actions` — currently just the header uses it.
- `app/(app)/sign-out-button.tsx` — **created**: 26 lines, `"use client"` at the top. Wraps the sign-out form in a Client Component so `useFormStatus()` can drive the "Signing out…" pending text. Uses the **nested-component** pattern (form contains `SignOutSubmit`, which calls `useFormStatus`) — same trick from Day_25/Day_26. No `useFormState` because sign-out has no error UI to surface (failures are rare and we redirect anyway).
- `app/(app)/layout.tsx` — **edited**:
  - Function signature: `function AppLayout(...)` → `async function AppLayout(...)`. Server Components can be async; this is the trigger that makes Next mark `/` and any nested route `(app)`-scoped as dynamic.
  - Adds imports: `headers` from `next/headers`, `auth` from `@/lib/auth`, `SignOutButton` from `./sign-out-button`.
  - Calls `await auth.api.getSession({ headers: await headers() })` to fetch `{ user, session } | null`.
  - The `<nav>` now branches: `{session ? (<><span>{session.user.name}</span><SignOutButton /></>) : (<Link href="/sign-in">Sign in</Link>)}`. The Trips link and ThemeToggle stay in place regardless of session state.
  - The `await headers()` inside `getSession` has an inline `// eslint-disable-next-line @typescript-eslint/await-thenable` comment with rationale (forward-compat for Next 15 where `headers()` becomes async). SonarLint flagged the await as redundant in 14.2; the disable preserves the upgrade path.
- `docs/README.md` — **edited**: Auth Detour checklist row "Sign-out action + header shows session state" flips from **Concepts pending ⏳** to **Concepts covered ✅**, tagged `Day_28`. Covered: 13 → 14; pending: 8 → 7.

## Verification

1. `ls "app/(app)/"` — shows `actions.ts`, `sign-out-button.tsx`, `layout.tsx`, `page.tsx`, plus the existing `trips/` subdir.
2. `pnpm typecheck && pnpm lint` — both pass.
3. `pnpm build`:
   - **`/` now flips from `○ Static` to `ƒ Dynamic`.** Expected — the layout reads cookies via `headers()`, which disables static prerendering for any route under it.
   - `/trips` stays `ƒ Dynamic` (already was, from Day_11's `searchParams.boom` reading).
   - `/sign-in` and `/sign-up` stay `○ Static` — they're under `(auth)`, not `(app)`, so the layout-guard doesn't apply.
4. `pnpm dev` then in a browser:
   - Logged out → browse `/` → header shows `Buddies · Trips · Sign in · 🌓`.
   - Sign in via `/sign-in` → redirect to `/` → header now shows `Buddies · Trips · {your name} · Sign out · 🌓`.
   - Click `Sign out` → button text changes to "Signing out…" briefly → redirect to `/sign-in`. Cookie cleared.
   - Navigate back to `/` → header is logged-out again.
5. In Atlas Browse Collections → `session` collection: when signed in, your active session row exists. After sign-out, it's deleted. Other historic sessions (from earlier test sign-ins) may remain until their expiry.
6. `docs/README.md` Auth Detour Checklist: 14 covered, 7 pending, 4 deferred.

## Gotchas / decisions

- **Layout becomes async.** Server Components can be async since React 18. The signature change `function AppLayout(...)` → `async function AppLayout(...)` is the trigger Next uses to switch the route from static-prerendered to dynamic-server-rendered. Expected and correct.
- **`/` is now `ƒ Dynamic`.** Reading cookies (via `headers()`) marks the route as dynamic. There's no way to statically prerender a page whose content depends on per-request state. The build report shows the flip; build doesn't fail.
- **`SignOutButton` is its own component, not inline.** Two reasons. (1) `useFormStatus` only works inside a `<form>`, and we want the pending-state to drive the button label. (2) Keeping it in its own Client Component file means the Server Component layout doesn't get dragged into the client bundle — only the small button does.
- **No `useFormState` for sign-out.** Unlike sign-up / sign-in, sign-out has no error path the user needs to see — Better Auth's `signOut` doesn't really fail (worst case: stale session, which is harmless). If it ever does fail, the user can retry; we don't need inline error rendering.
- **Sign-out uses `<form action={signOutAction}>`, not `<button onClick={signOutAction}>`.** Same reason as sign-up/sign-in: Server Actions must be invoked via form submission (or `formAction` prop) to work without JS. Wrapping in a form means sign-out works even if React JS hasn't loaded yet.
- **The user's name is shown as a plain `<span>`, not a link.** A "click your name to see profile" pattern is nice but premature — we don't have a profile page yet. The span keeps the UI honest about what's clickable.
- **`session.user.name` is guaranteed non-null.** Day_22's `User` model has `name String` (not nullable); Day_25's sign-up fills it from the form or defaults to email-prefix. If somehow `name` were missing, the type system would catch it.
- **`session.user.image` not shown yet.** It's `null` for credential sign-ups (no avatar). When Google OAuth lands (Day_35), `image` will populate; that's the moment to add an avatar to the header.
- **`SignOutButton`'s pending text is tiny ("Signing out…").** Mirrors sign-up's "Creating account…" and sign-in's "Signing in…". Consistent voice across all three pending states.
- **No middleware change.** Phase C is about reading + writing session state. Route *gating* (redirect logged-out users away from `/trips`) is Phase D — `Day_29` doc, `Day_30` code. The current layout shows "Sign in" but doesn't redirect.
- **The same a11y polish gaps as Day_25/Day_26** carry into the SignOutButton (`text-neutral-700`/`text-neutral-500`, no `focus-visible:` styles). Same deferral: Day 3's design-token + theme pass.
- **`<eslint-disable-next-line>` comment on `await headers()`.** SonarLint flagged the await as redundant in Next 14.2 (where `headers()` is sync). The disable preserves the forward-compat for Next 15. Already documented in Day_24's gotchas; the inline comment makes it explicit at the call site.
