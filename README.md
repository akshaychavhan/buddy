# 🧳 Buddies

> Plan trips. Travel together. Remember everything.

A cross-platform mobile trip planner built around the idea that **the best trips happen with friends**. Group trips, shared expenses, and shared memories are first-class citizens.

[![Status](https://img.shields.io/badge/status-in%20development-yellow)]()
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

---

## 🌟 What Makes Buddies Different

- **Smart trip categorization** — Past, Active, Upcoming, and Drafts on your home screen with countdown to your next adventure
- **Invite buddies by email** — share a trip with friends in seconds
- **Place insights from the web** — every place auto-fetches a summary from Wikipedia, in your preferred language
- **Beautiful itinerary timeline** — see your whole trip day-by-day, from morning coffee to evening stays
- **Offline mode** — make any trip available offline; works seamlessly without data
- **Bill splitting that just works** — minimum-transaction settlement algorithm so no one overpays
- **Multi-language + dark mode** — designed for travelers everywhere

## 📱 Tech Stack

### Mobile
- React Native via [Expo](https://expo.dev/) (managed workflow)
- TypeScript (strict mode)
- [Expo Router](https://docs.expo.dev/router/introduction/) for file-based routing
- [NativeWind](https://www.nativewind.dev/) (Tailwind for RN)
- [Zustand](https://github.com/pmndrs/zustand) for client state
- [TanStack Query](https://tanstack.com/query) for server state + offline cache
- [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- [MMKV](https://github.com/mrousavy/react-native-mmkv) for local storage
- [i18next](https://www.i18next.com/) for internationalization

### Backend
- [Next.js 14+](https://nextjs.org/) (App Router) — API routes
- [Prisma](https://www.prisma.io/) ORM with [MongoDB](https://www.mongodb.com/)
- [Better Auth](https://better-auth.com/) for authentication
- [Cloudinary](https://cloudinary.com/) for image hosting
- [Resend](https://resend.com/) + [React Email](https://react.email/) for transactional emails

## 🗂 Project Structure

```
buddies/
├── apps/
│   ├── mobile/      # Expo React Native app
│   └── api/         # Next.js API + Prisma backend
├── docs/
│   ├── learning/    # Lessons learned along the way
│   ├── bug/         # Bug journal
│   └── task/        # Feature task docs
├── PROMPT.md        # The build & learning prompt for AI assistants
└── FUTURE_SCOPE.md  # V2 features playbook
```

## 🚀 Getting Started

> **Note:** This project is being built as a learning journey. The full setup process is documented in `/docs/learning/day1_setup.md`.

### Prerequisites

- Node.js 20+
- pnpm or npm
- Expo Go app on your phone (for development)
- MongoDB instance (Atlas free tier works)
- Cloudinary account (free tier)
- Resend account (free tier)

### Quick start

```bash
# Clone the repo
git clone https://github.com/<your-username>/buddies.git
cd buddies

# Mobile app
cd apps/mobile
npm install
npx expo start

# Backend (in another terminal)
cd apps/api
npm install
npx prisma generate
npm run dev
```

Detailed setup instructions live in `/docs/learning/day1_setup.md` and `/docs/learning/day1_installation.md`.

## 📚 The Learning Journey

This project is being built **publicly as a structured learning roadmap** — perfect for anyone wanting to learn React Native coming from a React/Next.js background. Every concept is documented in `/docs/learning/`, every bug encountered in `/docs/bug/`, and every feature in `/docs/task/`.

Browse the [docs README](./docs/README.md) for the full index.

## 🔮 Roadmap

### V1 (in progress)
- [x] Project scaffolding
- [ ] Trip CRUD with smart categorization
- [ ] Email-based buddy invitations
- [ ] Place insights from Wikipedia
- [ ] Photos, activities, expenses, bill splitting
- [ ] Itinerary timeline view
- [ ] Offline mode
- [ ] Local notifications + reminders
- [ ] Multi-language + dark mode

### V2 (future)
See [FUTURE_SCOPE.md](./FUTURE_SCOPE.md) for detailed plans:
- Quick-add expense via camera (OCR)
- Smart packing suggestions
- Receipts + documents vault
- Buddy network (long-lived travel friendships)
- Full RBAC for trip roles

## 🤝 Contributing

This is primarily a personal learning project, but suggestions and feedback are welcome — please open an issue.

## 📄 License

[MIT](./LICENSE) — see the LICENSE file for details.

## 👤 Author

Built by [Akshay Chavhan](https://github.com/<your-username>) — Full Stack Developer based in Pune, India.

---

⭐ If you find this learning journey useful, star the repo!
