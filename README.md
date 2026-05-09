# 🧳 Buddies

> Plan trips. Travel together. Remember everything.

A web-first trip planner built around the idea that **the best trips happen with friends**. Group trips, shared expenses, and shared memories are first-class citizens.

[![Status](https://img.shields.io/badge/status-in%20development-yellow)]()
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

---

## 🌟 What Makes Buddies Different

- **Smart trip categorization** — Past, Active, Upcoming, and Drafts on your home screen with countdown to your next adventure
- **Invite buddies by email** — share a trip with friends in seconds
- **Place insights from the web** — every place auto-fetches a summary from Wikipedia, in your preferred language
- **Beautiful itinerary timeline** — see your whole trip day-by-day, from morning coffee to evening stays
- **Bill splitting that just works** — minimum-transaction settlement algorithm so no one overpays
- **Multi-language + dark mode** — designed for travelers everywhere

## 🧱 Stack

A single Next.js 14 (App Router) app — UI and API live in the same project and ship as one deploy.

- [Next.js 14+](https://nextjs.org/) (App Router) — pages, layouts, and API route handlers
- TypeScript (strict mode)
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Prisma](https://www.prisma.io/) ORM with [MongoDB](https://www.mongodb.com/)
- [Better Auth](https://better-auth.com/) for authentication
- [Cloudinary](https://cloudinary.com/) for image hosting
- [Resend](https://resend.com/) + [React Email](https://react.email/) for transactional emails
- [Zustand](https://github.com/pmndrs/zustand) for client state (added when we hit the first real need)
- [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- [TanStack Query](https://tanstack.com/query) and [i18next](https://www.i18next.com/) — added when needed; deferred for now

## 🗂 Project Structure

```
buddies/
├── app/             # Next.js App Router — pages, layouts, route handlers
│   ├── api/         # Backend HTTP endpoints (e.g. /api/health)
│   ├── layout.tsx   # Root layout
│   └── page.tsx     # Landing page
├── components/      # Shared React components (added as features land)
├── lib/             # Server-only helpers, db client, etc. (added as features land)
├── prisma/          # Prisma schema + generated client
│   └── schema.prisma
├── public/          # Static assets
├── plans/           # One Markdown note per commit — beginner-friendly walkthroughs
├── docs/            # Learning notes, bug journal, task journal
├── PROMPT.md        # Build & learning prompt for AI assistants
└── FUTURE_SCOPE.md  # V2 features playbook
```

## 🚀 Getting Started

> **Note:** This project is being built as a learning journey. The full setup process is documented in [`docs/learning/day1_setup.md`](./docs/learning/day1_setup.md).

### Prerequisites

- Node.js 20+ (an `.nvmrc` is provided)
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`, or `corepack enable`)
- MongoDB instance (Atlas free tier works)
- Cloudinary account (free tier)
- Resend account (free tier)

### Quick start

```bash
# Clone the repo
git clone https://github.com/AkshayChavhan/buddy.git
cd buddy

# Set up environment variables
cp .env.example .env.local
# (then edit .env.local with your real DATABASE_URL, BETTER_AUTH_SECRET, etc.)

# Install and run
pnpm install
pnpm prisma:generate
pnpm dev
```

Open `http://localhost:3000` for the UI and `http://localhost:3000/api/health` for a JSON sanity check — proof the UI and API ship from the same app.

Detailed setup walkthroughs live in [`docs/learning/day1_setup.md`](./docs/learning/day1_setup.md) and [`docs/learning/day1_installation.md`](./docs/learning/day1_installation.md).

## 📚 The Learning Journey

This project is being built **publicly as a structured learning roadmap** — perfect for anyone wanting to learn shipping a production-grade Next.js app end-to-end. Every concept is documented in `/docs/learning/`, every bug encountered in `/docs/bug/`, and every feature in `/docs/task/`. **Every commit also ships with a beginner-friendly walkthrough in `/plans/`** — see the per-commit notes for the why and how behind each change.

Browse the [docs README](./docs/README.md) for the full index.

## 🔮 Roadmap

### V1 (in progress)
- [x] Project scaffolding
- [x] Single-app Next.js setup with CI
- [ ] Trip CRUD with smart categorization
- [ ] Email-based buddy invitations
- [ ] Place insights from Wikipedia
- [ ] Photos, activities, expenses, bill splitting
- [ ] Itinerary timeline view
- [ ] Multi-language + dark mode

### V2 (future)
See [FUTURE_SCOPE.md](./FUTURE_SCOPE.md) for detailed plans:
- Quick-add expense via camera (OCR)
- Smart packing suggestions
- Receipts + documents vault
- Buddy network (long-lived travel friendships)
- Full RBAC for trip roles
- PWA + offline support, web push notifications

## 🤝 Contributing

This is primarily a personal learning project, but suggestions and feedback are welcome — please open an issue or read [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## 📄 License

[MIT](./LICENSE) — see the LICENSE file for details.

## 👤 Author

Built by [Akshay Chavhan](https://github.com/AkshayChavhan) — Full Stack Developer based in Pune, India.

---

⭐ If you find this learning journey useful, star the repo!
