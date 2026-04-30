# 📝 Commit Convention — Buddies

> **Purpose:** Make every commit self-documenting. A year from now, `git log` should read like a textbook of how this project was built.

This convention is **mandatory** for all commits in this repository. Cursor + Claude follow it automatically when generating commits at the end of each task.

---

## 📐 Format

```
<type>(<scope>): <short description>

[optional body — what and why, not how]

[optional footer — issue refs, breaking changes]
```

### Anatomy of a Good Commit Message

```
feat(day4/task05): add trip list with categorized tabs

- segmented control filters by past/active/upcoming/drafts
- countdown hero card for next upcoming trip
- pulse animation on active trip badge
- pull-to-refresh wired to TanStack Query

closes #5
```

---

## 🏷️ Types — Use ONLY These

| Type | When to use | Example |
|---|---|---|
| `feat` | A new feature or user-facing capability | `feat(day4/task05): add trip categorization tabs` |
| `fix` | A bug fix | `fix(day3/bug02): resolve expo router type errors` |
| `docs` | Documentation only — no code change | `docs(day1): add setup learning notes` |
| `chore` | Tooling, config, build files, dependencies — no code logic | `chore(day1): configure typescript strict mode` |
| `style` | Formatting, missing semicolons, etc. — no logic change | `style(day2): apply prettier across project` |
| `refactor` | Code restructure that doesn't change behavior | `refactor(day7): extract auth client config` |
| `test` | Adding or updating tests | `test(day11): add bill split algorithm tests` |
| `perf` | Performance improvement | `perf(day13): virtualize timeline list` |

> ⚠️ **Don't invent new types.** If something doesn't fit, it probably belongs to one of these. When in doubt, use `chore`.

---

## 🎯 Scopes — Project-Specific

The scope tells you *where* in the project the change lives.

### Day-based scopes

| Scope | Meaning |
|---|---|
| `day1` to `day15` | Work belonging to a specific day in the learning roadmap |
| `dayN/taskNN` | Specific task within a day (e.g., `day4/task05`) |
| `dayN/bugNN` | Specific bug within a day (e.g., `day3/bug02`) |

### Project-level scopes

| Scope | Meaning |
|---|---|
| `infra` | Repo setup, GitHub Actions, CI, project-wide config |
| `prompt` | Updates to `PROMPT.md` |
| `future` | Updates to `FUTURE_SCOPE.md` |
| `deps` | Dependency upgrades not tied to a specific day |

> 💡 **Why scope by day/task?** Future you running `git log --oneline | grep day7` can instantly review every commit related to authentication. Same for any feature.

---

## ✏️ Description Rules

- ✅ **Lowercase** — `add trip cards`, not `Add Trip Cards`
- ✅ **Imperative mood** — `add`, `fix`, `update` (not `added`, `fixes`, `updates`)
- ✅ **No period at the end** — `add tabs` not `add tabs.`
- ✅ **Max 72 characters total line** — short and scannable
- ✅ **Concrete, not vague**
  - ✓ `add expo router shell with auth and tabs groups`
  - ✗ `update routing`
  - ✗ `progress on navigation`
- ✅ **Mention the *what*, not the *how***
  - ✓ `replace zustand with tanstack query for trips`
  - ✗ `change useState to useQuery in tripStore.ts`

---

## 📖 Body (Optional)

Add a body when the commit needs more context — what changed, why, or notable side effects. Skip for trivial commits.

**Format:**
- Blank line after the description
- Wrap at 72 chars
- Use bullet points for multiple changes
- Explain **what** and **why**, not **how** (the code shows the how)

**Good body example:**

```
feat(day7/task13): wire trips crud to backend with tanstack query

- replace local zustand state with server queries
- add optimistic updates for create/delete
- handle offline retries via persist plugin
- session expiry triggers redirect to sign-in

closes #13
```

**Bad body example:**

```
feat(day7/task13): wire trips crud

I changed tripStore.ts to use useQuery instead of zustand and now
it fetches from /api/trips and uses TanStack Query for caching.
Then I added a mutation for creating trips...
```

*(Just describes the diff — adds no value beyond reading the code.)*

---

## 🔗 Footer (Optional)

Used for issue references, breaking changes, and special notes.

### Issue references

```
closes #5
fixes #12
relates to #7
```

GitHub auto-links issues and closes them when the PR/commit is merged.

### Breaking changes

```
BREAKING CHANGE: trip API now requires `baseCurrency` field

Existing clients sending requests without `baseCurrency` will receive
a 400 response. Mobile app updated in commit abc123.
```

---

## 🌟 Real-World Examples for Buddies

### Day 1 — Initial Setup

