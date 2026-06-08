# Day_32_Install_resend_and_add_email_wrapper

## Goal

**Closes Phase E.** Ships the magic-link flow Day_31's doc previewed. Four pieces:

1. `pnpm add resend` — installs the Resend SDK (`resend@6.12.4`).
2. **Create** `lib/email.ts` — single `sendMagicLink({ email, url })` export wrapping Resend, with **lazy initialization** so missing `RESEND_API_KEY` doesn't break `pnpm build`.
3. **Edit** `lib/auth.ts` — add `magicLink({ sendMagicLink: ... })` to the Better Auth plugins array.
4. **Edit** `app/(auth)/sign-in/actions.ts` + `page.tsx` and **create** `magic-link-form.tsx` — add a parallel magic-link form below the email/password form, separated by an "or" divider.

After this commit, `/sign-in` shows two ways in: classic email+password (Day_26) and email-only magic-link (this commit). **You need a Resend account + API key in `.env.local` to actually test the magic-link path** — without it, the build passes but the form returns a clear "RESEND_API_KEY is not set" error on submit.

## Summary

**Files at a glance**

| Group     | Files                                                                  |
| --------- | ---------------------------------------------------------------------- |
| Plan doc  | `plans/Day_32_Install_resend_and_add_email_wrapper.md`                 |
| App code  | `lib/email.ts` (new), `lib/auth.ts` (edited), `app/(auth)/sign-in/actions.ts` (edited), `app/(auth)/sign-in/magic-link-form.tsx` (new), `app/(auth)/sign-in/page.tsx` (edited) |
| Config    | `package.json` + `pnpm-lock.yaml` (resend dep)                          |
| Local-only | `.env.local` (RESEND_API_KEY — your machine only, gitignored)         |

**What you'll run / what you'll see**

| Step                                                            | What happens                                                                                |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `pnpm add resend`                                               | `package.json` gains `"resend": "^6.12.4"`. Lockfile updated. |
| Browse `/sign-in`                                               | Two forms now: the existing password form, then an "or" divider, then a new "Email me a link" form with a single email input. |
| Submit magic-link form **without** `RESEND_API_KEY` set         | Error renders inline: "RESEND_API_KEY is not set. Add it to .env.local before sending email." Clear pointer at the missing config. |
| Set `RESEND_API_KEY` in `.env.local`, restart dev, submit form  | Form shows green "Check your inbox" status. Email arrives in ~5 seconds at the address typed (must match your Resend-verified sender for the free tier). |
| Click the link in the email                                     | Browser → `/api/auth/magic-link/verify?token=...` → Better Auth verifies + creates the User (if needed) + creates a Session + sets the cookie + redirects to `/`. Signed in. |
| `pnpm build`                                                    | Passes cleanly even without `RESEND_API_KEY`. The lazy-init pattern ensures missing config = runtime error on first send, not build-time module-load error. |

> Phase E complete. Magic-link works end-to-end after manual Resend account setup.

## Commands

```bash
# Install.
pnpm add resend

# (Then create lib/email.ts, edit lib/auth.ts, etc. See Files changed.)

# Manual setup (before testing the magic-link path):
#   1. Sign up at https://resend.com (free tier)
#   2. Create an API key in the dashboard
#   3. Paste into .env.local as RESEND_API_KEY="re_..."
#   4. (Optional) Set EMAIL_FROM in .env.local — defaults to "Buddies <onboarding@resend.dev>"
#      The default works in dev but only delivers to your verified Resend account email.

# Verify build.
nvm use
pnpm build         # should pass even without RESEND_API_KEY
pnpm typecheck
pnpm lint

# Smoke-test the magic-link flow in a browser.
pnpm dev
# Open /sign-in, fill the magic-link form, click "Email me a link".
# - Without RESEND_API_KEY: red error banner.
# - With RESEND_API_KEY: green "Check your inbox" status.
```

## Files changed

