# Infra_10_Rewrite_day1_learning_docs

## Goal
The Day 1 learning docs and the docs index are still teaching the old plan: "Why Expo," Expo Go QR scans, native bridge, Android Studio gotchas. This is the last fragment of the React Native curriculum still in the repo. We're rewriting all three to match the new reality — single Next.js 14 (App Router) app — without losing the friendly WHAT/WHY/HOW teaching style. After this commit, the project's learning narrative is fully Next.js-shaped end to end.

## Summary

**Files at a glance**

| Group           | Files                                            |
| --------------- | ------------------------------------------------ |
| Plan doc        | `plans/Infra_10_Rewrite_day1_learning_docs.md`   |
| Learning (Day 1)| `docs/learning/day1_setup.md`, `docs/learning/day1_installation.md` |
| Index           | `docs/README.md`                                 |

**What you'll run / what you'll see**

| Command                                          | What it does                                                |
| ------------------------------------------------ | ----------------------------------------------------------- |
| Open `docs/learning/day1_setup.md`               | "Why Next.js (App Router)" — RSC mental model, file conventions, single-deploy pitch. |
| Open `docs/learning/day1_installation.md`        | Node 20+, pnpm, MongoDB / Cloudinary / Resend account checks. No Expo Go, no LAN. |
| Open `docs/README.md`                            | New 15-day phase structure (Days 2–15 retitled for the Next.js track). |
| `grep -niwE 'expo\|react native\|metro' docs/learning/*.md docs/README.md` | Empty. ✅ |

> Pure docs commit — no app code touched.

## Commands
```bash
# Audit pass after the rewrite:
grep -niwE 'expo|react native|nativewind|mmkv|metro|expo go' docs/learning/*.md docs/README.md
```

## Files changed
- `plans/Infra_10_Rewrite_day1_learning_docs.md` — **created**: this file.
- `docs/learning/day1_setup.md` — **rewritten**: 173 lines retargeted to "Why Next.js (App Router)". Replaces the bridge diagram with the RSC mental model. New tiny example: `app/page.tsx` + `app/api/health/route.ts`. Quiz rewritten for Next.js.
- `docs/learning/day1_installation.md` — **rewritten**: 169 lines retargeted to a web-app tooling checklist. Node 20+, pnpm, MongoDB Atlas connection-string smoke test, Cloudinary/Resend account links. Drops Expo Go, LAN, tunnel. Adds environment-variable conventions and `.env.local` setup.
- `docs/README.md` — **edited**: phase headings retitled (Mobile-Native Features → Web-Native Features), Day 2–15 entries retitled to match the new PROMPT.md roadmap. Status legend untouched.

## Verification
1. Open `docs/learning/day1_setup.md` — title is "Day 1 — Project Setup: Why Next.js (App Router)".
2. Open `docs/learning/day1_installation.md` — first commands check Node 20+ and pnpm; no Expo references.
3. Open `docs/README.md` — Day 7 entry says "Better Auth" (not "Better Auth + TanStack Query"); Day 14 says "PWA + Offline-Friendly Reads" (not "Offline Mode").
4. Run `grep -niwE 'expo|react native|nativewind|mmkv|metro|expo go' docs/learning/*.md docs/README.md` → empty. ✅
5. CI on this branch stays green (docs-only).

## Gotchas / decisions
- **Same teaching shape, new content.** The WHAT / WHY / HOW / Tiny example / Applied to Buddies / Gotchas / Quiz / Key Takeaways pattern is preserved. Anyone who knew the old docs will find the new ones familiar.
- **The "Next.js is to React" parallel is gone.** The old docs leaned on it as the central anchor. Now Next.js IS the target — there's no parallel to draw, so it's replaced with "App Router vs Pages Router" for readers coming from older Next.js codebases.
- **Tiny example is the actual app.** Instead of a hypothetical RN snippet, the example is `app/page.tsx` + `app/api/health/route.ts` — the exact files that already live in the repo. Nothing fictional.
- **The old bridge diagram is gone.** Replaced with a one-paragraph mental model: server renders → HTML lands → client hydrates → server actions are RPC. That's the shift to internalize today.
- **`docs/README.md` retitled days, kept the table shape.** The progress tracker is still useful — just the titles change. Status column stays as it was (Day 1 In Progress, rest Not Started). After this, the tracker honestly reflects what we've built so far + what's still to come.
