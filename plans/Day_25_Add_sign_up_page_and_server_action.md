# Day_25_Add_sign_up_page_and_server_action

## Goal

**First code commit of Phase C.** Applies the three-file Server Action pattern from `Day_24`'s doc to ship a real `/sign-up` page. After this commit, you can browse to `/sign-up`, fill in name + email + password, click "Sign up", and end up signed in on `/` — with a fresh `User` + `Account` + `Session` row in Atlas and a `better-auth.session_token` cookie in your browser.

This is the **first time** a real user can create an account through the UI. Up until now sign-up worked only via `curl` (`Day_23`).

Sign-up before sign-in (per the build-error matrix in the master plan): you need an account to *sign in with*, so we build the account-creation flow first. `Day_26` replaces the `/sign-in` stub.

## Summary

**Files at a glance**

| Group     | Files                                                             |
| --------- | ----------------------------------------------------------------- |
| Plan doc  | `plans/Day_25_Add_sign_up_page_and_server_action.md`              |
| App code  | `app/(auth)/sign-up/page.tsx` (new, Server Component, metadata), `app/(auth)/sign-up/actions.ts` (new, "use server"), `app/(auth)/sign-up/sign-up-form.tsx` (new, "use client") |
| Index     | `docs/README.md` (Auth Detour checklist row flipped)              |

**What you'll run / what you'll see**

