# Infra_03_Tighten_gitignore_for_nextjs

## Goal
The `.gitignore` from the old monorepo plan still has rules for Expo, iOS, and Android builds — leftovers we no longer need. We're trimming the dead weight and keeping only what matters for a Next.js + Prisma app. A clean `.gitignore` means fewer "what is this?" moments later.

## Summary

**Files at a glance**

| Group           | Files          |
| --------------- | -------------- |
| Plan doc        | `plans/Infra_03_Tighten_gitignore_for_nextjs.md` |
| Repo hygiene    | `.gitignore`   |

**What you'll run / what you'll see**

| Command                                  | What it does                                                       |
| ---------------------------------------- | ------------------------------------------------------------------ |
| `git status`                             | Should show nothing weird — `.next/`, `node_modules/`, `.env.local` all stay ignored. |
| `git check-ignore -v node_modules .next` | Confirms the still-ignored paths still match a rule.               |

> No build commands here — this is a pure config tweak.

## Commands
```bash
# Edit .gitignore by hand (no commands change files for us).
# After saving, sanity-check that important paths are still ignored:
git status
git check-ignore -v node_modules .next .env.local
```

## Files changed
- `plans/Infra_03_Tighten_gitignore_for_nextjs.md` — **created**: this file.
- `.gitignore` — **edited**: removed the Expo/iOS/Android blocks and the duplicate `.next/` entry. Kept Node, Next.js, env files, Prisma, logs, IDE, OS — all the bits a Next.js app actually needs.

## Verification
1. Run `git status` — working tree should be clean apart from this commit's edits.
2. Run `git check-ignore -v node_modules .next .env.local` — each path prints a matching `.gitignore` rule. ✅
3. Run `grep -niE 'expo|ios/|android/|jsbundle|mobileprovision' .gitignore` — should return nothing. ✅

## Gotchas / decisions
- **`.next/` was listed twice** in the old file (once under "Build outputs", once under "Next.js specific"). We keep only one entry to avoid the "wait, are these the same?" confusion.
- **`.cursor/` stays ignored** — that's your personal Cursor IDE state, not project rules. The committed `.cursorrules` file (if you add one) is separate.
- Nothing else weird here — we're only deleting lines, never adding new ignore rules.
