# Contributing to Buddies

Thanks for your interest! Buddies is primarily a personal learning project, but suggestions, bug reports, and pull requests are welcome.

---

## 💬 Have a Question or Suggestion?

- **Bug?** [Open an issue](../../issues/new?template=bug_report.md)
- **Feature idea?** [Open an issue](../../issues/new?template=feature_request.md) — or check [`FUTURE_SCOPE.md`](./FUTURE_SCOPE.md) to see if it's already planned
- **General question?** Open a discussion or issue

---

## 🛠️ Local Development

See [`docs/learning/day1_setup.md`](./docs/learning/day1_setup.md) for the full walkthrough.

Quick start:

```bash
# Clone
git clone https://github.com/AkshayChavhan/buddy.git
cd buddy

# Set up env vars (edit .env.local with your real values)
cp .env.example .env.local

# Install and run
pnpm install
pnpm prisma:generate
pnpm dev
```

Then open `http://localhost:3000` (UI) and `http://localhost:3000/api/health` (API sanity check).

---

## 📝 Commit Message Convention

Commits in this repo follow the **`Infra_NN_Descriptive_name`** format — PascalCase words joined by underscores, with a numbered prefix. Examples:

```
Infra_01_Collapse_existing_structure
Infra_02_Scaffold_root_nextjs
Infra_06_Rewrite_readme_and_contributing
```

The numbered prefix makes the build history easy to scan as a tutorial timeline. As the project grows, other prefixes may join (e.g. `Day_NN_…` for learning-day commits, `Feat_NN_…` for product features) — when that happens, this section will be updated.

> **Note:** An older convention (Conventional Commits — `feat(scope): …`) is still documented in [`docs/COMMIT_CONVENTION.md`](./docs/COMMIT_CONVENTION.md). That file is being retired and will be rewritten or removed in a follow-up commit. Use the `Infra_NN_…` style going forward.

### Plan files in `/plans/`

Every commit ships with a matching beginner-friendly walkthrough at `plans/<commit-name>.md`. The plan file is **written first**, the changes follow, and they get committed together as one atomic commit. Each plan file contains:

1. **Goal** — what the commit does and why a beginner should care
2. **Summary** — a 2-table TL;DR (Files at a glance + What you'll run / what you'll see)
3. **Commands** — exact shell commands, copy-pasteable
4. **Files changed** — per-file plain-English notes
5. **Verification** — how to prove it worked
6. **Gotchas / decisions** — anything surprising

See [`plans/Infra_02_Scaffold_root_nextjs.md`](./plans/Infra_02_Scaffold_root_nextjs.md) for a fully fleshed-out example.

---

## 🔀 Pull Request Process

1. Fork the repo
2. Create a feature branch: `git checkout -b infra/your-change-name` (or `day-N` for learning-day commits)
3. Write the matching `plans/<commit-name>.md` first
4. Make the code/doc changes
5. Update relevant docs (`docs/learning/`, `docs/task/`, or `docs/bug/`)
6. Open a PR with a clear description of what and why
7. Link any related issues with `closes #N` in the description

CI runs `pnpm install` → `pnpm typecheck` → `pnpm lint` → `pnpm build` on every push and PR. Make sure these pass locally before pushing.

---

## 📚 Project Structure

```
buddies/
├── app/             # Next.js App Router — pages, layouts, route handlers
│   ├── api/         # Backend HTTP endpoints
│   ├── layout.tsx
│   └── page.tsx
├── components/      # Shared React components
├── lib/             # Server-only helpers, db client, etc.
├── prisma/          # Prisma schema + generated client
├── public/          # Static assets
├── plans/           # Per-commit beginner walkthroughs
├── docs/
│   ├── learning/    # Concept lessons
│   ├── bug/         # Bug journal
│   ├── task/        # Feature tasks
│   └── COMMIT_CONVENTION.md  (being retired)
├── PROMPT.md        # Build & learning prompt for AI assistants
└── FUTURE_SCOPE.md  # V2 features playbook
```

For a deeper understanding of how this project is built, see [`PROMPT.md`](./PROMPT.md) — the master document guiding development and learning.

---

## 🙏 Code of Conduct

Be kind, constructive, and patient. This is a learning project — questions and curiosity are encouraged.

---

Thanks for contributing! 🧳
