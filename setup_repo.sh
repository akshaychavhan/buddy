#!/bin/bash
# ==========================================================
# Buddies — Repository Setup Script
# ==========================================================
# Run this AFTER:
#   1. Creating the empty repo on github.com (with README + .gitignore + LICENSE)
#   2. Cloning it locally
#   3. Saving these 5 files in the cloned folder:
#      - PROMPT.md
#      - FUTURE_SCOPE.md
#      - README.md          (overwrite the auto-generated one)
#      - .gitignore         (overwrite the auto-generated one)
#      - docs_README.md     (will be moved to docs/README.md)
# ==========================================================

set -e  # exit on error

echo "🧳 Setting up Buddies project structure..."

# ---------- Folder Structure ----------
echo "📁 Creating folder structure..."
mkdir -p apps/mobile
mkdir -p apps/api
mkdir -p docs/learning
mkdir -p docs/bug
mkdir -p docs/task
mkdir -p .github/ISSUE_TEMPLATE
mkdir -p .github/workflows

# ---------- Move docs README ----------
if [ -f "docs_README.md" ]; then
  echo "📄 Moving docs_README.md → docs/README.md"
  mv docs_README.md docs/README.md
fi

# ---------- Placeholder files so empty folders are committed ----------
echo "📝 Adding .gitkeep placeholders..."
touch apps/mobile/.gitkeep
touch apps/api/.gitkeep
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
- Device:
- OS:
- App version:

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

# ---------- GitHub Actions: basic CI (placeholder) ----------
echo "⚙️  Creating GitHub Actions workflow stub..."
cat > .github/workflows/ci.yml << 'EOF'
# Buddies — Continuous Integration
# This workflow runs on every push and pull request.
# It will be expanded as the project grows (typecheck, lint, test).

name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  placeholder:
    name: Placeholder
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Project structure check
        run: |
          echo "✅ Repo structure check passed"
          ls -la
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
echo "✅ Buddies project structure created!"
echo ""
echo "📂 Final structure:"
echo "    buddies/"
echo "    ├── README.md"
echo "    ├── PROMPT.md"
echo "    ├── FUTURE_SCOPE.md"
echo "    ├── LICENSE"
echo "    ├── .gitignore"
echo "    ├── apps/"
echo "    │   ├── mobile/      (Expo app — Day 1)"
echo "    │   └── api/         (Next.js API — Day 6)"
echo "    ├── docs/"
echo "    │   ├── README.md    (master index)"
echo "    │   ├── learning/"
echo "    │   ├── bug/"
echo "    │   └── task/"
echo "    └── .github/"
echo "        ├── ISSUE_TEMPLATE/"
echo "        └── workflows/"
echo ""
echo "🚀 Next steps:"
echo "    1. Review the structure: ls -la"
echo "    2. Stage all files:      git add ."
echo "    3. Commit:               git commit -m 'chore: initial project structure and documentation'"
echo "    4. Push to GitHub:       git push origin main"
echo ""
echo "Then in Cursor, open the buddies folder and send Claude:"
echo '    "Read PROMPT.md and FUTURE_SCOPE.md. Then begin: Day 1, go."'
echo ""
