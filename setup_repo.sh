#!/bin/bash
# ==========================================================
# Buddies — Repository Setup Script
# ==========================================================
# Optional helper for fresh forks/clones. Idempotent — safe to re-run.
#
# What it sets up:
#   - docs/ folder structure (learning, bug, task)
#   - plans/ folder (per-commit notes — created if missing)
#   - .github/ISSUE_TEMPLATE/* (bug, feature, task)
#   - .github/workflows/ directory (the actual ci.yml is committed in version control)
#   - LICENSE (MIT, only if missing)
#
# Run AFTER cloning. Then:
#   pnpm install
#   cp .env.example .env.local   # fill in your secrets
#   pnpm dev
# ==========================================================

set -e  # exit on error

echo "🧳 Setting up Buddies project structure..."

# ---------- Folder Structure ----------
echo "📁 Creating folder structure..."
mkdir -p docs/learning
mkdir -p docs/bug
mkdir -p docs/task
mkdir -p plans
mkdir -p .github/ISSUE_TEMPLATE
mkdir -p .github/workflows

# ---------- Move docs README ----------
if [ -f "docs_README.md" ]; then
  echo "📄 Moving docs_README.md → docs/README.md"
  mv docs_README.md docs/README.md
fi

# ---------- Placeholder files so empty folders are committed ----------
echo "📝 Adding .gitkeep placeholders..."
touch docs/learning/.gitkeep
touch docs/bug/.gitkeep
touch docs/task/.gitkeep

# ---------- GitHub Issue Templates ----------
echo "📋 Creating GitHub issue templates..."

cat > .github/ISSUE_TEMPLATE/bug_report.md << 'EOF'
---
name: 🐛 Bug Report
about: Something is broken
title: '[BUG] '
labels: bug
---

## What's wrong?

## Steps to reproduce
1.
2.
3.

## Expected behavior

## Actual behavior

## Environment
- Browser:
- OS:
- App version / commit:

## Related bug doc
- [ ] /docs/bug/NN_description.md created
EOF

cat > .github/ISSUE_TEMPLATE/feature_request.md << 'EOF'
---
name: ✨ Feature Request
about: Suggest a new feature
title: '[FEATURE] '
labels: enhancement
---

## What feature?

## Why does it matter?

## Proposed implementation

## Alternatives considered

## Should this go to FUTURE_SCOPE.md instead?
- [ ] Yes — add to V2 playbook
- [ ] No — V1 priority
EOF

cat > .github/ISSUE_TEMPLATE/task.md << 'EOF'
---
name: 📋 Task / Feature Build
about: A feature being actively worked on
title: '[TASK] '
labels: task
---

## Goal

## Linked task doc
- [ ] /docs/task/NN_feature.md created

## Phase / Day

## Acceptance criteria
- [ ]
- [ ]

## Dependencies
EOF

# ---------- LICENSE (MIT) ----------
if [ ! -f "LICENSE" ]; then
  echo "📜 Creating MIT License..."
  CURRENT_YEAR=$(date +%Y)
  cat > LICENSE << EOF
MIT License

Copyright (c) ${CURRENT_YEAR} Akshay Chavhan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF
fi

# ---------- Status ----------
echo ""
echo "✅ Buddies project structure ready!"
echo ""
echo "📂 Final structure:"
echo "    buddies/"
echo "    ├── README.md"
echo "    ├── PROMPT.md"
echo "    ├── FUTURE_SCOPE.md"
echo "    ├── LICENSE"
echo "    ├── .gitignore"
echo "    ├── package.json"
echo "    ├── app/                    (Next.js App Router)"
echo "    ├── prisma/                 (schema)"
echo "    ├── plans/                  (one note per commit)"
echo "    ├── docs/"
echo "    │   ├── README.md           (master index)"
echo "    │   ├── learning/"
echo "    │   ├── bug/"
echo "    │   └── task/"
echo "    └── .github/"
echo "        ├── ISSUE_TEMPLATE/"
echo "        └── workflows/"
echo ""
echo "🚀 Next steps:"
echo "    1. Install deps:           pnpm install"
echo "    2. Set up env vars:        cp .env.example .env.local   (and edit)"
echo "    3. Generate Prisma client: pnpm prisma:generate"
echo "    4. Run dev server:         pnpm dev"
echo ""
echo "Then visit http://localhost:3000 — and check /api/health for the JSON sanity check."
echo ""
