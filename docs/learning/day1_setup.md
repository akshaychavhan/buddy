# Day 1 — Project Setup: Why Next.js (App Router)

> **Created:** 2026-04-30
> **Updated:** 2026-05-08 (retargeted from React Native / Expo to Next.js 14)
> **Phase:** 1 — Foundations

---

## 🎯 What Are We Learning?

What **Next.js** is, what the **App Router** gives us, and why we're using a single Next.js app for both the UI and the API of Buddies.

In one sentence: **Next.js is an opinionated framework on top of React that gives you file-based routing, server components, and a single deploy artifact for both your UI and your API — so you can ship a real production-grade web app without stitching together a separate frontend, backend, and routing layer.**

---

## 🤔 Why Does This Matter?

For a web app like Buddies, you have a few starting points:

| Path                          | What you write                              | What you ship                                          |
| ----------------------------- | ------------------------------------------- | ------------------------------------------------------ |
| **Vite + React SPA + a separate API** | A React app that fetches from an Express/Hono backend | Two deploys, two CORS configs, two CI pipelines.       |
| **Next.js App Router (us)**   | One project: pages, layouts, API routes     | **One** deploy. UI and API ship together.              |
| **Bare Node + EJS / handlebars** | Server-rendered HTML + per-route JS sprinkles | Painful to build a real SPA-like UX on top of.       |

For a **solo developer building a real product end-to-end**, the SPA + separate API path means you're managing two codebases just to log in a user. Next.js collapses that. Your `app/page.tsx` (a React component) and `app/api/health/route.ts` (an HTTP endpoint) live in the same project, share types, share the same dev server, and deploy as one unit.

The trade-off: Next.js is opinionated. You learn its file conventions (`page.tsx`, `layout.tsx`, `route.ts`, `loading.tsx`, `error.tsx`) and its mental model (server vs client components). For a real app shipping real features, that opinionation is a feature, not a bug.

---

## 🧠 How It Works (The Concept)

### Server Components by default — the most important mental shift

In a classic SPA you'd write a component, call `useEffect` to fetch data, set state, and re-render. The server sends an empty HTML shell; the browser does all the work.

In the App Router, **components are server components by default**. They run on the server, talk directly to your database, and ship only the resulting HTML (plus the islands of interactivity that need it) to the browser.

```
Request lands at the server
        │
        ▼
Server runs your page.tsx (a Server Component)
   - awaits db query directly
   - renders to HTML
        │
        ▼
HTML lands in the browser, painted immediately
        │
        ▼
Client Components ("use client") hydrate where they're needed
        │
        ▼
Server Actions are RPC calls disguised as functions —
the client calls them, the server executes them.
```

There is no `useEffect → fetch → setState` for initial data. There is no separate `/api/trips` endpoint to call from the client (unless you want one — for that, route handlers exist).

### File conventions you'll see all the time

```
app/
├── layout.tsx          # wraps every page in this segment (the <html> shell, etc.)
├── page.tsx            # the page itself, rendered at this URL
├── loading.tsx         # shown while page.tsx is awaiting data (streaming)
├── error.tsx           # shown when page.tsx throws (a client component)
├── not-found.tsx       # shown for 404s
└── api/
    └── health/
        └── route.ts    # an HTTP endpoint at /api/health
```

### Server Component vs Client Component

- **Default = Server Component.** Runs on the server. Can `await` directly. Cannot use `useState`, `useEffect`, or anything browser-only.
- **`"use client"` at the top of a file = Client Component.** Runs in the browser. Can use hooks, event handlers, `window`, etc. Cannot import server-only code (like `process.env.DATABASE_URL`).

You don't need every component to declare itself one or the other. The runtime treats `"use client"` as a boundary — anything imported into a client component is also bundled to the client.

### Server Actions — RPC as a function call

```tsx
// app/trips/actions.ts
"use server";

export async function createTrip(formData: FormData) {
  const title = formData.get("title");
  await db.trip.create({ data: { title } });
}
```

```tsx
// app/trips/new/page.tsx (server component)
import { createTrip } from "../actions";

export default function NewTripPage() {
  return (
    <form action={createTrip}>
      <input name="title" />
      <button type="submit">Create</button>
    </form>
  );
}
```

That's it. No `/api/trips` route, no `fetch`, no `useState`. The form posts → the server runs `createTrip` → the page revalidates.

---

## 🔄 App Router vs Pages Router

If you're coming from older Next.js (or have read older Next.js tutorials), you may know the **Pages Router** style: `pages/index.tsx`, `pages/api/foo.ts`, `getServerSideProps`. The App Router is the modern replacement.

