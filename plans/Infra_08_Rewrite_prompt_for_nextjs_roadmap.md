# Infra_08_Rewrite_prompt_for_nextjs_roadmap

## Goal
`PROMPT.md` is the master "teach me as we build" prompt — and right now it's 1000 lines describing a React Native mobile app journey that no longer matches the project. We're replacing it end-to-end with a Next.js 14 (App Router) learning roadmap covering Days 1–15: setup, App Router mental model, RSC vs client components, Tailwind, server actions, Prisma + MongoDB, Better Auth, Cloudinary uploads, Resend invitations, the itinerary timeline, PWA + web push, and V2 scaffolding. Same teaching philosophy, completely new content.

## Summary

**Files at a glance**

| Group     | Files                                              |
| --------- | -------------------------------------------------- |
| Plan doc  | `plans/Infra_08_Rewrite_prompt_for_nextjs_roadmap.md` |
| Master prompt | `PROMPT.md`                                    |

**What you'll run / what you'll see**

| Command                                                      | What it does                                              |
| ------------------------------------------------------------ | --------------------------------------------------------- |
| Open `PROMPT.md`                                             | A full Next.js learning roadmap, beginner-friendly tone.  |
| `grep -niE 'expo\|react native\|nativewind\|mmkv' PROMPT.md` | Empty. ✅ All RN content gone.                            |

> Pure docs commit — no code or build commands.

## Commands
```bash
# Audit pass after the rewrite:
grep -niE 'expo|react native|nativewind|mmkv|metro|eas|expo-' PROMPT.md
wc -l PROMPT.md
```

## Files changed
- `plans/Infra_08_Rewrite_prompt_for_nextjs_roadmap.md` — **created**: this file.
- `PROMPT.md` — **rewritten**: 1000 lines of Expo + RN curriculum replaced with a Next.js App Router learning roadmap. Same shape (Audience → Doc System → Templates → App Description → Tech Stack → 15 Days → Pacing Rules → Day 1 Kickoff → Ground Rules) so anyone who knew the old prompt finds the new one familiar.

## Verification
1. Open `PROMPT.md` — first paragraph frames Buddies as a Next.js 14 web app, not a mobile app.
2. Run `grep -niE 'expo|react native|nativewind|mmkv|metro|eas' PROMPT.md` → empty. ✅
3. `wc -l PROMPT.md` → ~700 lines.
4. CI on this branch stays green (docs-only change).

## Gotchas / decisions
- **Same skeleton, new flesh.** Sections, numbering, and tone match the old prompt — just the content under each is Next.js-shaped. This makes the diff intentionally large but keeps the learning rhythm intact.
- **Days 1–15 reshuffled.** The old plan was: Setup → Styling → Navigation → Forms → Theme → Backend → Auth → Camera/Photos → Maps → Notifications → Money/Email → Logistics → Timeline → Offline → V2 scaffold. The new plan is: Setup → App Router & RSC → Tailwind & Layouts → Forms & Validation → Theme & i18n → Prisma & MongoDB → Better Auth → Cloudinary uploads → Maps & Wikipedia insights → Web push → Money & Resend invitations → Logistics → Timeline → PWA + offline → V2 scaffold.
- **No mobile platform tables.** The old "iOS vs Android" gotcha sections are gone. Their web equivalents (browser quirks, RSC vs client component, edge vs node runtime, Server Action limits) replace them naturally.
- **Better Auth still wins over Clerk.** That decision held up — the comparison table is preserved with web-context wording.
- **References to RN-only libraries dropped.** MMKV, NetInfo, expo-image, react-native-maps, etc. all removed. `localStorage` / Workbox / `next-pwa` / Mapbox GL JS or react-leaflet replace them.
- **Prisma schema kept inline.** It's still useful as the canonical data model — just stripped of the `lastSyncedAt` and `isAvailableOffline` mobile fields (those move to a PWA-style cache strategy doc later, not the schema).
