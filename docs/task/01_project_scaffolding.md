# Task 01 — Project Scaffolding

> **Started:** 2026-05-01
> **Completed:** 2026-05-01
> **Status:** ✅ Done
> **Phase:** 1 — Foundations

---

## 🎯 Goal

Document the **already-scaffolded** Next.js 14 App Router project (built across `Infra_01` … `Infra_10`), explain every config file the project ships with, and confirm `pnpm dev` runs cleanly on a real machine.

This task does **not** add any code to `app/` or `prisma/`. It's a guided tour + verification. Day 1's deliverable is **understanding**, not features.

---

## 📖 User Story

> As a senior React/Next.js developer who's been on the Pages Router for years and is now committing to the App Router for Buddies, I want a written tour of this specific scaffold so I can explain every file and config decision confidently — and so future-me (or a teammate) doesn't have to reverse-engineer it from git log.

---

## ✅ Acceptance Criteria

- [x] TypeScript strict mode enabled (`tsconfig.json` `"strict": true`)
- [x] `pnpm dev` starts the dev server cleanly (no errors in terminal)
- [x] `http://localhost:3000` renders `app/page.tsx` ("Buddies — Day 1" heading)
- [x] `http://localhost:3000/api/health` returns `{"ok": true, "ts": <number>}`
- [x] Task doc completed and linked from [docs/README.md](../README.md) Task Journal
- [ ] **DEFERRED to Day 3:** theme-aware (light + dark) — the layout already sets `dark:` classes but there's no toggle yet
- [ ] **DEFERRED to Day 5:** localized (no hardcoded English) — current copy is English-only
- [ ] **DEFERRED to ongoing:** semantic HTML, ARIA — `app/page.tsx` uses `<main>` + `<h1>`, OK for Day 1

---

## 🛠️ Tech Decisions

These were all made in `Infra_02_Scaffold_root_nextjs`; documenting them here so the *why* is preserved alongside the *what*.

### Decision 1: Next.js 14 App Router (not Pages Router)

- **Why:** Server Components by default → less client JS, direct DB access from page components, no `getServerSideProps` boilerplate. Server Actions cover forms without a separate API. File conventions (`loading.tsx`, `error.tsx`, `not-found.tsx`) give us streaming + error boundaries for free.
- **Alternatives considered:**
  - Pages Router — rejected; legacy paradigm, no new features being added.
  - Remix — rejected; different ecosystem, would mean re-learning patterns the user already knows from Next.js.
  - Astro — rejected; content-site focus, not application focus.
- **Trade-offs:** App Router has stricter rules (Server vs Client boundaries, `"use client"` discipline, no `useEffect` for initial data). We gain a simpler mental model long-term.

### Decision 2: pnpm 9 (not npm or yarn)

