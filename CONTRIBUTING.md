# Contributing to Buddies

Thanks for your interest! Buddies is primarily a personal learning project, but suggestions, bug reports, and pull requests are welcome.

---

## 💬 Have a Question or Suggestion?

- **Bug?** [Open an issue](../../issues/new?template=bug_report.md)
- **Feature idea?** [Open an issue](../../issues/new?template=feature_request.md) — or check [`FUTURE_SCOPE.md`](./FUTURE_SCOPE.md) to see if it's already planned
- **General question?** Open a discussion or issue

---

## 🛠️ Local Development

See [`docs/learning/day1_setup.md`](./docs/learning/day1_setup.md) for full setup instructions.

Quick start:

```bash
# Clone
git clone https://github.com/AkshayChavhan/buddies.git
cd buddies

# Mobile app
cd apps/mobile && npm install && npx expo start

# Backend (separate terminal)
cd apps/api && npm install && npm run dev
```

---

## 📝 Commit Message Convention

This project uses **Conventional Commits with day/task scoping**. Every commit should follow this format:

```
<type>(<scope>): <short description>
```

**Examples:**

```
feat(day4/task05): add trip list with categorized tabs
fix(day3/bug02): resolve expo router type errors
docs(day1): add setup and installation learning notes
chore(infra): configure github actions ci
```

**Quick reference:**

| Type | Use for |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `chore` | Tooling, config, dependencies |
| `refactor` | Code restructure (no behavior change) |
| `test` | Tests |
| `perf` | Performance |

**Scopes:** `day1`–`day15`, `dayN/taskNN`, `dayN/bugNN`, `infra`, `prompt`, `future`, `deps`

📖 **Full convention with examples and anti-patterns:** [`docs/COMMIT_CONVENTION.md`](./docs/COMMIT_CONVENTION.md)

---

## 🔀 Pull Request Process

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/dayN-feature-name`
3. Follow the [commit convention](./docs/COMMIT_CONVENTION.md)
4. Update relevant docs (`docs/learning/`, `docs/task/`, or `docs/bug/`)
5. Open a PR with a clear description of what and why
6. Link any related issues with `closes #N` in the description

---

## 📚 Project Structure

```
buddies/
├── apps/
│   ├── mobile/          # Expo React Native app
│   └── api/             # Next.js backend
├── docs/
│   ├── learning/        # Concept lessons
│   ├── bug/             # Bug journal
│   ├── task/            # Feature tasks
│   └── COMMIT_CONVENTION.md
├── PROMPT.md            # Build & learning prompt for AI assistants
└── FUTURE_SCOPE.md      # V2 features playbook
```

For a deeper understanding of how this project is built, see [`PROMPT.md`](./PROMPT.md) — the master document guiding development and learning.

---

## 🙏 Code of Conduct

Be kind, constructive, and patient. This is a learning project — questions and curiosity are encouraged.

---

Thanks for contributing! 🧳
