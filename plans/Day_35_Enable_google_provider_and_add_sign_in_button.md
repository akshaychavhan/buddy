# Day_35_Enable_google_provider_and_add_sign_in_button

## Goal

**Closes Phase F** and brings the auth detour's user-visible work to completion. Wires Google OAuth into Better Auth and adds the third sign-in option below the existing email/password form and the magic-link form. After this commit, `/sign-in` shows **three** options separated by "or" dividers, and a real OAuth round-trip works the moment `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` are populated in `.env.local`.

## Summary

**Files at a glance**

| Group     | Files                                                                       |
| --------- | --------------------------------------------------------------------------- |
| Plan doc  | `plans/Day_35_Enable_google_provider_and_add_sign_in_button.md`             |
| App code  | `lib/auth.ts` (edited), `app/(auth)/sign-in/actions.ts` (edited), `app/(auth)/sign-in/google-sign-in-button.tsx` (new), `app/(auth)/sign-in/page.tsx` (edited) |
| Index     | `docs/README.md` (Auth Detour checklist row flipped)                        |

**What you'll run / what you'll see**

| Step                                                                | What happens                                                                                |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Browse `/sign-in`                                                   | Three options stacked: password form → "or" divider → magic-link form → "or" divider → "G Sign in with Google" button. |
| Click "Sign in with Google" **without** Google creds in `.env.local` | Button label flips to "Redirecting…" while the Server Action runs. Google rejects `invalid_client`. Better Auth surfaces the error. User stays on `/sign-in`. |
| Set `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` in `.env.local`, restart dev, click button | Server Action calls `auth.api.signInSocial({ provider: "google" })` → gets back the Google authorize URL → `redirect(url)`. Browser → Google consent screen → Allow → callback → cookie set → redirect to `/`. |
| `pnpm build`                                                        | Passes. Build logs include `WARN [Better Auth]: Social provider google is missing clientId or clientSecret` when creds aren't set — **expected** because of the `?? ""` lazy fallback. |

> Phase F complete. End-to-end OAuth works the moment manual setup from Day_34 is done.

## Commands

```bash
# Edit lib/auth.ts, create google-sign-in-button.tsx, edit actions.ts + page.tsx.
# See Files changed below.

# Verify locally.
nvm use
pnpm build         # warning about missing Google creds is expected; build passes
pnpm typecheck
pnpm lint
pnpm dev           # browse /sign-in, see three options
```

## Files changed