```
chore(infra): initial repo setup with docs scaffolding
docs(day1): add setup and installation learning notes
feat(day1/task01): scaffold expo project with typescript
docs(day1): add rn vs react mental model notes
```

### Day 2 — Styling

```
docs(day2): add nativewind and flexbox learning notes
chore(day2): install nativewind and configure tailwind
feat(day2/task02): define theme tokens in tailwind config
feat(day2/task02): add reusable card and button components
docs(day2): add platform-specific shadows notes
```

### Day 3 — Navigation

```
docs(day3): add expo router and deep linking notes
feat(day3/task03): set up tabs and trip route shell
fix(day3/bug01): resolve safe area inset on android
```

### Day 4 — Trip Categorization

```
docs(day4): add forms and trip status logic notes
feat(day4/task04): create trip bottom sheet form
feat(day4/task05): add trip list with categorized tabs

- segmented control filters by past/active/upcoming/drafts
- countdown hero card for next upcoming trip
- pulse animation on active trip badge
- pull-to-refresh wired to TanStack Query

closes #5
```

### Day 7 — Auth (more complex day)

```
docs(day7): add better auth overview and architecture
chore(day7): install better auth and prisma adapter
feat(day7/task10): configure better auth server with email/password
feat(day7/task11): add expo auth client with secure store
feat(day7/task12): protect (tabs) group with auth gate
fix(day7/bug04): handle expired session on cold start
feat(day7/task13): wire trips crud to backend with tanstack query
```

### Day 11 — Email Invitations

```
docs(day11): add resend setup and invitation flow notes
chore(day11): install resend and react-email
feat(day11/task26): wire up resend email service
feat(day11/task27): add invite buddies via email ui
fix(day11/bug08): handle expired invitation tokens
```

---

## ❌ Anti-Patterns — Avoid These

### Vague descriptions

```
fix: bug                              ❌ Which bug?
chore: stuff                          ❌ What stuff?
update                                ❌ Update what?
WIP                                   ❌ Squash WIP commits before pushing
asdf                                  ❌ Don't even
```

### Missing type

```
add trip cards                        ❌ Should be: feat: add trip cards
fixed crash on android                ❌ Should be: fix(android): resolve startup crash
```

### Wrong tense

```
feat: added new tabs                  ❌ Past tense — use: add new tabs
fix: fixing the bug                   ❌ Continuous — use: fix the bug
```

### Multi-purpose commits

```
feat(day4): add tabs, fix android, update deps   ❌ Three things — three commits
```

Split into:
```
feat(day4/task05): add trip list tabs
fix(day4/bug03): resolve android keyboard avoidance
chore(deps): upgrade react-native-reanimated
```

### Implementation details in description

```
feat(day4): change useState to useReducer in tripStore.ts
```

The reader doesn't care about line-level changes. Better:

```
refactor(day4): centralize trip state with reducer pattern
```

---

## 🤖 Letting Cursor + Claude Generate Commits

When you finish a task, ask Claude:

> *"Generate a commit message following our convention for the changes I just made."*

Claude reads `git diff` (or `git status`), figures out the scope from the task doc you've been working on, and produces a properly formatted commit. Verify it before committing — but it should usually be 95% right.

---

## 🛠️ Tooling (Optional Future Setup)

These can be added later — not required for V1.

### Commitlint (V2 enhancement)

Enforce this convention automatically via pre-commit hook:

```bash
npm install --save-dev @commitlint/cli @commitlint/config-conventional
```

`commitlint.config.js`:
```js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-empty': [2, 'never'],
    'subject-case': [2, 'always', 'lower-case'],
  },
};
```

### Husky pre-commit hook

```bash
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit "$1"'
```

Now bad commit messages get rejected before they enter history.

### Auto-changelog generation

Once on conventional commits, you can auto-generate `CHANGELOG.md` from git history:

```bash
npx conventional-changelog -p angular -i CHANGELOG.md -s
```

---

## 📋 Quick Reference Cheat Sheet

```
TYPES:    feat | fix | docs | chore | style | refactor | test | perf
SCOPES:   day1...day15 | dayN/taskNN | dayN/bugNN | infra | prompt | future | deps
TENSE:    imperative ("add", not "added")
CASE:     lowercase, no trailing period
LENGTH:   <= 72 chars total
BODY:     blank line + bullets + what/why
FOOTER:   "closes #N" | "fixes #N" | "BREAKING CHANGE: ..."

GOOD:  feat(day4/task05): add trip list with categorized tabs
BAD:   Updated stuff
BAD:   feat: added new tabs and fixed bug
BAD:   wip
```

---

**Stick to this from commit #1 and your git history will read beautifully forever.**