| Concept             | Pages Router                               | App Router (us)                                       |
| ------------------- | ------------------------------------------ | ----------------------------------------------------- |
| Routes              | `pages/trips/[id].tsx`                     | `app/trips/[id]/page.tsx`                             |
| Data fetching       | `getServerSideProps`, `getStaticProps`     | `await` directly in a Server Component                |
| API routes          | `pages/api/foo.ts`                         | `app/api/foo/route.ts`                                |
| Layouts             | `_app.tsx` + `_document.tsx`               | Nested `layout.tsx` per segment                       |
| Loading state       | Manual                                     | `loading.tsx` file (server-streamed)                  |
| Error boundary      | Manual                                     | `error.tsx` file (must be a Client Component)         |
| Default rendering   | Client (with SSR helpers)                  | **Server** (with explicit client opt-in)              |

The App Router is the future. Both still work in Next.js 14, but everything new is built around App Router primitives (server components, server actions, streaming).

---

## 💻 Tiny Isolated Example

This is essentially what already lives in the repo after `Infra_02`:

```tsx
// app/page.tsx — a Server Component, runs on the server
export default function HomePage() {
  return (
    <main className="p-8">
      <h1 className="text-3xl">Buddies — Day 1</h1>
      <p>Try /api/health to see the same app serve a JSON endpoint.</p>
    </main>
  );
}
```

```ts
// app/api/health/route.ts — an HTTP endpoint at /api/health
export async function GET() {
  return Response.json({ ok: true, ts: Date.now() });
}
```

Three things to notice:

1. **No `useEffect`, no `fetch`** — `HomePage` is server-rendered. The HTML lands in the browser ready to go.
2. **`route.ts` is the API.** Same project, same TypeScript config, same package.json. UI and API ship as one app.
3. **Tailwind classes work everywhere.** No CSS-in-JS, no styled components — just utility classes resolved at build time.

---

## 🚀 Applied to Buddies

The Day 1 task doc applies this directly:
> See: [Task 01 — Project Scaffolding](../task/01_project_scaffolding.md)

The Next.js project is already scaffolded at the repo root (it landed in `Infra_02_Scaffold_root_nextjs` — read the matching plan file at `plans/Infra_02_Scaffold_root_nextjs.md` for a beginner-friendly walkthrough). Day 1's job is to **understand** the scaffold, run it, and verify both `localhost:3000` (the page) and `localhost:3000/api/health` (the API) respond. From this commit on, every feature lives inside the same `app/` tree.

---

## ⚠️ Gotchas & Beginner Mistakes

- **Forgetting `"use client"`.** If you try to use `useState` or `onClick` in a file that doesn't have `"use client"` at the top, you'll see an error like *"You're importing a component that needs useState. It only works in a Client Component"*. Add `"use client"` and move on.
- **Server-only code leaking to the client.** Importing `db` (your Prisma client) into a `"use client"` file silently bundles your database client into the browser. Use `import "server-only"` at the top of files that must never reach the browser to fail loudly instead.
- **Env vars without `NEXT_PUBLIC_`.** Anything in `.env.local` is server-only by default. To expose a value to client components, prefix it with `NEXT_PUBLIC_` (e.g. `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`). Without that prefix, `process.env.FOO` is `undefined` in the browser.
- **Hydration mismatch from `Date.now()` or `Math.random()` in a Server Component.** The server renders `Date.now()` at request time; the client tries to re-render and gets a different number → React complains. Move that logic to a Client Component or compute it in a `useEffect`.
- **Confusing `next.config.ts` with `next.config.mjs`.** Next.js 14 doesn't read `.ts` configs (that's Next 15). We use `next.config.mjs` — see `Infra_04` for the fix.

---

## 🧪 Quick Quiz

1. What does it mean that components are "server components by default" in the App Router?
2. When do you need to add `"use client"` to a file?
3. Where do API endpoints live in the App Router, and what file convention defines them?
4. What's a Server Action, and how is it different from a route handler?
5. Why does `process.env.DATABASE_URL` work in a Server Component but `process.env.DATABASE_URL` is `undefined` in a Client Component?

---

## 📌 Key Takeaways

- **Next.js App Router gives you UI and API in one project.** One deploy, one TypeScript config, one mental model.
- **Server Components by default.** Render data on the server, hydrate only the islands that need interactivity.
- **Server Actions are RPC** — write a server function, call it from a form, no HTTP boilerplate.
- **The runtime split matters.** Server Components, Client Components, Route Handlers, and Server Actions each have rules — get them wrong and you get fast, loud errors that point you at the fix.

---

## 🔗 References

- [Next.js — App Router docs](https://nextjs.org/docs/app)
- [Next.js — Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Next.js — Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Next.js — Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [App Router vs Pages Router migration guide](https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration)

---

## ➡️ What's Next?

Continue to [day1_installation.md](./day1_installation.md) to verify your machine is ready, then [Task 01 — Project Scaffolding](../task/01_project_scaffolding.md) to get the dev server running.
