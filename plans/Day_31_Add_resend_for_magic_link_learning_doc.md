# Day_31_Add_resend_for_magic_link_learning_doc

## Goal

**Opens Phase E.** Doc-first explanation of how to add **magic-link sign-in** (passwordless authentication via emailed link) to Buddies. Pulls forward only the magic-link slice of Resend — the broader transactional-email use cases (trip invitations, reminders, marketing) stay scoped for Day 11 proper. The doc explains the full end-to-end flow, the minimum API surface (`lib/email.ts` + Better Auth plugin), why we use the already-existing `Verification` table from `Day_22`, and the 10 gotchas that bite first-time magic-link implementers.

Pure docs commit. Code lands in `Day_32`.

## Summary

**Files at a glance**

| Group     | Files                                                            |
| --------- | ---------------------------------------------------------------- |
| Plan doc  | `plans/Day_31_Add_resend_for_magic_link_learning_doc.md`         |
| Learning  | `docs/learning/day7_resend_for_magic_link.md`                    |
| Index     | `docs/README.md` (Learning Journal + Auth Detour checklist row)  |

**What you'll run / what you'll see**

| Command                                                       | What it does                                                                                |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Open `docs/learning/day7_resend_for_magic_link.md`            | ~550 lines: Resend vs alternatives table, full 6-step end-to-end flow ASCII diagram, the minimum API surface (3 file changes Day_32 will ship), why we use the existing `Verification` table, **scope guardrail** (what this is NOT, deferred to Day 11), 10 gotchas, 5-question quiz. |
| Open `docs/README.md` Learning Journal                        | Phase 3 → Day 7 now lists **six** docs (overview, install, email/password, session, protecting, resend-magic-link). |
| Open `docs/README.md` Auth Detour Checklist                   | "Magic-link via Resend" row flips from pending → covered. Covered: 16 → 17; pending: 5 → 4. |

> Pure docs commit. The `pnpm add resend` + code lands in `Day_32`. Manual Resend account setup is also Day_32.

## Commands

```bash
# Nothing to run. Reading the doc IS the work.
# Optional sanity check:
pnpm typecheck && pnpm lint
```

## Files changed

- `plans/Day_31_Add_resend_for_magic_link_learning_doc.md` — **created**: this file.
- `docs/learning/day7_resend_for_magic_link.md` — **created**: ~550-line learning doc following PROMPT.md §2.1. Sections:
  - **What/Why**: magic-link collapses sign-up, sign-in, and forgot-password into one flow; trade-off is "users need email access" (same threat model as password reset). Why magic-link is the better default for a low-friction app like Buddies.
  - **How It Works**:
    - **What Resend is** (one POST endpoint, tiny SDK, free tier).
    - **Comparison table** vs SendGrid, Postmark, AWS SES, raw SMTP — Resend wins on DX for small apps.
    - **The full 6-step end-to-end flow** in ASCII art (user types email → POST → Better Auth generates token + writes Verification row → calls `sendMagicLink` callback → Resend delivers → user clicks → Better Auth verifies → cookie + redirect).
    - **The minimum API surface Day_32 will ship**: three file changes (`lib/email.ts` created, `lib/auth.ts` edited to add the magicLink plugin, `app/(auth)/sign-in/page.tsx` + `actions.ts` edited to add the magic-link form).
    - **Why we use the existing `Verification` table** (already created by Day_22's CLI run — it was waiting for exactly this commit).
    - **Scope guardrail**: explicit "what this is NOT, deferred to Day 11" section listing trip invitations, reminders, receipts, React Email templates, webhooks. Keeps the detour from sprawling.
  - **Tiny Isolated Example**: 5-line Resend send call, isolated from any framework, to show the smallest possible useful snippet.
  - **Applied to Buddies**: per-file change table for Day_32 with line-count estimates and the manual-setup callout.
  - **Gotchas**: 10 items including `RESEND_API_KEY` must be set, `EMAIL_FROM` must be a verified sender (with the `onboarding@resend.dev` shortcut for dev), token-in-cleartext-URL security model, one-time use, 10-min expiry default, magic-link creates the user automatically (sign-up + sign-in in one flow), unhashed Verification.value as a real-world hardening hint, Resend's subject-line logging, ~5s arrival expectation, spam-folder reality.
  - **Quiz**: 5 questions with `<details>` answers — why callback-based instead of built-in Resend integration; what happens after 15min (expiry); welcome-email scope creep guardrail; the `console.log` dev pattern; why delete the row after use (security).
- `docs/README.md` — **edited** twice:
  1. **Learning Journal:** adds `day7_resend_for_magic_link.md` link under Phase 3 → Day 7 (after the protecting-pages doc).
  2. **Auth Detour Checklist:** flips "Magic-link via Resend" row from pending → covered, tagged `Day_31` (doc) + `Day_32` (code). Covered: 16 → 17; pending: 5 → 4.

## Verification

1. Open `docs/learning/day7_resend_for_magic_link.md` — title is "Resend for Magic-Link Sign-In", contains the comparison table, the 6-step ASCII flow diagram, the three-file Day_32 preview, the scope-guardrail section explicitly excluding Day 11 work, 10 gotchas, 5 quiz items in `<details>` blocks.
2. Open `docs/README.md` — under **Phase 3 → Day 7** in Learning Journal there are now **six** entries.
3. Open `docs/README.md` — Auth Detour Checklist shows "Magic-link via Resend" under **Concepts covered ✅** with `Day_31 (doc) + Day_32 (code)` tag. Covered: **17**, pending: **4**.
4. Run `git log --oneline -2` — top two commits are `Day_31_Add_resend_for_magic_link_learning_doc` and `Day_30_Add_protected_app_routes_via_layout_guard`.
5. Run `ls docs/learning/day7_*.md` — exactly six files.
6. `pnpm typecheck && pnpm lint` — both pass.

## Gotchas / decisions

- **No code change in this commit.** Same convention as all other doc-first openers (Day_19, Day_20, Day_24, Day_27, Day_29).
- **The doc makes the scope-guardrail explicit.** A "What this is NOT" section names trip invitations, reminders, receipts, React Email templates, etc. Without that fence, this commit could easily sprawl into a full Day-11 redo. Naming the boundary in the doc means future-me reading it remembers *why* it's only magic-link.
- **`onboarding@resend.dev` is the shortcut for dev.** Real domain verification requires DNS setup (TXT records for DKIM/SPF). For the auth detour we use Resend's test sender to skip DNS work. Day 11 proper will verify a real domain.
- **The `console.log` dev pattern is mentioned in the quiz.** Quiz item 4 explicitly names the "skip Resend in dev, just console.log the URL" pattern — that's a useful escape hatch if Resend's free-tier limit ever becomes annoying during iteration. We're not using it for the detour (we want the end-to-end flow to be real), but flagging it as a tool in the box.
- **Unhashed `Verification.value` is named as a real-world hardening hint** but not fixed in this detour. Gotcha #7 acknowledges that production-grade systems hash the token (so DB-read access can't extract live tokens). Better Auth doesn't ship this OOTB. For a learning project the un-hashed default is acceptable; documented as a known limitation.
- **No new task/ doc.** Same pattern as Day_29.
- **Tracker note unchanged.** Day 2 row stays at "11 of 12 commits"; detour progress lives in the Auth Detour checklist.
- **The Day_31 commit's checklist tagging includes both Day_31 and Day_32.** Same pattern as Day_29: a doc + code pair shares one checklist row, tagged with both commit numbers. The row is "covered" the moment the *doc* lands (the concept is in your head); the code commit doesn't flip a separate row.
