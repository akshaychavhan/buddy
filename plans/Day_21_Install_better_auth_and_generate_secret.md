# Day_21_Install_better_auth_and_generate_secret

## Goal

First **infra** commit of Phase B. Three small steps:

1. `pnpm add better-auth` — adds the `better-auth` package (resolves to `^1.6.14`). After this, `import { betterAuth } from "better-auth"` resolves. Nothing instantiates it yet.
2. Add `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` to `.env.example` — scaffold the OAuth env vars now to avoid churn in `Day_34` (when we register the Google OAuth app and populate them in `.env.local`).
3. **Manual (you):** `openssl rand -base64 32` → paste output into `.env.local` as `BETTER_AUTH_SECRET`. The secret signs session/magic-link/CSRF tokens. Without it, Better Auth boots with a noisy warning in dev and an unsafe default in production.

After this commit: package installed, env contract documented, signing secret in place. `pnpm dev` runs normally. `Day_22` ships `lib/auth.ts` (the actual config) and runs the CLI to generate the four auth models.

## Summary

**Files at a glance**

| Group     | Files                                                              |
| --------- | ------------------------------------------------------------------ |
| Plan doc  | `plans/Day_21_Install_better_auth_and_generate_secret.md`          |
| Config    | `package.json` + `pnpm-lock.yaml` (better-auth dep), `.env.example` (Google OAuth vars) |
| Local-only | `.env.local` (BETTER_AUTH_SECRET — your machine only, gitignored) |
| Index     | `docs/README.md` (Auth Detour checklist row flipped)               |

**What you'll run / what you'll see**

| Command                                                          | What it does                                                                                |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `pnpm add better-auth`                                           | One new direct dep + transitive deps (`arctic`, `oslo`, `kysely`, others). `package.json` gains `"better-auth": "^1.6.14"`. |
| Edit `.env.example`                                              | Adds `GOOGLE_CLIENT_ID=""` + `GOOGLE_CLIENT_SECRET=""` under a new "Google OAuth" section, with a comment pointing at Day_34. |
| `openssl rand -base64 32` (manual)                               | Produces ~44-char base64 string. Paste into `.env.local` as `BETTER_AUTH_SECRET="..."`. Never commit. |
| `pnpm typecheck && pnpm lint`                                    | Both green. No code references `better-auth` yet — the import surface lights up in `Day_22`. |
| `pnpm dev`                                                       | Runs normally. The new package is installed but unused. |

> First infra commit of Phase B. Sets the stage for `Day_22`'s `lib/auth.ts`.

## Commands

```bash
# Step 1: install the package.
pnpm add better-auth

# Step 2: edit .env.example to add Google OAuth section (see Files changed for content).

# Step 3 (MANUAL): generate the secret and paste into .env.local.
openssl rand -base64 32
# Then edit .env.local — find BETTER_AUTH_SECRET="" and replace with the generated value.

# Verify locally.
nvm use
pnpm typecheck && pnpm lint    # both should pass
pnpm dev                       # runs normally; Better Auth not yet instantiated
```

## Files changed

- `plans/Day_21_Install_better_auth_and_generate_secret.md` — **created**: this file.
- `package.json` — **edited** by `pnpm add`: adds `"better-auth": "^1.6.14"` to `dependencies`.
- `pnpm-lock.yaml` — **edited** by `pnpm add`: lockfile updated with `better-auth` + its transitive deps (~22 new packages including `arctic`, `oslo`, `kysely`).
- `.env.example` — **edited**: adds a new `# ----- Google OAuth (Better Auth social provider) -----` section between Better Auth and Cloudinary. Contains:
  ```env
  # Register an OAuth 2.0 Client ID at https://console.cloud.google.com/apis/credentials
  # Authorized redirect URI: http://localhost:3000/api/auth/callback/google
  # Provisioned in Day_34; populated by user in .env.local at that time.
  GOOGLE_CLIENT_ID=""
  GOOGLE_CLIENT_SECRET=""
  ```
  The comment block names Day_34 so future-you knows when to provision the Google OAuth app.