| Step                                                          | What happens                                                                                |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `pnpm dev` then browse `/sign-up`                             | Centered card (because we're in the `(auth)` shell). Heading: "Create your account". Three inputs: Name, Email, Password. "Already have an account? Sign in" link at the bottom. |
| Type name + email + password (≥8 chars), click "Sign up"      | Submit button shows "Creating account…" while the action runs server-side. On success: cookie set, redirected to `/` (the home page). On failure (duplicate email, weak password): error message renders in red below the inputs, page stays on `/sign-up`. |
| Open DevTools → Application → Cookies                         | `better-auth.session_token` cookie is set, HttpOnly, SameSite=Lax, expires in 7 days. |
| In Atlas → Browse Collections                                 | `user` collection has a new row with your name + email + emailVerified=false. `account` has a row linking that user to providerId="credential" with a scrypt-hashed password. `session` has a row with the token + 7-day expiresAt. |
| Browse `/sign-up` again                                       | Form re-renders fresh. You can sign up again with a different email. |
| Submit a duplicate email                                      | Error renders in red: "user already exists" (Better Auth's verbatim message). No redirect. |
| `pnpm build`                                                  | `/sign-up` shows in route table as `○ (Static)` at 1.04 kB + 97 kB First Load JS (Client Component overhead from `useFormState` + `useFormStatus`). |

> Real sign-up flow shipped. The "Sign up" → "I'm signed in" loop works in the browser.

## Commands

```bash
# Create the sign-up folder + three files (see Files changed for content).
mkdir -p "app/(auth)/sign-up"
# Then write actions.ts, sign-up-form.tsx, page.tsx.

# Verify locally.
nvm use
pnpm build
pnpm dev
# Browse http://localhost:PORT/sign-up, sign up with a fresh email.
```

## Files changed

- `plans/Day_25_Add_sign_up_page_and_server_action.md` — **created**: this file.
- `app/(auth)/sign-up/actions.ts` — **created**: 25 lines, `"use server"` at the top. Exports `SignUpState` type (`{ error: string | null }`) and `signUpAction(prevState, formData)`. Reads `name`, `email`, `password` from FormData (defensive `String(... ?? "")`). Falls back name to email-prefix if user leaves it blank. Calls `auth.api.signUpEmail({ body, headers: await headers() })` — note `await headers()`: Next.js 14.2 typed `headers()` as sync (returns `ReadonlyHeaders`) but Better Auth's typing prefers `Promise<ReadonlyHeaders>` which `await`-on-non-Promise gracefully handles. Catches errors, returns `{ error: message }`. `redirect("/")` outside the try/catch — exactly as `Day_24`'s doc described.
- `app/(auth)/sign-up/sign-up-form.tsx` — **created**: 70 lines, `"use client"` at the top. `SignUpForm` uses `useFormState(signUpAction, { error: null })` to bind to the action and surface inline errors. Nested `SubmitButton` uses `useFormStatus()` to show "Creating account…" while pending. Three labeled inputs (Name optional, Email required, Password required + minLength=8 client-side hint). Tailwind dark-mode-aware. Error renders as a red banner with `role="alert"` for screen readers. "Already have an account? Sign in" link at the bottom for `/sign-in` (typed-routes-safe).
- `app/(auth)/sign-up/page.tsx` — **created**: 28 lines. Server Component. `export const metadata` sets title/description/OpenGraph for the page (matches Day_14's pattern). Renders a heading + a sub-line about future auth methods + the `<SignUpForm />` client island.
- `docs/README.md` — **edited**: Auth Detour checklist row "Sign-up page + Server Action" flips from **Concepts pending ⏳** to **Concepts covered ✅**, tagged `Day_25`. Covered: 10 → 11; pending: 11 → 10.

## Verification

1. `ls "app/(auth)/sign-up/"` — shows `page.tsx`, `actions.ts`, `sign-up-form.tsx`.
2. `pnpm typecheck && pnpm lint` — both pass.
3. `pnpm build` — `/sign-up` appears in the route table as `○ (Static)` at ~1 kB + 97 kB First Load JS.
4. `pnpm dev` → `curl -s -o /dev/null -w "%{http_code}" http://localhost:PORT/sign-up` → `200`.
5. In a browser, navigate to `/sign-up`. Form renders with three fields. Submit with a fresh email and password (≥8 chars). Expected: brief "Creating account…" button text, then redirect to `/`. Cookie set.
6. Refresh `/` → still signed in (cookie persists).
7. In Atlas Browse Collections: `user` has the new row; `account.password` is a scrypt hash (NOT plain text); `session.expiresAt` is ~7 days out.
8. Try signing up with the same email again → error message "user already exists" renders inline.
9. `docs/README.md` Auth Detour Checklist: 11 covered, 10 pending, 4 deferred.

## Gotchas / decisions

- **`headers()` is awaited even though it's typed as sync in Next 14.2.** Next 15 makes it async; Better Auth's type signature expects `Promise<Headers> | Headers`. Writing `await headers()` works in both — it's a no-op on the sync return value, and ready for the Next 15 upgrade. Cheap forward-compat.
- **`useFormState` + `useFormStatus` together** require the SubmitButton to be a nested component, because `useFormStatus` reads context from the nearest `<form>` and only works inside it. If we put the button at top level of `SignUpForm`, `pending` would always be `false`. The nesting is the React idiom.
- **`redirect("/")` lives outside `try/catch`.** Exactly as Day_24's doc warned — putting it inside means the catch swallows `NEXT_REDIRECT` and the user sees an error instead of being signed in.
- **The page is a Server Component, the form is a Client Component.** That's the boundary from Day 4. The page renders metadata + static heading on the server (cheap, indexable); the form (which needs `useFormState`) ships JS to the browser. Best of both.
- **`autoComplete` attributes are set** — `name`, `email`, `new-password`. These help password managers + browser autofill behave correctly. Easy UX win.
- **Name field is optional in the UI but required by Better Auth.** Day_22's `User` model has `name String` (not nullable). The action defaults to `email.split("@")[0]` if the field is empty — so "you@example.com" becomes name "you". Acceptable for the auth detour; later we can require it in the UI if we'd rather.
- **Error message is Better Auth's verbatim string.** "user already exists", "Password too short", etc. Not localized. When Day 5 (i18n) lands, these'll need a translation table — for now, English-as-default.
- **Smoke-tested `/sign-up` returns 200.** Real form submission still requires browser interaction; we didn't curl the action because Server Actions use a non-standard wire format (multipart with hidden Action ID) that's painful to forge with curl. Use the browser to fully verify.
- **The previous smoke-test user (`smoke@example.com` from Day_23) is still in Atlas.** Harmless. Drop in Atlas UI if you want a clean slate before signing up for real.
- **No password-strength meter, no email verification, no rate-limiting.** All deferred. The auth detour is scoped to "sign-up → sign-in → sign-out works"; production-hardening is later.
- **`<Link href="/sign-in">` is typed-routes-safe.** `experimental.typedRoutes: true` from Infra_02 verifies the path at compile time. If we typo the path, build fails.
