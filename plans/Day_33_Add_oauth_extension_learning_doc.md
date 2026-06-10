# Day_33_Add_oauth_extension_learning_doc

## Goal

**Opens Phase F.** Doc-first explanation of OAuth 2.0 — specifically how Better Auth's `socialProviders.google` config wires the Google handshake, why `BETTER_AUTH_URL` must match the redirect URI registered in Google Cloud Console, and how the `Account` table links a `User` to one or more providers (password, Google, future GitHub). Previews the 2-file diff `Day_35` will ship: `lib/auth.ts` adds `socialProviders.google`, sign-in page gets a third button below the magic-link form.

Pure docs commit. Manual Google Console walkthrough lands as `Day_34`'s plan-file; code lands in `Day_35`.

## Summary

**Files at a glance**

| Group     | Files                                                              |
| --------- | ------------------------------------------------------------------ |
| Plan doc  | `plans/Day_33_Add_oauth_extension_learning_doc.md`                 |
| Learning  | `docs/learning/day7_oauth_extension.md`                            |
| Index     | `docs/README.md` (Learning Journal + Auth Detour checklist row)    |

**What you'll run / what you'll see**

| Command                                                       | What it does                                                                                |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Open `docs/learning/day7_oauth_extension.md`                  | ~580 lines: full 7-step OAuth handshake ASCII diagram, the BETTER_AUTH_URL match rule + 4 common mismatch causes table, the Account table's role in account-linking, the minimum API surface (`socialProviders.google` config + sign-in button), the lazy-fallback `?? ""` pattern matching Day_32's Resend approach, scope guardrail, 8 gotchas, 5 quiz items. |
| Open `docs/README.md` Learning Journal                        | Phase 3 → Day 7 now lists **seven** docs (overview, install, email/password, session, protecting, resend-magic-link, oauth-extension). |
| Open `docs/README.md` Auth Detour Checklist                   | "OAuth callback URLs" row flips from pending → covered. Pending count drops to 3 (Day_34 manual, Day_35 code, Day_36 close-out). |

> Pure docs commit. Phase F opens; closes in 3 more commits.

## Commands

```bash
# Nothing to run. Reading the doc IS the work.
# Optional sanity check:
pnpm typecheck && pnpm lint
```

## Files changed

- `plans/Day_33_Add_oauth_extension_learning_doc.md` — **created**: this file.
- `docs/learning/day7_oauth_extension.md` — **created**: ~580-line learning doc following PROMPT.md §2.1. Sections:
  - **What/Why**: third sign-in option vs password + magic-link; 3 user-side benefits (mobile-friendly one-click, implicit email verification, profile data for free); the Google-dependency trade-off.
  - **How It Works**:
    - Full 7-step OAuth handshake ASCII diagram, labelling each leg (sign-in click → authorize URL → consent → callback → token exchange → user info fetch → session creation → final redirect).
    - **The redirect URI match rule** with a table of 4 common mismatch causes (port shift, preview URLs, http vs https, trailing slash).
    - The **`Account` table's role**: one User can have many Account rows (password + Google + future GitHub), each pinned by `providerId`.
    - **Trusted providers** explanation: Better Auth's default links accounts by verified email (so password + Google with same email = one User, two Accounts).
    - **Minimum API surface** Day_35 will ship: `socialProviders.google: { clientId, clientSecret }` in `lib/auth.ts` (with the `?? ""` lazy fallback explained), plus a Server Action that calls `auth.api.signInSocial` and a button in the page.
    - **Scope guardrail**: out of scope = other providers (GitHub, Apple, Discord), profile-page "Connect Google" flow, custom OAuth scopes, token refresh / API access.
  - **Tiny Isolated Example**: the 4-line `socialProviders` config + the inline-Server-Action button pattern in 12 lines combined.
  - **Applied to Buddies**: per-commit table for Day_34 (manual) + Day_35 (code).
  - **Gotchas**: 8 items including the redirect_uri_mismatch failure mode (the #1 OAuth bug), localhost port shift, the secret-must-be-server-only rule, OAuth scopes declared on consent screen separately, External vs Internal consent screen choice (External for anyone-signs-up), app verification for production (deferred), `signInSocial` returns URL not Response (Server Action must `redirect(url)`), access tokens expire after 1 hour.
  - **Quiz**: 5 questions with `<details>` answers — diagnosing `redirect_uri_mismatch`; account linking by verified email; where the session cookie is set; why secret must be server-only; whether `pnpm build` fails without creds (no — lazy fallback).
- `docs/README.md` — **edited** twice:
  1. **Learning Journal:** adds `day7_oauth_extension.md` link under Phase 3 → Day 7 (after the resend-magic-link doc).
  2. **Auth Detour Checklist:** flips "OAuth callback URLs — why `BETTER_AUTH_URL` must match Google Console" row from pending → covered, tagged `Day_33`. Covered: 17 → 18; pending: 4 → 3.

## Verification

1. Open `docs/learning/day7_oauth_extension.md` — title is "OAuth Extension: Sign In with Google", contains the 7-step ASCII handshake diagram, the 4-row mismatch-cause table, the lazy-fallback `?? ""` rationale, 8 gotchas, 5 quiz items in `<details>` blocks.
2. Open `docs/README.md` — under **Phase 3 → Day 7** in Learning Journal there are now **seven** entries.
3. Open `docs/README.md` — Auth Detour Checklist shows "OAuth callback URLs" under **Concepts covered ✅** with `Day_33` tag. Covered: **18**, pending: **3**.
4. Run `git log --oneline -2` — top two commits are `Day_33_Add_oauth_extension_learning_doc` and `Day_32_Install_resend_and_add_email_wrapper`.
5. Run `ls docs/learning/day7_*.md` — exactly seven files.
6. `pnpm typecheck && pnpm lint` — both pass.

## Gotchas / decisions

- **No code change in this commit.** Same convention as every other doc-first opener.
- **The doc commits to the `?? ""` lazy-fallback pattern** for the Google config, matching Day_32's Resend lazy-init. Both are forms of "make missing config a runtime error, not a build error" — important because the build runs in CI where creds typically aren't set.
- **`trustedProviders` is explained but accepted as default.** Better Auth's default trusts Google (it has a strong email verification story), so we don't override. If we later add an untrusted provider (e.g. self-hosted Authelia), the discussion comes back.
- **External consent screen explicitly recommended** in the gotchas. Internal would lock the app to your Google Workspace org, which is the wrong choice for an anyone-can-sign-up product.
- **App verification is named but deferred.** External apps go into Testing mode (max 100 listed test users) until Google verifies. For learning-project scope that's fine; production launch would need to submit.
- **No mention of PKCE.** Better Auth handles PKCE under the hood for OAuth Authorization Code flow; the user (and we) don't have to think about it. Mentioned for completeness in the References section's OAuth spec link but not in the body.
- **Forward-references to Day_34 + Day_35** in the "What's Next" section. The reader sees the remaining path.
- **Tracker note unchanged.** Day 2 row stays at "11 of 12 commits"; detour progress lives in the Auth Detour checklist.
