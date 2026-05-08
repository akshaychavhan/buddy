# Day 1 — Installation: Tooling Checklist

> **Created:** 2026-04-30
> **Updated:** 2026-05-08 (retargeted from Expo / phone-based dev to web-based Next.js dev)
> **Phase:** 1 — Foundations
> **Mode:** Quick reference checklist (env already set up — confirming, not installing)

---

## 🎯 What Are We Learning?

The minimum tools required on your machine to run Buddies (the Next.js app), plus the **one-line verification command** for each.

You already confirmed your dev environment is set up. This doc is a defensive checklist — run each command, confirm the expected output, and we move on. If anything fails, that becomes Bug #01 and we slow down.

---

## 🤔 Why Does This Matter?

90% of Day 1 failures for newcomers are **tooling failures**, not code failures:
- Wrong Node version → Next.js refuses to start, or crashes mid-build
- pnpm not installed (or wrong version) → `pnpm install` fails before we begin
- Missing `.env.local` → Prisma client can't connect; the dev server runs but routes blow up

Catching these now means we don't waste mental cycles debugging environment issues mid-feature.

---

## 🧠 How It Works (The Concept)

Five layers of tooling:

```
1. Your dev machine          →  Node 20+, Git, pnpm
2. The Next.js dev server    →  `pnpm dev` (built-in, started by your package.json script)
3. Your browser              →  Any modern Chromium / Firefox / Safari
4. The database              →  MongoDB Atlas (free tier) or local MongoDB
5. Cloud accounts (later)    →  Cloudinary (image hosting), Resend (transactional email)
```

That's it. No emulators, no native SDKs, no LAN dance — your dev server runs on `localhost:3000` and your browser opens it. Fast iteration.

---

## ✅ Verification Checklist

Run each command. Confirm the expected output. Tick the box.

### 1. Node 20+

```bash
node --version
```

**Expected:** `v20.x.x` or higher. The repo's `.nvmrc` pins `20`, and `package.json` has `"engines": { "node": ">=20" }`. If you use `nvm`, `nvm use` in the project root picks the right version automatically.

- [ ] Node ≥ 20.x

### 2. Git

```bash
git --version
```

**Expected:** any modern version (`git version 2.x.x`).

- [ ] Git installed

### 3. pnpm

```bash
pnpm --version
```

**Expected:** `9.x.x`. The repo's `package.json` pins `"packageManager": "pnpm@9.12.0"` — if you have a different major version, install pnpm 9: `npm install -g pnpm@9` or `corepack enable && corepack prepare pnpm@9.12.0 --activate`.

- [ ] pnpm ≥ 9.x

### 4. The dev server starts

From the repo root:

```bash
pnpm install
pnpm dev
```

**Expected:** terminal prints something like `▲ Next.js 14.x.x — Local: http://localhost:3000 — Ready in 2s`. Open the URL in a browser — you should see "Buddies — Day 1".

- [ ] `pnpm dev` starts and `localhost:3000` loads the page

### 5. The API endpoint responds

In a separate terminal:

```bash
curl -s http://localhost:3000/api/health
```

**Expected:** `{"ok":true,"ts":<some-number>}`. This is the single-deploy proof — the same Next.js process serves both the UI and the API.

- [ ] `/api/health` returns `{"ok":true,...}`

### 6. `.env.local` is set up

```bash
ls .env.local || echo "missing"
```

**Expected:** if you're working with the database, you should see `.env.local` listed (it's gitignored — you create it from `.env.example`). If you're just running the page + health route, `.env.local` is optional.

When you're ready to wire up the database:

```bash
cp .env.example .env.local
# then edit .env.local and fill in DATABASE_URL, BETTER_AUTH_SECRET, etc.
```

