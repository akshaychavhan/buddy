# Bug 01 — `pnpm dev` fails: requires Node 18.12+, system Node is 16.20

> **Date:** 2026-05-01
> **Severity:** 🔴 Critical — blocks `pnpm dev` entirely
> **Status:** ✅ Resolved
> **Resolved:** 2026-05-01
> **Time to fix:** ~2 minutes (running `nvm use` in the repo root)

---

## 🐛 What Happened?

Tried to start the Next.js dev server for the first time on this branch. `pnpm` aborted immediately with a Node version error.

### Error Message / Stack Trace

```
$ pnpm dev
ERROR: This version of pnpm requires at least Node.js v18.12
The current version of Node.js is v16.20.2
Visit https://r.pnpm.io/comp to see the list of past pnpm versions with respective Node.js version support.
```

Exit code `1`. No Next.js banner, no `Ready in …` line. The server never got far enough to attempt binding to a port.

---

## 🎯 What I Was Trying to Do

> See: [Task 01 — Project Scaffolding](../task/01_project_scaffolding.md) — specifically step 10 of the Implementation Plan ("Verify `pnpm dev` runs"). Day 1's whole verification depends on this command working.

---

## 🔍 Steps to Reproduce

From a fresh shell on this machine:

```bash
cd /home/l910009/Documents/workspace/buddy
pnpm dev
```

Reproduces 100% — it's a Node version check, not a flaky condition.

---

## 🧪 What I Tried (That Didn't Work)

Nothing yet — we caught it on the first attempt. The error message is self-explanatory.

---

## 💡 Root Cause

Two competing Node installations on the machine, and the *system* one is winning:

| Source | Node version | Path |
| --- | --- | --- |
| System Node (`/usr/bin/node`) | **16.20.2** | `/usr/bin/node` — first in `$PATH` |
| nvm-installed Node (`v20.20.0`) | 20.20.0 | `/home/l910009/.nvm/versions/node/v20.20.0/bin/node` — available but not active |

`pnpm` itself was installed via nvm (`/home/l910009/.nvm/versions/node/v20.20.0/bin/pnpm`), but it runs under whichever `node` is first in `$PATH`. Right now that's the system Node 16. Since pnpm 9 requires Node ≥ 18.12, it refuses to do anything.

The repo's `.nvmrc` already pins Node `20`, which means an `nvm use` in the project root would pick the right version — but that hasn't been invoked yet in this shell.

### Why the [day1_installation.md](../learning/day1_installation.md) checklist didn't catch this

The checklist's "Node 20+" step (`node --version`) would have printed `v16.20.2` and the user would have ticked "no" — but **the user told me earlier "all 6 green — proceed"**. So either the check was skipped, or it was run in a different shell where nvm was already activated. Either way: the checklist is doing its job; we just bypassed it. Lesson for future days: don't take "all green" on faith when a verification command is in our hands.

---

## ✅ Solution

Two layers — quick fix for this shell, durable fix for future shells.

### Quick fix — make this terminal use Node 20

The repo already pins Node 20 via `.nvmrc`. From the repo root:

```bash
nvm use
```

`nvm use` reads `.nvmrc` and switches the *current shell* to the pinned version. After this:

- `node --version` should print `v20.20.0`
- `pnpm dev` should start cleanly

### Durable fix — make every shell pick up `.nvmrc` automatically

`nvm use` is manual — you have to remember to run it in every new terminal. Three options for automation:

1. **`nvm` shell hook** — add a `cd` hook to `~/.bashrc` / `~/.zshrc` so opening a directory with `.nvmrc` auto-switches Node. See [nvm's "deeper shell integration" docs](https://github.com/nvm-sh/nvm#deeper-shell-integration). Most popular fix.
2. **`direnv` + `.envrc`** — drop a `.envrc` with `use nvm` in the repo. `direnv` activates the right Node on every `cd` into the directory.
3. **Use `corepack`** — Node ≥ 16.10 ships with `corepack` which can also pin pnpm; but the underlying Node version still needs to be ≥ 18 first, so this doesn't help here.

Recommended path for solo dev: **option 1** (nvm shell hook). One line in `.bashrc`, done forever.

---

## 🤔 Why This Happened (Deep Dive)

> Related concept: [Day 1 — Installation: Tooling Checklist](../learning/day1_installation.md) §1 ("Node 20+")

Three coincidences had to line up for this bug to actually block us:

1. **The system Node is older than pnpm requires.** Most Linux distros ship a conservative Node version in their package repos. Node 16 hit end-of-life in September 2023, but it lingers in stable channels for years afterward. That's why nvm exists — to let you opt into newer versions without uninstalling the system one.
2. **`$PATH` ordering put the system Node first.** When you install pnpm via npm into an nvm-managed Node, the *binary itself* lives under that Node's prefix. But the **shebang resolution** (which `node` actually runs the JS) follows `$PATH`. If the system `node` shadows nvm's, pnpm's internal `#!/usr/bin/env node` finds the wrong one.
3. **Day 1's verification step is exactly where this surfaces.** Every prior Infra commit ran in CI (which uses a different Node setup) or made docs-only changes (no `pnpm` invocation). The first time the dev server runs on this machine is Day 1 — so the first time the mismatch matters is also Day 1. Which is healthy: catch this on Day 1, not on Day 7 when you're chasing a Better Auth bug.

### The deeper lesson

**Tool version mismatches are silent until you actually run the tool.** `node --version` tells you only the active version, not the *installed* versions, not the *required* versions, and not whether they match. This is why the Day 1 checklist asks you to actually run `pnpm dev` rather than just check versions — running the tool is the only honest test.

---

## 🛡️ How to Avoid Next Time

- **Always run `nvm use` (or your equivalent) before starting work** in a repo with a `.nvmrc`. Better still: install an nvm shell hook so it's automatic.
- **When the checklist says "run command X and confirm output Y," actually run it.** Day 1's installation doc has 6 boxes — every box is there because skipping it once cost someone a Day.
- **If pnpm errors with a Node version mismatch, do not "fix" it by upgrading the system Node.** That risks breaking other projects. Use nvm to pick the right version per-project.
- **CI shouldn't catch this either**, but worth noting: our `.github/workflows/ci.yml` uses `actions/setup-node@v4 with node-version-file: .nvmrc`, so CI honors the `.nvmrc` pin. The mismatch is purely local-dev.

---

## 🔗 References

- [pnpm Node compatibility table](https://r.pnpm.io/comp)
- [nvm — Deeper shell integration](https://github.com/nvm-sh/nvm#deeper-shell-integration)
- The repo's `.nvmrc` — already pins Node `20`
- [day1_installation.md §1 — Node 20+](../learning/day1_installation.md)

---

## ➡️ Outcome

1. ✅ User ran `nvm use` in the repo root → switched to Node 20.20.0
2. ✅ Retried `pnpm dev` → Next.js dev server started cleanly on `localhost:3000`
3. ✅ `curl http://localhost:3000/api/health` returned `{"ok":true,"ts":<number>}`
4. ✅ Browser confirmed the home page rendered with the "Buddies — Day 1" heading

Linked from [docs/README.md](../README.md) Bug Journal. Day 1's `pnpm dev` verification is now real, not aspirational.