- **Why:** Speed (content-addressable store, single `node_modules` per workspace), strict by default (won't resolve undeclared deps — catches "phantom dependency" bugs), small disk footprint. `package.json` pins it via `"packageManager": "pnpm@9.12.0"` so every contributor's CLI matches.
- **Alternatives considered:**
  - npm — rejected; slow installs, no strict mode by default.
  - yarn (v1 or Berry) — rejected; ecosystem is split between v1 and Berry, neither is dominant anymore.
- **Trade-offs:** Some older docs/tutorials assume `npm`. Fine in practice — the commands map 1:1 (`pnpm install`, `pnpm add`, `pnpm run`).

### Decision 3: Tailwind 3 + `globals.css`

- **Why:** Utility classes resolve at build time → zero runtime cost (compatible with Server Components, which CSS-in-JS often isn't). Design tokens live in `tailwind.config.ts` → one source of truth. Dark mode via `dark:` variants → no theme provider needed.
- **Alternatives considered:**
  - CSS Modules — rejected; verbose for a design system, awkward for shared tokens.
  - styled-components / Emotion — rejected; runtime cost + many RSC incompatibilities.
  - Vanilla Extract — rejected; extra build complexity, smaller ecosystem.
- **Trade-offs:** Long `className` strings; rely on Tailwind's class composition rather than CSS variables for theme values.

### Decision 4: Prisma + MongoDB (schema empty for now)

- **Why:** Prisma gives TypeScript types from the schema (no manual type-mongo gymnastics). Better Auth has a first-party Prisma adapter (we'll use it Day 7). MongoDB's document model fits naturally for trip/place/expense nested structures; Atlas free tier is enough for V1.
- **Alternatives considered:**
  - Drizzle ORM — rejected; younger, smaller ecosystem, no Better Auth adapter yet.
  - Mongoose — rejected; no codegen, no TypeScript-first DX.
  - PostgreSQL + Prisma — rejected; relational rigidity feels off for nested trip data; we'd be writing JOINs everywhere.
- **Trade-offs:** Prisma's MongoDB support is "stable" but younger than its SQL support — a couple of features (raw queries, certain index types) are more limited. Acceptable for V1.

### Decision 5: Single Next.js app (no separate API server)

- **Why:** Route handlers (`app/api/*/route.ts`) + Server Actions cover everything we need from "the backend." One CI pipeline, one deploy, types shared across UI ↔ API automatically.
- **Alternatives considered:**
  - Next.js front + Express/Hono backend — rejected; two deploys, CORS, type duplication.
  - tRPC — rejected; overkill for solo dev when Server Actions already give end-to-end types.
- **Trade-offs:** All API code runs inside Next.js's runtime (Node or Edge). For very heavy background jobs, we'd need a separate worker — punted to V2.

---

## 📋 Implementation Plan

A guided tour. Each step = open the file, read it, internalize what it does.

### 1. `package.json` — the manifest

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "typecheck": "tsc --noEmit",
  "prisma:generate": "prisma generate"
}
```

- `dev` — local dev server with HMR, listens on `localhost:3000` by default
- `build` — production build, outputs to `.next/`
- `start` — runs the production build (different from `dev`)
- `lint` — Next.js's bundled ESLint config (uses [.eslintrc.json](../../.eslintrc.json))
- `typecheck` — pure TypeScript check, no emit; great for CI
- `prisma:generate` — generates the Prisma Client from `schema.prisma`; rerun whenever the schema changes

Also note: `"packageManager": "pnpm@9.12.0"` and `"engines": { "node": ">=20" }` — both enforced by tooling, prevents "works on my machine."

### 2. `app/layout.tsx` — the root layout (Server Component)

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Buddies — Plan trips together",
  description:
    "A web-first trip planner built around the idea that the best trips happen with friends.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-neutral-900 antialiased dark:bg-neutral-950 dark:text-neutral-100">
        {children}
      </body>
    </html>
  );
}
```

Three things to internalize:
- **The `<html>` and `<body>` tags live here**, not in some `_document.tsx` like the Pages Router. That's because `layout.tsx` IS the shell.
- **No `"use client"` directive** → this is a Server Component. It runs on the server, ships HTML to the browser.
- **`metadata` is statically exported** → Next.js reads this at build time and emits `<title>` + `<meta>` tags into the HTML head. No `<Head>` component needed.

### 3. `app/page.tsx` — the home page (Server Component)

```tsx
export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-6 px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">
        Buddies — Day 1
      </h1>
      <p className="text-lg text-neutral-600 dark:text-neutral-400">
        Plan trips. Travel together. Remember everything.
      </p>
      <p className="text-sm text-neutral-500">
        The single Next.js app is alive. Try{" "}
        <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs dark:bg-neutral-800">
          /api/health
        </code>{" "}
        to see the same app serve a JSON endpoint.
      </p>
    </main>
  );
}
```

- Pure JSX, no hooks, no `useEffect`. Runs entirely on the server.
- Tailwind utilities resolve at build time; the browser only sees the resulting CSS.
- The `dark:` variants are already in place — when we add a theme toggle (Day 3), it'll just work.

### 4. `app/api/health/route.ts` — the first route handler

```ts
export async function GET() {
  return Response.json({ ok: true, ts: Date.now() });
}
```

- File location `app/api/health/route.ts` → URL `/api/health`. The folder name becomes the URL segment.
- The file MUST be named `route.ts`. Other names (`handler.ts`, `index.ts`) won't work.
- Export named functions matching HTTP verbs: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`, `HEAD`. We only export `GET` here.
- `Response.json()` is the standard Web Fetch API, not Next.js-specific. It's just `new Response(JSON.stringify(data), { headers: { "content-type": "application/json" } })` with one less verbose line.

### 5. `tsconfig.json` — TypeScript strict mode

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "strict": true,
    "noEmit": true,
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  }
}
```

- `"strict": true` — turns on every strict check (no implicit `any`, strict null checks, strict function types, etc.). Non-negotiable for Buddies.
- `"moduleResolution": "bundler"` — modern resolution algorithm; lets us import `.ts` files without extension, plays well with Next.js's bundler.
- `"jsx": "preserve"` — TS leaves JSX intact for Next.js to compile (Next emits its own optimized JSX output).
- `"plugins": [{ "name": "next" }]` — enables Next-specific type checking in your editor (e.g., the `typedRoutes` feature shows route typos as TS errors).
- `"paths": { "@/*": ["./*"] }` — lets us write `import { foo } from "@/lib/foo"` instead of brittle relative paths. Resolves from the repo root.

### 6. `next.config.mjs` — Next.js config

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
```

- **The file is `.mjs`, not `.ts` or `.js`.** Per `Infra_04` / `Infra_05`, Next.js 14 only reads `.mjs`/`.js`/`.cjs` configs — `next.config.ts` would silently be ignored. Gotcha worth remembering.
- `typedRoutes: true` — generates TypeScript types for every route in your app. Lets `<Link href="/trip/123">` flag typos at compile time. Pairs with the `next` TS plugin.

### 7. `tailwind.config.ts` — Tailwind tokens

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx,mdx}",
  ],
  theme: { extend: {} },
  plugins: [],
};

export default config;
```

- `content` is the glob Tailwind scans for class names. Anything outside these globs gets purged — important: if you add a new top-level dir (say, `lib/` with JSX) and use Tailwind classes there, you must add it to `content` or the styles won't ship.
- `theme.extend` is where Day 3 will add design tokens (color palette, font scale, custom spacing) — empty for now.

### 8. `.env.example` — environment variable contract

```env
DATABASE_URL="mongodb+srv://..."
BETTER_AUTH_SECRET=""
BETTER_AUTH_URL="http://localhost:3000"
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
RESEND_API_KEY=""
EMAIL_FROM="Buddies <noreply@example.com>"
```

Each var maps to a future day:
- `DATABASE_URL` — wired up Day 6 (Prisma + MongoDB)
- `BETTER_AUTH_*` — wired up Day 7 (Better Auth)
- `CLOUDINARY_*` — wired up Day 8 (image uploads)
- `RESEND_API_KEY`, `EMAIL_FROM` — wired up Day 11 (email invitations)

To work locally, `cp .env.example .env.local` and fill in. `.env.local` is gitignored — never committed.

### 9. `prisma/schema.prisma` — the data layer (skeleton)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

// TODO: Better Auth tables — added on the auth day.
// TODO: Trip, Membership, Place, Expense, Activity — added as features land.
```

Empty except for the datasource declaration. We'll grow it across Days 6, 7, 9, 11.

### 10. Verify `pnpm dev` runs (Phase B handoff)

This is where I hand off — you run it on your machine:

```bash
pnpm dev
```

**Expected terminal output:** something like

```
   ▲ Next.js 14.2.x
   - Local:        http://localhost:3000
   - Environments: (none)

   ✓ Ready in 1.2s
```

Open `http://localhost:3000` in a browser — should see the "Buddies — Day 1" heading.

### 11. Verify the `/api/health` route responds

In a second terminal:

```bash
curl -s http://localhost:3000/api/health
```

**Expected:** `{"ok":true,"ts":1746...}` (the timestamp will be current).

---

## 🧠 Concepts Used (Links to Learning Docs)

- [Day 1 — Project Setup: Why Next.js (App Router)](../learning/day1_setup.md) — App Router, Server Components, file conventions, the single-deploy pitch
- [Day 1 — Installation: Tooling Checklist](../learning/day1_installation.md) — Node 20+, pnpm 9, `.env.local`, Cloudinary/Resend accounts
- (To be written after Phase B) [Day 1 — First Page Walkthrough](../learning/day1_first_page.md) — focused look at `app/page.tsx` + `app/api/health/route.ts`

---

## 📁 Files Created / Modified

**This task creates:**
- `docs/task/01_project_scaffolding.md` — this file

**This task modifies:**
- `docs/README.md` — adds a Task Journal entry pointing here

**This task does NOT touch any app code** — that's the whole point. Day 1 is about understanding what's already there.

---

## 💻 Code Highlights

The two files that demonstrate the "single Next.js app for UI + API" idea, side by side:

```tsx
// app/page.tsx — a Server Component, rendered to HTML on the server
export default function HomePage() {
  return (
    <main className="...">
      <h1>Buddies — Day 1</h1>
      <p>Plan trips. Travel together. Remember everything.</p>
    </main>
  );
}
```

```ts
// app/api/health/route.ts — an HTTP endpoint at /api/health
export async function GET() {
  return Response.json({ ok: true, ts: Date.now() });
}
```

Same project, same `tsconfig.json`, same dev server. The browser gets HTML for `/`, JSON for `/api/health`. No CORS, no separate deploy. This is the App Router's pitch in two files.

---

## 🧪 How I Tested It

After resolving Bug 01 (Node version mismatch — see below):

- [x] `nvm use` activated Node 20.20.0 in the shell (per the `.nvmrc` pin)
- [x] `pnpm dev` started cleanly — Next.js banner + `Ready` line, no warnings
- [x] Browser at `http://localhost:3000` rendered the "Buddies — Day 1" heading + tagline + `/api/health` hint
- [x] `curl -s http://localhost:3000/api/health` returned `{"ok":true,"ts":<number>}`
- [ ] Fast Refresh smoke test (edit a string in `app/page.tsx` → see browser update) — deferred to Day 2 unless something seems off

---

## 🐛 Bugs Encountered During This Task

- **[Bug 01 — `pnpm dev` fails: requires Node 18.12+, system Node is 16.20](../bug/01_pnpm_node_version_mismatch.md)** — 🔴 Critical, ✅ Resolved. Root cause: system Node 16 shadowed nvm's Node 20 in `$PATH`. Fix: `nvm use` in the repo root (the repo already pinned 20 via `.nvmrc`).

---

## 📸 Screenshots

_(Skipped for Day 1 — no UI work happened. Day 2 will produce the first interesting screenshot.)_

---

## ➡️ What's Next? (Follow-ups)

- **Day 2 — App Router & RSC Mental Model:** layouts, nested routes, parallel routes, `loading.tsx`, `error.tsx`, server vs client boundaries. We'll add a second route and a Client Component island.
- **Day 3 — Tailwind, Design Tokens, Theme System:** populate `tailwind.config.ts` with the Buddies palette, add a theme toggle, set up semantic color tokens.
- **Day 6 — Prisma + MongoDB:** schema for Trip, Membership, Place, Expense; the first real `await db.trip.findMany()` in a Server Component.
