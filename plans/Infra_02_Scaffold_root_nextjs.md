# Infra_02_Scaffold_root_nextjs

## Goal
Now we plant the actual Next.js 14 app at the repo root. After this commit, you can run `pnpm install && pnpm dev` and see a real page at `localhost:3000` plus a JSON response at `localhost:3000/api/health`. The health route is small but important — it proves the UI and the backend live in the **same** app and deploy as one unit.

## Summary

**Files at a glance**

| Group              | Files                                                                                  |
| ------------------ | -------------------------------------------------------------------------------------- |
| Plan doc           | `plans/Infra_02_Scaffold_root_nextjs.md`                                               |
| Package + tooling  | `package.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `.nvmrc`       |
| Tailwind           | `tailwind.config.ts`, `postcss.config.mjs`, `app/globals.css`                          |
| Next.js app        | `app/layout.tsx`, `app/page.tsx`, `app/api/health/route.ts`                            |
| Prisma             | `prisma/schema.prisma`                                                                 |
| Env template       | `.env.example`                                                                         |

**What you'll run / what you'll see**

| Command                                  | What it does                                                                  |
| ---------------------------------------- | ----------------------------------------------------------------------------- |
| `pnpm install`                           | Reads `package.json` and downloads packages into `node_modules/`.             |
| `pnpm dev`                               | Starts the local dev server at `http://localhost:3000` (UI + API together).   |
| `curl http://localhost:3000/api/health`  | Returns `{"ok":true,"ts":...}` — proves the API and UI ship as one app.       |

> First time using pnpm? Install it once globally with `npm install -g pnpm`,
> or `corepack enable && corepack prepare pnpm@latest --activate`.

## Commands
```bash
# Phase 2 is mostly file creation — no install yet (keeps the diff small).
# After this commit lands, run these from the repo root:
pnpm install
pnpm dev                                  # opens http://localhost:3000
curl http://localhost:3000/api/health     # → {"ok":true,"ts":...}
```

## Files changed
- `package.json` — **created**: lists Next.js, React, TypeScript, Tailwind, Prisma, and the `dev`/`build`/`lint`/`typecheck` scripts.
- `tsconfig.json` — **created**: TypeScript strict mode + `@/*` path alias.
- `next.config.ts` — **created**: minimal Next.js config (typed routes on).
- `eslint.config.mjs` — **created**: linting rules from Next's recommended set.
- `tailwind.config.ts` — **created**: tells Tailwind which files to scan for class names.
- `postcss.config.mjs` — **created**: pipeline that runs Tailwind during build.
- `app/globals.css` — **created**: global styles + Tailwind base/components/utilities directives.
- `app/layout.tsx` — **created**: the `<html>` shell every page is wrapped in.
- `app/page.tsx` — **created**: the landing page at `/` ("Buddies — Day 1").
- `app/api/health/route.ts` — **created**: the `/api/health` JSON endpoint (proves single-deploy).
- `prisma/schema.prisma` — **created**: empty Prisma schema pointing at MongoDB. We'll add models later.
- `.env.example` — **created**: template for secrets (DB, auth, Cloudinary, Resend) — copy to `.env.local`.
- `.nvmrc` — **created**: pins Node 20 so everyone uses the same version.

## Verification
1. Run `pnpm install` — should finish without errors.
2. Run `pnpm dev` — terminal prints `Local: http://localhost:3000`.
3. Open `http://localhost:3000` in a browser — you see "Buddies — Day 1". ✅
4. In a new terminal: `curl -s http://localhost:3000/api/health` → `{"ok":true,"ts":...}`. ✅

## Gotchas / decisions
- **`@/*` import alias** — lets you write `import x from "@/lib/x"` instead of long `../../../` paths. Saves your sanity in deep folders.
- **Server components by default** — every file in `app/` runs on the server unless you add `"use client"` at the top. If you import something browser-only (like `window`), you'll get an error reminding you to add that line.
- **No lockfile yet** — we commit `package.json` only. The lockfile (`pnpm-lock.yaml`) gets generated on first `pnpm install` locally. It can land in a follow-up commit if you want a smaller diff today.
- **Why pnpm?** Faster installs and a stricter dependency tree (catches accidental "phantom" imports). For learning, the difference is mostly invisible — same scripts, same behavior.
- **Better Auth, Cloudinary, Resend** are listed in `.env.example` but **not wired** yet. We'll connect them in dedicated Day-N commits where each gets its own learning doc.
