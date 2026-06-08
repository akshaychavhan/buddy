# Day_26_Replace_sign_in_stub_with_real_form

## Goal

**Mirror of `Day_25`, for sign-in.** Overwrites the `Day_07` stub at `app/(auth)/sign-in/page.tsx` with the three-file Server Action pattern (action + form + page) calling `auth.api.signInEmail(...)`. After this commit, the **full sign-up → sign-in → sign-out loop** works in the browser (sign-out lands in `Day_28`).

The user from `Day_25` can now actually log back in after the session expires (or after clearing cookies). And vice versa: a user who signed up via curl in `Day_23` can sign in via the new UI.

## Summary

**Files at a glance**

| Group     | Files                                                              |
| --------- | ------------------------------------------------------------------ |
| Plan doc  | `plans/Day_26_Replace_sign_in_stub_with_real_form.md`              |
| App code  | `app/(auth)/sign-in/actions.ts` (new, "use server"), `app/(auth)/sign-in/sign-in-form.tsx` (new, "use client"), `app/(auth)/sign-in/page.tsx` (overwritten — Day_07 stub body replaced with `<SignInForm />`) |
| Index     | `docs/README.md` (Auth Detour checklist row flipped)               |

**What you'll run / what you'll see**

| Step                                                          | What happens                                                                                |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `pnpm dev` then browse `/sign-in`                             | Centered card (`(auth)` shell). Heading: "Sign in to Buddies". Two inputs: Email, Password. "Don't have an account? Sign up" link routes to `/sign-up`. |
| Type email + password of an existing user, click "Sign in"    | Submit button shows "Signing in…". On success: cookie set, redirected to `/`. On failure (wrong password, no such user): error message renders in red, page stays on `/sign-in`. |
| Open DevTools → Application → Cookies                         | `better-auth.session_token` cookie is set, HttpOnly, SameSite=Lax, 7-day expiry. |
| In Atlas → Browse Collections → `session`                     | A new row appears with this user's session token. Existing sessions for the user remain (sign-in creates a new session, doesn't replace). |
| `pnpm build`                                                  | `/sign-in` now `○ (Static)` at 995 B + 96.9 kB First Load JS — slightly smaller than `/sign-up` because no Name field. |

> Real sign-in flow. Combined with `/sign-up` from `Day_25`, the auth UI loop is half-complete (sign-out arrives in `Day_28`).

## Commands

```bash
# Create the two new files; overwrite the page.tsx body.
# (See Files changed for content.)

# Verify locally.
nvm use
pnpm build
pnpm dev
# Browse /sign-in, sign in with a real account.
```

## Files changed

- `plans/Day_26_Replace_sign_in_stub_with_real_form.md` — **created**: this file.
- `app/(auth)/sign-in/actions.ts` — **created**: 24 lines, `"use server"` at the top. Exports `SignInState` type (`{ error: string | null }`) and `signInAction(prevState, formData)`. Reads `email`, `password` from FormData. Calls `auth.api.signInEmail({ body, headers: await headers() })`. Catches errors, returns `{ error: message }`. `redirect("/")` outside the try/catch.
- `app/(auth)/sign-in/sign-in-form.tsx` — **created**: 68 lines, `"use client"` at the top. `SignInForm` uses `useFormState(signInAction, { error: null })` to bind. Nested `SubmitButton` uses `useFormStatus()` to show "Signing in…" while pending. Two labeled inputs (Email + Password, both required). `autoComplete="email"` and `autoComplete="current-password"` for password-manager hints. Error renders as red banner with `role="alert"`. "Don't have an account? Sign up" link routes to `/sign-up`.
- `app/(auth)/sign-in/page.tsx` — **overwritten** (was the `Day_07` stub from `Day_07_Add_auth_route_group_and_sign_in_stub`, with metadata refreshed in `Day_14_Add_per_page_metadata_exports`). Metadata block preserved (title, description, OpenGraph). Body replaced: heading "Sign in to Buddies", short sub-line about future auth methods, then `<SignInForm />`.
- `docs/README.md` — **edited**: Auth Detour checklist row "Real sign-in form — replaces the Day_07 stub" flips from **Concepts pending ⏳** to **Concepts covered ✅**, tagged `Day_26`. Covered: 11 → 12; pending: 10 → 9.

