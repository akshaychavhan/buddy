# Day_24_Add_email_password_flow_learning_doc

## Goal

**Opens Phase C** of the Auth Detour. Doc-first explanation of how a Server Action moves a form submission from browser → Next.js → Better Auth → MongoDB → back to the browser as a cookie + redirect. Walks the full 6-step lifecycle (FormData collection → POST → Server Action lookup → `auth.api.signUpEmail(...)` → password hash → User + Account + Session writes → `Set-Cookie` + 303). Includes the **three-file pattern** (`actions.ts` / `page.tsx` / `form.tsx`) that `Day_25`/`Day_26`/`Day_28` will all use.

After reading this, the upcoming three code commits land as routine application — sign-up form, sign-in form (replaces Day_07 stub), and sign-out button.

Pure docs commit. No app code, no Server Actions yet.

## Summary

**Files at a glance**

| Group     | Files                                                          |
| --------- | -------------------------------------------------------------- |
| Plan doc  | `plans/Day_24_Add_email_password_flow_learning_doc.md`         |
| Learning  | `docs/learning/day7_email_password_flow.md`                    |
| Index     | `docs/README.md` (Learning Journal + Auth Detour checklist row) |

**What you'll run / what you'll see**

| Command                                                        | What it does                                                                                |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Open `docs/learning/day7_email_password_flow.md`               | ~480 lines: `"use server"` mechanics, full 6-step lifecycle ASCII diagram, what `auth.api.signUpEmail` does internally (7 sub-steps), Zod-vs-hand-rolled trade-off, `useFormState` pattern with code, the `redirect()`-inside-try/catch footgun, 8 gotchas, 5-question quiz. |
| Open `docs/README.md` Learning Journal                         | Phase 3 → Day 7 now lists **three** docs (overview, install, email/password flow). |
| Open `docs/README.md` Auth Detour Checklist                    | "Email/password Server Action flow" row flips from pending → covered. Covered: 9 → 10; pending: 13 → 12. |

> Pure docs commit. The first code applying it is `Day_25` (sign-up page + action).

## Commands

```bash
# Nothing to run. Reading the doc IS the work.
# Optional sanity check:
pnpm typecheck && pnpm lint
```

## Files changed

- `plans/Day_24_Add_email_password_flow_learning_doc.md` — **created**: this file.
- `docs/learning/day7_email_password_flow.md` — **created**: ~480-line learning doc following PROMPT.md §2.1. Sections:
  - **What/Why**: how Server Actions replace `useState`/`onSubmit`/`fetch` in the Pages-Router-era form pattern; one shape (form-action reference) instead of six (form state, controlled inputs, fetch, JSON, error state, client-side redirect).
  - **How It Works**:
    - `"use server"` mechanics — file-level vs inline placement.
    - **Full 6-step ASCII lifecycle diagram** from button click to redirect, with explicit "this runs on server" / "this runs in browser" annotations.
    - What `auth.api.signUpEmail` does internally (7 sub-steps: validate → check duplicate → scrypt hash → User row → Account row → Session row → return token + user; plus the cookie set via `headers()`).
    - Validation decision (rely on Better Auth's built-in validation for the auth detour; Zod comes for Trip CRUD later).
    - `useFormState` pattern with full code example for inline error feedback.
    - **The redirect-inside-try/catch footgun** explained — `redirect()` throws `NEXT_REDIRECT` which a generic catch swallows. Fix: redirect outside the try.
  - **Tiny Isolated Example**: full three-file example (`actions.ts` / `page.tsx` / `sign-up-form.tsx`) that's the exact shape `Day_25` will land.
  - **Applied to Buddies**: per-commit table for `Day_25` / `Day_26` / `Day_28`.
  - **Gotchas**: 8 items including `redirect()` only on server; `<form action>` ≠ `onSubmit`; `useFormState` requires `"use client"`; `auth.api.signUpEmail` requires `headers: headers()`; Server Actions are not RPC.
  - **Quiz**: 5 questions with `<details>` answers — where JS ships, why `action` not `onSubmit`, the NEXT_REDIRECT trap, what `useFormState` adds, the missing-headers-no-cookie consequence.
- `docs/README.md` — **edited** twice:
  1. **Learning Journal:** adds `day7_email_password_flow.md` link under Phase 3 → Day 7 (after the install doc).
  2. **Auth Detour Checklist:** flips "Email/password Server Action flow" row from pending → covered, tagged `Day_24` (doc) + `Day_26` (code). Covered: 9 → 10; pending: 13 → 12.

## Verification

1. Open `docs/learning/day7_email_password_flow.md` — title is "Email/Password Sign-Up & Sign-In: The Server Action Flow", contains the 6-step lifecycle ASCII diagram, the `auth.api.signUpEmail` 7-sub-step breakdown, the three-file pattern code example, 8 gotchas, 5 quiz items in `<details>` blocks.
2. Open `docs/README.md` — under **Phase 3 → Day 7** in Learning Journal there are now **three** entries: overview, install, email/password flow.
3. Open `docs/README.md` — Auth Detour Checklist shows "Email/password Server Action flow" under **Concepts covered ✅** with `Day_24` tag. Covered: **10**, pending: **12**.
4. Run `git log --oneline -2` — top two commits are `Day_24_Add_email_password_flow_learning_doc` and `Day_23_Add_better_auth_api_route_handler`.
5. Run `ls docs/learning/day7_*.md` — exactly three files.
6. `pnpm typecheck && pnpm lint` — both pass.

## Gotchas / decisions

- **No code change in this commit.** Same convention as Day_19/Day_20: doc-first. The code that applies this lands in `Day_25`/`Day_26`.
- **The doc commits to the `useFormState` pattern** for inline errors, even though it adds Client Component overhead. The alternative — a plain `<form action={signUpAction}>` that redirects on success and shows a Next.js error page on failure — works but provides terrible UX (full-page error overlay instead of "your email is already taken" in red text below the field).
- **No `useFormStatus`** for pending state in the doc — that's an extension we'll add in Day_25's code if it improves UX. Doc keeps the surface area focused on the two essential hooks.
- **No Zod yet.** The Better Auth `auth.api.signUpEmail({ body: { email, password, name } })` API already validates format/length server-side. Adding Zod *on top* would be belt-and-suspenders for the auth detour; we'll introduce Zod proper when Trip CRUD lands (Day_4 in the master roadmap, which has its own forms work).
- **The doc names the redirect-inside-try/catch trap explicitly** — this is the single most common Server Action bug in the wild. Naming it in the doc means future-you walking `git checkout Day_24` learns the gotcha *before* hitting it in code.
- **Tracker note unchanged.** Day 2 row still "11 of 12 commits"; detour progress lives in the Auth Detour checklist.
- **The "Applied to Buddies" section names three future commits.** This is the first time the Phase C → Day_28 sequence is laid out concretely. The `useFormState`/redirect/error patterns described here will all repeat across all three.
