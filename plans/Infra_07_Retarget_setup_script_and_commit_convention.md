# Infra_07_Retarget_setup_script_and_commit_convention

## Goal
Two repo-meta files still describe the old monorepo + Conventional Commits world: `setup_repo.sh` creates `apps/mobile`/`apps/api` and writes a stale CI stub, and `docs/COMMIT_CONVENTION.md` is 345 lines of the retired `feat(scope): …` scheme. We're trimming the script down to what's still useful (issue templates + LICENSE bootstrap) and rewriting the commit convention doc so it actually documents what we use today: `Infra_NN_Descriptive_name` + per-commit plan files.

## Summary

**Files at a glance**

| Group       | Files                                                                       |
| ----------- | --------------------------------------------------------------------------- |
| Plan doc    | `plans/Infra_07_Retarget_setup_script_and_commit_convention.md`             |
| Setup       | `setup_repo.sh`                                                             |
| Convention  | `docs/COMMIT_CONVENTION.md`                                                 |

**What you'll run / what you'll see**

| Command                                          | What it does                                                          |
| ------------------------------------------------ | --------------------------------------------------------------------- |
| `bash setup_repo.sh`                             | Creates `.github/ISSUE_TEMPLATE/*` and `LICENSE` (if missing). No more `apps/` folders or stale CI heredoc. |
| Open `docs/COMMIT_CONVENTION.md`                 | Documents the new `Infra_NN_Descriptive_name` style + plan-file workflow. |
| `grep -niE 'expo\|react native\|conventional' docs/COMMIT_CONVENTION.md` | Empty. ✅                                  |

> Pure docs/script commit — no app code touched.

## Commands
```bash
# Sanity check after the rewrite:
bash setup_repo.sh                  # should be idempotent and only print success
grep -niE 'expo|apps/mobile|apps/api' setup_repo.sh
grep -niE 'feat\(.*\):|conventional commits' docs/COMMIT_CONVENTION.md
```

## Files changed
- `plans/Infra_07_Retarget_setup_script_and_commit_convention.md` — **created**: this file.
- `setup_repo.sh` — **edited**: dropped `apps/mobile`/`apps/api` folder creation + their `.gitkeep` lines, dropped the stale CI heredoc (real workflow already lives in `.github/workflows/ci.yml`), updated the printed completion tree, updated the final "next steps" message.
- `docs/COMMIT_CONVENTION.md` — **rewritten**: 345 lines of Conventional Commits docs replaced with a focused doc on `Infra_NN_Descriptive_name`, plan-file workflow, and how to write a good descriptive name. Keeps the same teaching-tone for beginners.

## Verification
1. Run `bash setup_repo.sh` — completes without error, doesn't try to make `apps/`.
2. Run `grep -niE 'apps/mobile|apps/api|expo' setup_repo.sh` → empty. ✅
3. Open `docs/COMMIT_CONVENTION.md` — first line is the new convention name; no `feat(scope):` examples; references plan files.
4. Run `grep -niE 'feat\(.*\):' docs/COMMIT_CONVENTION.md` → empty. ✅
5. CI on this branch stays green (this commit only touches docs/scripts, not code).

## Gotchas / decisions
- **Why we kept `setup_repo.sh` instead of deleting it.** It's still useful for someone forking and rebuilding the repo from a fresh clone — issue templates + LICENSE. We just removed the parts that no longer apply.
- **The CI heredoc is gone, not synced.** The script used to embed a copy of `.github/workflows/ci.yml`. Now that the real CI workflow has evolved past the placeholder, keeping a duplicate inside this script invites drift. The script just creates the `.github/workflows/` directory — the workflow file itself ships separately, in version control like normal.
- **Why rewrite COMMIT_CONVENTION.md instead of deleting?** A dedicated convention doc is more discoverable than a section inside CONTRIBUTING.md. Beginners skim CONTRIBUTING.md once; they revisit COMMIT_CONVENTION.md when they're stuck on a commit message.
- **Conventional Commits isn't "wrong"** — just not what we picked. The new doc explains *why* we chose numbered phase commits for a learning repo (history reads like a tutorial timeline) without trash-talking the alternative.