## Verification

1. `ls "app/(auth)/sign-in/"` — shows `page.tsx`, `actions.ts`, `sign-in-form.tsx`.
2. `git log -1 --stat app/(auth)/sign-in/page.tsx` — shows it was modified (not created) in this commit.
3. `pnpm typecheck && pnpm lint` — both pass.
4. `pnpm build` — `/sign-in` shows in route table as `○ (Static)` at 995 B + 96.9 kB First Load JS.
5. `pnpm dev` then in a browser:
   - Navigate to `/sign-in`. Form renders with two fields. Submit with a real account's credentials → redirect to `/`. Cookie set.
   - Sign out (manually clear `better-auth.session_token` cookie), revisit `/sign-in`, submit wrong password → red error banner renders inline (most likely "Invalid email or password").
   - Click "Don't have an account? Sign up" → navigates to `/sign-up`.
   - From `/sign-up`, click "Already have an account? Sign in" → back to `/sign-in`. The auth UI loop is bidirectional.
6. `docs/README.md` Auth Detour Checklist: 12 covered, 9 pending, 4 deferred.

## Gotchas / decisions

- **No Name field in sign-in.** Obvious in hindsight, but: sign-up's name field doesn't apply here. Sign-in only needs identity (email) + credential (password).
- **`autoComplete="current-password"`** (not `"new-password"` like sign-up). Password managers use this signal to offer **filling** the existing credential rather than **saving** a new one. Important UX distinction.
- **Page.tsx is a true overwrite, not a delete + create.** `git log` will show it as a modification. The Day_07 stub copy is gone; the metadata export is preserved.
- **`auth.api.signInEmail` errors are generic.** Better Auth doesn't distinguish "no such email" from "wrong password" in the error message — both surface as "Invalid email or password" (or similar). This is a deliberate security choice (prevents email enumeration via the sign-in flow). Day_07's auth-deferral note about timing attacks still applies; production hardening on top of that lives later.
- **No "Forgot password?" link.** Better Auth supports password reset via email; that's a feature for Day_31 (Resend wrapper) and beyond. For now, if you forget your password, you reset it by hand in Atlas (delete the Account row, sign up fresh).
- **The Day_25 user — and the Day_23 curl-test user (`smoke@example.com`) — can both sign in via this form.** They're real database rows; nothing about the new form is wired to expect specific accounts.
- **The Day_07 stub's pedagogy** ("Notice the centered shell — different layout from the rest of the app, same URL tree") **is removed** with the overwrite. That lesson is still preserved in the `Day_07` commit history; git checkout `Day_07_Add_auth_route_group_and_sign_in_stub` to read it.
- **No "Remember me" checkbox.** Better Auth's default 7-day session is fine for the detour; "remember me" semantics (longer sessions, sliding expiry) are a Day-N polish item.
- **Same a11y polish gaps as Day_25** — `text-neutral-500` helper text, no `focus-visible:` styles, no `aria-describedby` on hints. Same deferral: Day 3's design-token + theme pass.
- **`Don&apos;t`** in the JSX is the React-friendly way to escape the apostrophe inside a JSX text node. Alternative (`Don't`) triggers ESLint's `react/no-unescaped-entities` warning. The encoding keeps both lint and the rendered DOM correct.
- **Smoke-tested `/sign-in` would return 200**, mirroring Day_25's pattern; real verification requires browser interaction (Server Action wire format is awkward to curl).
- **Dev-mode `TypeError: Cannot read properties of undefined (reading 'call')` after overwriting `page.tsx`.** During this commit's browser test, the Next.js dev error overlay surfaced this error on `/sign-in`. Root cause: Webpack incremental compilation got into a stale state because `page.tsx` was overwritten *while* the dev server was running (a common dev quirk when files change between server start and first request). The production build was always clean; only dev was affected. **Fix:** `rm -rf .next && pnpm dev` (cold restart with fresh cache). If you hit this in the future on any commit that overwrites a Client-Component-importing file, this is the first thing to try.
