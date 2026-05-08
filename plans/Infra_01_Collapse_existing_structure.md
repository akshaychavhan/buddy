# Infra_01_Collapse_existing_structure

## Goal
We're cleaning the slate. The repo was originally planned as two apps (`apps/mobile` for Expo, `apps/api` for Next.js), but we've decided to ship a **single Next.js 14 app** instead — one codebase, one deploy. This commit just removes the old empty placeholders so Phase 2 can scaffold Next.js cleanly at the repo root.

## Summary

**Files at a glance**

| Group       | Files                                              |
| ----------- | -------------------------------------------------- |
| Plan doc    | `plans/Infra_01_Collapse_existing_structure.md`    |
| Demolition  | `apps/mobile/.gitkeep`, `apps/api/.gitkeep`, `apps/` |

**What you'll run / what you'll see**

| Command                                             | What it does                                                     |
| --------------------------------------------------- | ---------------------------------------------------------------- |
| `rm -rf apps/`                                      | Deletes the empty placeholder folders from the old monorepo plan. |
| `git add plans/Infra_01_*.md && git add -u apps/`   | Stages the new plan doc + records the deletions.                  |
| `git commit -m "Infra_01_Collapse_existing_structure"` | Saves both as a single atomic commit.                          |

## Commands
```bash
# Remove the two empty placeholder dirs from the old monorepo plan
rm -rf apps/

# Stage the new plans/ folder + the deletion, then commit
git add plans/Infra_01_Collapse_existing_structure.md
git add -u apps/   # records the deletions
git commit -m "Infra_01_Collapse_existing_structure"
```

## Files changed
- `plans/` — **created**: new folder where every commit gets its own beginner-friendly note.
- `plans/Infra_01_Collapse_existing_structure.md` — **created**: this file you're reading.
- `apps/mobile/.gitkeep` — **deleted**: empty placeholder for the old Expo app.
- `apps/api/.gitkeep` — **deleted**: empty placeholder for the old Next.js API.
- `apps/` — **deleted**: now-empty parent folder.

## Verification
1. Run `ls apps 2>&1` → should print `ls: cannot access 'apps': No such file or directory`. ✅
2. Run `ls plans/` → should list `Infra_01_Collapse_existing_structure.md`. ✅
3. Run `git log --oneline -1` → top commit should be `Infra_01_Collapse_existing_structure`. ✅

## Gotchas / decisions
Nothing tricky here — we're only deleting empty `.gitkeep` files. Nothing was lost. If you ever want to see what was there, `git log -- apps/` still shows the history.