- `plans/Day_32_Install_resend_and_add_email_wrapper.md` — **created**: this file.
- `package.json` + `pnpm-lock.yaml` — **edited** by `pnpm add`: adds `resend@^6.12.4` to dependencies. ~7 new transitive packages.
- `lib/email.ts` — **created**: 39 lines. Lazy singleton pattern via `getResend()` — the `Resend` instance is constructed on the first call, not at module load. Throws a clear `"RESEND_API_KEY is not set..."` error if the env var is missing. `FROM` defaults to `"Buddies <onboarding@resend.dev>"` (Resend's testing sender, no DNS verification needed). Single exported function `sendMagicLink({ email, url })` that sends a minimal HTML email with the click-through link and a 10-minute expiry note.
- `lib/auth.ts` — **edited**: added `import { magicLink } from "better-auth/plugins";` and `import { sendMagicLink } from "@/lib/email";`. Added `plugins: [magicLink({ sendMagicLink: async ({ email, url }) => { await sendMagicLink({ email, url }) } })]` to the betterAuth config. Existing `emailAndPassword.enabled` unchanged.
- `app/(auth)/sign-in/actions.ts` — **edited**: added a `getString(formData, key)` helper to satisfy SonarLint S6551 (FormData values can be `File`; we narrow to `string`). Refactored the existing `signInAction` to use it. Added `magicLinkAction(prevState, formData)` that calls `auth.api.signInMagicLink({ body: { email }, headers })` and returns `{ error: null, sent: true }` on success or `{ error: message, sent: false }` on failure — no `redirect()`, because the user stays on `/sign-in` to read the "check your inbox" status.
- `app/(auth)/sign-in/magic-link-form.tsx` — **created**: 65 lines, `"use client"` at the top. Mirrors `sign-in-form.tsx`'s shape but with a single email input, a green success banner showing "Check your inbox (and your spam folder)" when `state.sent` is true, and a button labeled "Email me a link" / "Sending…" during pending. Uses `useFormState` for the action binding and `useFormStatus` (in a nested `SubmitButton`) for the pending text.
- `app/(auth)/sign-in/page.tsx` — **edited**: imports both `SignInForm` and `MagicLinkForm`. Renders password form, then a thin "or" divider (two `<div>` lines flanking a small "or" text), then the magic-link form. Header subtext shortened to "Welcome back." (was: "Welcome back. Magic-link and Google sign-in land later in Day 7." — that promise is now fulfilled).

## Verification

1. `ls lib/` — shows `email.ts` alongside `auth.ts` and `prisma.ts`.
2. `ls "app/(auth)/sign-in/"` — shows `page.tsx`, `actions.ts`, `sign-in-form.tsx`, `magic-link-form.tsx`.
3. `cat lib/email.ts | grep "let resend"` — confirms the lazy-singleton pattern (the Resend client is NOT constructed at module load).
4. `cat lib/auth.ts | grep "magicLink"` — shows the import + the plugins entry.
5. `pnpm build` — passes cleanly even without `RESEND_API_KEY` set. This is the **critical regression check**: a missing env var should fail at request time, not build time.
6. `pnpm typecheck && pnpm lint` — both pass.
7. `pnpm dev` then in a browser:
   - Browse `/sign-in` — two forms visible separated by "or".
   - Submit magic-link form with empty `RESEND_API_KEY` → red banner: "RESEND_API_KEY is not set. Add it to .env.local before sending email."
   - Add `RESEND_API_KEY` to `.env.local`, restart dev, submit again → green "Check your inbox" status banner. Email arrives in your inbox.
   - Click email link → signed in, redirected to `/`.
8. Atlas → Browse Collections → `verification` collection: a new row appears the moment the magic-link is requested, with `identifier` = email, `value` = random token, `expiresAt` = now + 10min. Row is deleted after a successful verify click.

## Gotchas / decisions

- **Lazy Resend init is the key architectural choice.** Day_31's doc didn't predict the build-time failure mode, but the first build attempt hit it: `new Resend(undefined)` throws at module evaluation, which breaks `pnpm build`'s page-data collection for any route under `(app)` (because the layout imports `auth → magicLink → sendMagicLink → email`, and Next pre-runs the layout to collect static data). The fix — lazy singleton via `getResend()` — keeps the Resend instance unconstructed until `sendMagicLink` is actually called. Now the build passes even on a CI machine with no API key.
- **`onboarding@resend.dev` is the dev sender.** Free-tier Resend only delivers to your verified account email when sending from `onboarding@resend.dev`. For real users, verify a domain (TXT records for DKIM/SPF) and set `EMAIL_FROM` in `.env.local`. Day 11 will revisit this.
- **`auth.api.signInMagicLink` is the request endpoint, not `sendMagicLink`.** Better Auth's API: `signInMagicLink` triggers the flow (generates token, writes Verification row, invokes `sendMagicLink` callback). The callback is *our* function. Naming collision is unfortunate but matches the docs.
- **No `redirect()` in `magicLinkAction`.** Unlike `signInAction` (which signs in immediately + redirects to `/`), `magicLinkAction` only *triggers* the email send — the user stays on `/sign-in` to see the "check your inbox" status and to actually click the email link. The redirect happens later, on the verify route.
- **The `getString` helper extracts a 3-line repeated pattern.** SonarLint S6551 flagged `String(formData.get("email") ?? "")` because `formData.get()` can return `File`, and `String(<File>)` stringifies to `[object Object]`. The helper narrows to `string` explicitly. Same pattern lives uncorrected in Day_25's `sign-up/actions.ts` — we'll backfill if/when those gotchas resurface; otherwise the cleanup belongs to a focused `Fix_NN` commit.
- **Error UX: the inline error shows the literal Resend error message.** "RESEND_API_KEY is not set..." is helpful for the developer running locally. For production-grade UX you'd want a friendlier user-facing message ("Email service is temporarily unavailable") and the raw error in server logs only. Deferred — same a11y / polish bucket as Day_25/Day_26.
- **No "resend in N seconds" rate limiting.** A determined attacker could submit the magic-link form repeatedly to spam an email address. Better Auth's plugin has built-in throttle (per-email + per-IP); we accept the defaults for the detour. Tightening lives later.
- **No "redirect signed-in users away from `/sign-in`"** — Day_29's deferred follow-up. Not addressed here.
- **`pnpm-lock.yaml` is committed.** Standard for our setup; CI uses it to reproduce installs exactly.
- **Build summary**: `/sign-in` grew from 907 B → 1.17 kB First Load (~260 B for the magic-link form's client chunk). Negligible.