- `plans/Day_35_Enable_google_provider_and_add_sign_in_button.md` — **created**: this file.
- `lib/auth.ts` — **edited**: adds `socialProviders.google: { clientId: process.env.GOOGLE_CLIENT_ID ?? "", clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "" }` between `emailAndPassword` and `plugins`. The `?? ""` fallback is the **lazy-config pattern** matching Day_32's Resend init — empty strings are valid at build time; failures surface only when a user actually clicks the button. Comment block above the config explains the rationale inline.
- `app/(auth)/sign-in/actions.ts` — **edited**: adds a new `googleSignInAction()` Server Action (no args, no `prevState` — it's a no-form trigger). Calls `auth.api.signInSocial({ body: { provider: "google" }, headers: await headers() })`, expects back a `{ url }`, and calls `redirect(url)`. Throws an explicit error if `url` is missing (defensive — shouldn't happen in normal flow but better than a silent no-op). Uses the same `eslint-disable-next-line @typescript-eslint/await-thenable` comment we use elsewhere for `await headers()`.
- `app/(auth)/sign-in/google-sign-in-button.tsx` — **created**: 26 lines, `"use client"`. Wraps a `<form action={googleSignInAction}>` around a nested `SubmitButton` that uses `useFormStatus()` to flip the label to "Redirecting…" during pending. Bare-bones "G" mark for now (an `<span aria-hidden="true">` with bold "G") — Day 3's design-token pass will swap in a real Google logo SVG. No `useFormState` because there's no error UI to surface inline (sign-in success = redirect; failures get surfaced server-side via Better Auth's error flow).
- `app/(auth)/sign-in/page.tsx` — **edited**: imports `GoogleSignInButton`. Adds a **second "or" divider** below the magic-link form, then renders `<GoogleSignInButton />` below it. The page now reads top-to-bottom: heading → password form → divider → magic-link form → divider → Google button.
- `docs/README.md` — **edited**: Auth Detour checklist row "Google provider enabled + 'Sign in with Google' button — three auth methods coexist" flips from **Concepts pending ⏳** to **Concepts covered ✅**, tagged `Day_35`. Covered: 19 → 20; pending: 2 → 1.

## Verification

1. `cat lib/auth.ts | grep -A 4 "socialProviders"` — shows the Google config with the `?? ""` fallback.
2. `ls "app/(auth)/sign-in/"` — now lists `actions.ts`, `google-sign-in-button.tsx`, `magic-link-form.tsx`, `page.tsx`, `sign-in-form.tsx`.
3. `pnpm typecheck && pnpm lint` — both pass.
4. `pnpm build` — passes. Log contains `WARN [Better Auth]: Social provider google is missing clientId or clientSecret` if creds aren't set (expected). Build summary shows `/sign-in` at 1.35 kB + 97.3 kB First Load (was 1.17 kB before — ~180 B added for the Google button client chunk).
5. `pnpm dev` then browse `/sign-in`:
   - Three sections visible: password form, magic-link form, Google button — each separated by an "or" divider.
   - Click "Sign in with Google" → "Redirecting…" briefly → either Google consent screen (if creds set) or Better Auth's invalid-client error page (if not).
6. After full setup (creds in `.env.local`):
   - Sign in via Google → redirected to `/` → header shows your Google name.
   - Atlas → `user` collection: new row with name + email + image (Google avatar URL).
   - Atlas → `account` collection: row with `providerId: "google"`, `accountId: <google-user-id>`, linked to the user.
7. `docs/README.md` Auth Detour Checklist: 20 covered, 1 pending (Day_36 close-out), 4 deferred.

## Gotchas / decisions

- **The `?? ""` lazy fallback is the key build-passes-without-creds choice.** Without it, `betterAuth({ socialProviders: { google: { clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET } } })` would receive `undefined` for both fields, and Better Auth would either throw at module load or build a malformed authorize URL. The empty-string fallback keeps the config object well-typed and well-formed; failure moves to runtime where Google's `invalid_client` response gives a clear signal.
- **The `WARN` line in the build log is expected**, not a bug. Better Auth logs it once at module load. It tells future-you "creds aren't set yet" — exactly what we want.
- **`auth.api.signInSocial` returns `{ url, redirect: true }`**, not a Response object. Our Server Action has to call `redirect(url)` after. Mixing this up (returning the URL from the action) would leave the user sitting on `/sign-in` with nothing happening. The explicit `if (!url) throw ...` is defensive — protects against a future Better Auth API change.
- **No `useFormState` on the Google button.** Unlike the magic-link form (where we needed to display "check your inbox" after a non-redirect submit), the Google flow is "click → server action → 302 redirect to Google." There's no inline state to render. `useFormStatus()` is enough for the "Redirecting…" pending text.
- **Bare "G" mark, not a real Google logo.** Two reasons. (1) Google's brand guidelines for the "Sign in with Google" button are strict (specific SVG, specific colors, specific sizing). Embedding an inline SVG inline is the right answer; doing it inside Day_35 would balloon the diff. (2) Day 3's design-token + theme work is the natural home for "set up the icon library and add brand SVGs." The bare "G" is a temporary placeholder.
- **No "Continue with Google" wording.** Google's brand guidelines prefer "Sign in with Google" or "Continue with Google" — we picked "Sign in with Google" to match the page's verb ("Sign in to Buddies"). If Day 3 lands a polished button using Google's own component, the wording may shift.
- **Same a11y polish gaps as the rest of the auth pages.** No `focus-visible:` ring, `text-neutral-500` for the divider "or" label. Same deferral to Day 3's design-token pass.
- **The button doesn't show a different state when clicked twice.** A user who double-clicks gets two `googleSignInAction` invocations; both call `auth.api.signInSocial`; both return a URL; both call `redirect()`. The browser follows only the first redirect; the second response is discarded. Harmless, but worth noting for future polish.
- **No GitHub / Apple / Discord providers added.** Adding GitHub would be: register the GitHub OAuth app (analog of Day_34), add `github: { clientId, clientSecret }` to `socialProviders`, add a `<GitHubSignInButton />` that mirrors `<GoogleSignInButton />`. Copy-paste extension. Out of scope for the detour.
- **`Day_36` closes the loop.** Auth Detour checklist freezes; Day 2 / Day 6 (partial) / Day 7 progress-tracker rows flip in one epilogue commit.
