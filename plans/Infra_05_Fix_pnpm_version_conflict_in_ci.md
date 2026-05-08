# Infra_05_Fix_pnpm_version_conflict_in_ci

## Goal
Our first GitHub Actions run failed before it could even start. The `pnpm/action-setup` step refused to install pnpm because it found **two** version sources at once: `version: 9` in the workflow AND `packageManager: "pnpm@9.12.0"` in `package.json`. We're dropping the workflow's `version` line so pnpm comes from `package.json` only — the recommended setup, and one less place to forget to update later.

## Summary

**Files at a glance**

| Group     | Files                                                |
| --------- | ---------------------------------------------------- |
| Plan doc  | `plans/Infra_05_Fix_pnpm_version_conflict_in_ci.md`  |
| CI fix    | `.github/workflows/ci.yml`                           |

**What you'll run / what you'll see**

| Command                                | What it does                                                   |
| -------------------------------------- | -------------------------------------------------------------- |
| `git push`                             | Re-triggers GitHub Actions on the fixed workflow.              |
| Open the **Actions** tab on GitHub     | The new run should now reach Install → Typecheck → Lint → Build and finish green ✅. |

> No local commands needed — this is a one-line CI patch.

## Commands
```bash
# Just push and watch CI:
git push
```

## Files changed
- `plans/Infra_05_Fix_pnpm_version_conflict_in_ci.md` — **created**: this file.
- `.github/workflows/ci.yml` — **edited**: removed `with: { version: 9 }` from the `pnpm/action-setup@v4` step. The action now reads the pnpm version from `package.json#packageManager` (the value `pnpm@9.12.0`).

## Verification
1. Push the branch: `git push`.
2. Open GitHub → **Actions** tab → newest `CI` run.
3. The "Setup pnpm" step prints something like `pnpm version: 9.12.0` and succeeds. ✅
4. The full job (Install → Typecheck → Lint → Build) finishes green. ✅

## Gotchas / decisions
- **Why one source is enough.** When `package.json#packageManager` is set (which we did in `Infra_02`), `pnpm/action-setup@v4` reads it automatically. Specifying `version` in the workflow on top of that is now treated as a conflict, not a hint. Picking `package.json` as the single source of truth is the documented best practice — and the version your laptop uses is then guaranteed to match the version CI uses.
- **Why this slipped past the local replay.** The `pnpm/action-setup` check only runs inside GitHub Actions; running `pnpm install` on your laptop bypasses it entirely. From this commit on, "green local + green Actions" is the bar before merging.