- [ ] `.env.local` exists (or you've consciously deferred it)

### 7. MongoDB connection-string smoke test (optional for today)

If `.env.local` has a real `DATABASE_URL`:

```bash
pnpm prisma:generate    # generates the Prisma client from the schema
```

**Expected:** "✔ Generated Prisma Client". This doesn't connect to the database — it just generates types. The connection happens later, the first time a server component calls `db.trip.findMany()`.

If you want to test the actual connection now:

```bash
pnpm exec prisma db pull
```

This will reach the MongoDB instance and pull its current schema. Failing with "auth error" is fine for today — it just means the credentials need fixing, but the network reachability is proven. Failing with "ENOTFOUND" / "ETIMEOUT" means the URL or whitelisting is wrong.

- [ ] (Optional) Prisma client generated from schema

### 8. Cloudinary + Resend accounts (deferred)

These are **not** required to run Day 1. We'll wire them up in their respective days (Cloudinary on Day 8, Resend on Day 11). For now, just have the accounts ready:

- [Cloudinary free tier](https://cloudinary.com/users/register/free) — image hosting
- [Resend free tier](https://resend.com/signup) — transactional email (3000/month)

- [ ] Account links bookmarked (no setup needed today)

---

## 🔄 Mental anchor: web dev vs the world you came from

If you've ever set up a web app dev environment before, this is identical. There's no exotic phone-pairing, no SDK install, no platform-specific flag.

| Concern              | Web dev (us)                                   |
| -------------------- | ---------------------------------------------- |
| Runtime              | Node 20+ on your machine                       |
| Dev server           | `pnpm dev` (Next.js built-in, Turbopack/Webpack under the hood) |
| Connection           | Browser → `http://localhost:3000`              |
| Restart trigger      | Edit any file → Fast Refresh                   |
| Production deploy    | Push to `main` → Vercel / Render / Fly auto-builds |

---

## 🛠️ Optional Tooling (Skip for Day 1)

These are **not** required to ship Buddies V1. Skip them until you actually need them:

- **MongoDB Compass / Studio 3T** — GUI for inspecting your MongoDB collections. Helpful from Day 6 onward.
- **Postman / HTTPie / `httpie`** — for hitting your route handlers without a browser. The repo's CI replays the same checks via `curl`, so a CLI tool is fine.
- **Docker** — only if you want to run MongoDB locally instead of using Atlas. Atlas free tier is simpler.

---

## ⚠️ Gotchas & Beginner Mistakes

- **`pnpm: command not found`** → install pnpm: `npm install -g pnpm@9` (or use `corepack enable`).
- **`pnpm dev` errors with "Configuring Next.js via 'next.config.ts' is not supported"** → you're on Next 14, which only reads `.mjs`/`.js`/`.cjs` configs. The repo already uses `next.config.mjs` (fixed in `Infra_04`).
- **Page loads but `/api/health` returns 404** → make sure the file lives at `app/api/health/route.ts` and that you exported a `GET` function. The folder name (`health`) is what determines the URL.
- **"Module not found: @prisma/client"** → run `pnpm prisma:generate`. The Prisma client is generated from the schema, not bundled with the npm package.
- **Hot reload not picking up Tailwind class changes** → make sure your file is in the `content` glob in `tailwind.config.ts`. New top-level folders need to be added there.

---

## 🧪 Quick Quiz

1. What's the minimum Node version Buddies requires?
2. Which package manager does Buddies pin via `package.json#packageManager`?
3. Where does the `/api/health` endpoint live in the App Router file convention?
4. What's the difference between `pnpm install` and `pnpm prisma:generate`?
5. Do you need MongoDB / Cloudinary / Resend accounts to run Day 1 successfully?

---

## 📌 Key Takeaways

- Verify Node 20+, pnpm, and `pnpm dev` running — that's the entire Day 1 toolchain.
- `.env.local` is optional today; needed from Day 6 (database) onward.
- Cloudinary + Resend accounts are bookmarks, not installs.
- No emulators, no LAN, no native SDKs — your browser at `localhost:3000` is the entire dev environment.

---

## 🔗 References

- [Next.js — Installation](https://nextjs.org/docs/app/getting-started/installation)
- [pnpm — Installation](https://pnpm.io/installation)
- [Prisma — Get Started with MongoDB](https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch/mongodb-typescript-mongodb)
- [MongoDB Atlas — Free Tier](https://www.mongodb.com/cloud/atlas/register)

---

## ➡️ What's Next?

Once every box above is ticked, proceed to [Task 01 — Project Scaffolding](../task/01_project_scaffolding.md) to walk through the project structure that's already in place.