- `.env.local` — **edited locally (not committed)**: `BETTER_AUTH_SECRET=""` gets replaced with the `openssl rand -base64 32` output. The file is gitignored (`.env*.local` in `.gitignore` from `Infra_03`). Your machine only.
- `docs/README.md` — **edited**: Auth Detour checklist row "`better-auth` package installed, `BETTER_AUTH_SECRET` generated, OAuth env vars scaffolded" flips from **Concepts pending ⏳** to **Concepts covered ✅**, tagged `Day_21`. Covered: 6 → 7; pending: 16 → 15.

## Verification

1. `cat package.json | grep better-auth` — shows `"better-auth": "^1.6.14"`.
2. `cat .env.example` — has the new "Google OAuth" section with both env-var lines and the explanatory comment.
3. `grep '^BETTER_AUTH_SECRET=' .env.local` — value is **not** empty (was empty before; you pasted the openssl output). Don't print the value.
4. `pnpm typecheck && pnpm lint` — both pass.
5. `pnpm dev` — starts on port 3000 (or 3001/3002 if occupied), no errors related to Better Auth. Existing routes (`/`, `/trips`, `/sign-in`, `/api/health`) still work exactly as before.
6. `docs/README.md` Auth Detour Checklist: 7 covered, 15 pending, 4 deferred.

## Gotchas / decisions

- **Never commit `BETTER_AUTH_SECRET`.** It lives in `.env.local`, which is gitignored. If it accidentally ends up in a tracked file, rotate immediately (generate a new one with `openssl`, replace, and treat the leaked one as compromised). Better Auth uses it to sign session/magic-link/CSRF tokens — a leak means an attacker can forge them.
- **`BETTER_AUTH_URL="http://localhost:3000"` is already in `.env.example`** (from `Infra_02`'s scaffold). No change needed here. Production deploys will need to override it.
- **Why scaffold Google OAuth env vars *now*, before `Day_34`?** Two reasons. (1) Adding them later would require a separate `.env.example` edit during `Day_34`'s commit, mixing "user-facing OAuth setup" with "scaffold an env-var contract." Better to scaffold the contract once, here, where the package install is the natural insertion point. (2) Future-you reading `.env.example` between Day_21 and Day_34 sees that Google OAuth is *planned* but *empty* — a signal of "this is coming soon."
- **The Resend env vars (`RESEND_API_KEY`, `EMAIL_FROM`) were already documented in `.env.example`** by `Infra_02`. No edit needed for them in this commit; they'll be exercised in `Day_32`.
- **`pnpm add` updates the lockfile.** The new `pnpm-lock.yaml` reflects 22 added packages. The lockfile is committed (per `Infra_03`'s `.gitignore` decision); CI uses it to reproduce the install exactly.
- **`postinstall: prisma generate`** (from `Fix_01`) runs as part of `pnpm add`'s post-install hook. We saw this fire in the install output. The placeholder `Healthcheck` model still satisfies it. When `Day_22` replaces `Healthcheck` with the four Better Auth models, future installs will regenerate against the real schema.
- **No `lib/auth.ts` in this commit.** Tempting to write it now alongside the install, but `Day_22` is where `lib/auth.ts` lands together with the CLI run that populates the schema. Keeping `Day_21` to just "package installed + secret generated + OAuth contract scaffolded" preserves the one-concept-per-commit rule.
- **No `import { betterAuth }` anywhere yet.** That's correct. The package is installed but unused — same situation as `Day_18`'s `lib/prisma.ts` (the singleton ships before any code imports it). `Day_22` is the first importer.
- **`better-auth@1.6.14` is the version pinned.** If later it changes (e.g. `pnpm update`), the API surface could shift. We're working against this exact version; the Day_19/Day_20 docs describe its current shape. Don't update during the detour without re-reading the migration notes.
