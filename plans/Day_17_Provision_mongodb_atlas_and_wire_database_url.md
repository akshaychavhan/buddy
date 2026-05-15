# Day_17_Provision_mongodb_atlas_and_wire_database_url

## Goal

First **infra** commit of the Auth Detour. No app-code change; this commit ships **a guided walkthrough for provisioning MongoDB Atlas** (the cloud-hosted MongoDB the project's `.env.example` already anticipates) and wiring `DATABASE_URL` into `.env.local`. The plan file *is* the deliverable — you do the cloud work outside the repo in parallel.

After this commit, `pnpm prisma db push` should succeed against your fresh Atlas cluster (even though the schema is still empty — that's fine; `db push` against an empty schema is a no-op that proves connectivity).

## Summary

**Files at a glance**

| Group     | Files                                                          |
| --------- | -------------------------------------------------------------- |
| Plan doc  | `plans/Day_17_Provision_mongodb_atlas_and_wire_database_url.md` |
| Index     | `docs/README.md` (Auth Detour checklist row flipped)            |

**What you'll do / what you'll see**

| Step                                                            | What happens                                                                                |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Sign up at https://www.mongodb.com/cloud/atlas/register         | Free Atlas account (no credit card needed for M0 free tier). |
| Create an **M0 Sandbox** cluster                                | Takes ~5 minutes to provision. Pick a region close to you. |
| Add `0.0.0.0/0` to **Network Access** (dev only)                | Lets any IP connect (matches development reality of changing IPs). Production would be tighter. |
| Create a **Database User** with username + strong password      | Save the password — you'll paste it into the connection string. |
| Click **Connect → Drivers → Node.js**, copy connection string   | Looks like `mongodb+srv://USER:PASS@cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority`. |
| Paste into `.env.local` as `DATABASE_URL` (with `/buddies` db)  | Replace `USER`, `PASS`; add `/buddies` before the `?retryWrites...`. |
| `nvm use && pnpm prisma db push`                                | Outputs "Your database is now in sync with your Prisma schema." Proves connectivity. |

> The commit itself only ships the plan file + a checklist row flip. The *cloud work happens in your browser.*

## Commands

```bash
# After provisioning Atlas in the browser, set up the local env.
cp -n .env.example .env.local   # creates .env.local from template if it doesn't exist
# Open .env.local in your editor, replace DATABASE_URL with your Atlas string.

# Verify connectivity (will print "in sync" against the empty schema).
nvm use
pnpm prisma db push
```

## Files changed

- `plans/Day_17_Provision_mongodb_atlas_and_wire_database_url.md` — **created**: this file. Contains the **full walkthrough** below.
- `docs/README.md` — **edited**: Auth Detour checklist row "MongoDB Atlas provisioning" flips from **Concepts pending ⏳** to **Concepts covered ✅**, tagged `Day_17`. Covered count: 2 → 3; pending: 20 → 19.

No code change. No `prisma/schema.prisma` change. No `package.json` change. The next commit (`Day_18`) ships `lib/prisma.ts` and `package.json`'s `"db:push"` script.

## Verification

1. Atlas console at `cloud.mongodb.com` shows a green **M0 Sandbox** cluster, "Active" status.
2. **Network Access** tab shows entry `0.0.0.0/0` (description: "Anywhere — dev only, tighten before prod").
3. **Database Access** tab shows your user with `readWriteAnyDatabase@admin` (or `Atlas admin`) role.
4. Your `.env.local` exists and has `DATABASE_URL="mongodb+srv://..."` filled in (NOT empty, NOT the placeholder from `.env.example`).
5. `pnpm prisma db push` outputs something like:
   ```
   Datasource "db": MongoDB database "buddies" at "cluster0.xxxxx.mongodb.net"
   The database is already in sync with the Prisma schema.
   ✔ Generated Prisma Client (v5.22.0)
   ```
6. `docs/README.md` Auth Detour Checklist shows "MongoDB Atlas provisioning" under **Concepts covered ✅** with `Day_17` tag. Covered: **3**, pending: **19**.

---

## 🛣️ Full Atlas Provisioning Walkthrough (Manual Steps)

### Step 1 — Create the Atlas account (~2 min)

1. Open https://www.mongodb.com/cloud/atlas/register
2. Sign up with **email** (or Google — either is fine). No credit card needed for the free tier.
3. Verify your email if prompted.
4. When the dashboard asks "What's your goal?" — pick **"Learn MongoDB"** or **"Build a new application"** (doesn't affect anything technical).

### Step 2 — Create a free-tier cluster (~5 min provisioning)

1. From the dashboard, click **Build a Database**.
2. Choose **M0 (Free)** — the green "Free" tier. **Do not pick M2/M5/M10** — they cost money.
3. **Provider**: AWS / Google Cloud / Azure all work; AWS is the default and fine.
4. **Region**: pick one geographically close to you (e.g. `Mumbai (ap-south-1)` for India, `N. Virginia (us-east-1)` for US East Coast).
5. **Cluster name**: default `Cluster0` is fine — it's just a label.
6. Click **Create Deployment**. The provisioning takes 3–5 minutes; you'll see a "Connect to Cluster0" modal appear when ready.

### Step 3 — Create a database user (~1 min)

The "Connect to Cluster0" modal will prompt you for a user first:

1. **Username**: something memorable like `buddies-dev`.
2. **Password**: click **Autogenerate Secure Password** and **copy it to a secure place** (password manager, sticky note, whatever — you'll need it in Step 5).
3. Click **Create Database User**.

If you missed the modal: **Security → Database Access → Add New Database User**. Use **Password** authentication, role **Read and write to any database** (good enough for dev).

### Step 4 — Allow your IP to connect (~30 sec)

Still in the "Connect to Cluster0" modal (or **Security → Network Access**):

1. Click **Add IP Address**.
2. Click **Allow Access from Anywhere** — this adds `0.0.0.0/0`.
3. **Description**: "Dev only — tighten before prod" (so future-you knows to lock it down).
4. Click **Confirm**.

> ⚠️ `0.0.0.0/0` means anyone with your username + password can connect. Acceptable for dev because the password is strong; **must be replaced with a specific IP range or VPC peering before going to production**. The TODO is now logged in the description.

### Step 5 — Get the connection string (~30 sec)

1. From the cluster overview, click **Connect**.
2. Choose **Drivers** (not Compass, not the Atlas CLI — the Node.js driver string is what Prisma needs).
3. **Driver**: `Node.js`, **Version**: `5.5 or later`.
4. **Copy the connection string** — looks like:
   ```
   mongodb+srv://buddies-dev:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   ```
5. Notice the literal `<password>` placeholder — you'll replace it manually.

### Step 6 — Paste into `.env.local` (~1 min)

1. From the repo root, **if `.env.local` doesn't exist**, copy the example:
   ```bash
   cp -n .env.example .env.local
   ```
   The `-n` flag means "don't overwrite if it already exists" — safe to run repeatedly.

2. Open `.env.local` in your editor.

3. Find the `DATABASE_URL=""` line. Paste the Atlas string between the quotes, **then**:
   - Replace `<password>` with the password from Step 3.
   - Add `/buddies` right before the `?` so it becomes the database name:
     ```
     DATABASE_URL="mongodb+srv://buddies-dev:YOUR_PASSWORD_HERE@cluster0.xxxxx.mongodb.net/buddies?retryWrites=true&w=majority&appName=Cluster0"
     ```
   - **`/buddies` is the database name** that Prisma will create on first `db push`. If you skip it, Mongo uses `test` as the database by default — works but confusing.

4. Save the file. Confirm `.env.local` is **gitignored** (it is — `.env*.local` is in `.gitignore` from `Infra_03`).

### Step 7 — Verify with `prisma db push` (~30 sec)

```bash
nvm use
pnpm prisma db push
```

Expected output:

```
Environment variables loaded from .env.local
Prisma schema loaded from prisma/schema.prisma
Datasource "db": MongoDB database "buddies" at "cluster0.xxxxx.mongodb.net"

The database is already in sync with the Prisma schema.

✔ Generated Prisma Client (v5.22.0) to ./node_modules/@prisma/client in 124ms
```

The "already in sync" message is the green light — Prisma connected, found the database, and the schema (which is just the datasource block) matches the empty state of the DB. **You're wired up.**

If you see "Authentication failed" — the password in the connection string is wrong (Step 3 + Step 6). If you see "ENOTFOUND" — the cluster URL is wrong (Step 5). If you see "IP not allowed" — Step 4 didn't take, retry it.

---

## Gotchas / decisions

- **Why M0 free tier?** It's enough for a single-developer learning project: 512 MB storage, ~100 simultaneous connections, no time limit, no credit card. We'll never hit those limits during the detour. Production scales to M10+ paid tiers.
- **Why `0.0.0.0/0`?** Convenience. Home/work IPs change; coffee shops have unpredictable IPs; mobile tethering rotates. Locking the allowlist to a single IP means you'd be re-editing it every time you move. The mitigating factor is a strong password and a non-prod cluster — but **never carry this to production**.
- **Why `/buddies` in the URL?** It's the database name Prisma uses. Without it, Mongo defaults to a database named `test`. With it, Atlas creates a database explicitly named `buddies` on first `db push` — visible in the Atlas UI, easier to inspect.
- **Why `cp -n .env.example .env.local` and not `cp`?** `-n` is "no-clobber" — if `.env.local` already exists (because you ran the command twice), it doesn't overwrite. Idempotent.
- **`.env.local` is the right file, not `.env`.** Next.js loads `.env.local` *after* `.env` and `.env.local` is gitignored. `.env` is committed (as a default-values file). For secrets, always `.env.local`.
- **Connection string contains the password in plain text.** That's why `.env.local` is gitignored. If you ever accidentally commit it, **rotate the password immediately in Atlas** (Database Access → Edit → Edit Password). The committed string is now public knowledge.
- **`pnpm prisma db push` regenerates the Prisma client as a side effect.** That's why you see "✔ Generated Prisma Client" at the end — same as running `prisma generate`. Convenient: one command syncs both the DB and the local TypeScript types.
- **Why no `prisma migrate dev`?** It doesn't work on MongoDB (see Day_16's doc). `db push` is the only schema-sync tool here. There are no migration files, no `prisma/migrations/` folder, no version history.
- **The cluster will auto-pause after 7 days of inactivity** on M0. Wakes up on first query (~10 sec delay). Don't be alarmed if a first push after a vacation takes longer than expected.
- **Atlas UI is a useful inspector.** From the cluster page, click **Browse Collections** to see what's actually stored. Empty for now; will populate once `Day_22` pushes the four auth models and `Day_25` creates the first user.
