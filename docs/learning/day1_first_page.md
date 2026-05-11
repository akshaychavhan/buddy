# Day 1 — First Page Walkthrough: `app/page.tsx` + `app/api/health/route.ts`

> **Created:** 2026-05-01
> **Phase:** 1 — Foundations

---

## 🎯 What Are We Learning?

A focused look at the **two tiny files** that prove Day 1 is real:

1. `app/page.tsx` — a Server Component that renders the home page HTML
2. `app/api/health/route.ts` — a route handler that returns JSON at `/api/health`

Together they're 12 lines of code, and together they demonstrate **the entire pitch of the App Router**: one project, one TypeScript config, one dev server — yet the browser gets HTML for `/` and JSON for `/api/health`. No CORS, no separate API server, no client-side fetch on initial load.

If you understand these two files cold, you understand 80% of how every page in Buddies will be built. Day 2 onward is just composing more of the same.

---

## 🤔 Why Does This Matter?

Most React tutorials show you `useState`, `useEffect`, and a separate Express API in the same breath — three different mental models stacked on top of each other. The App Router collapses that.

What we just observed (when `pnpm dev` was running):

| You typed | Server did | Browser got |
| --- | --- | --- |
| `http://localhost:3000` | Ran `app/page.tsx` on the server, awaited nothing, rendered to HTML | Pre-rendered HTML — no JS needed to see the heading |
| `curl http://localhost:3000/api/health` | Ran the `GET` function in `route.ts` | `application/json` response |

**Same dev server. Same TypeScript config. Same `pnpm dev` process.** That's the thing to internalize. Every "should this be the frontend or the backend?" question you used to ask is now "should this be a Server Component or a Route Handler?" — and the answer is usually the first because Server Actions cover most of what Route Handlers used to do.

---

## 🧠 How It Works (Line by Line)

### `app/page.tsx` — the home page

```tsx
export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-6 px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">
        Buddies — Day 1
      </h1>
      <p className="text-lg text-neutral-600 dark:text-neutral-400">
        Plan trips. Travel together. Remember everything.
      </p>
      <p className="text-sm text-neutral-500">
        The single Next.js app is alive. Try{" "}
        <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs dark:bg-neutral-800">
          /api/health
        </code>{" "}
        to see the same app serve a JSON endpoint.
      </p>
    </main>
  );
}
```

Things worth pausing on:

- **`export default function HomePage()`** — Next.js looks for the default export. The function name (`HomePage`) is for *your* debugger; Next.js doesn't care what you call it.
- **No `"use client"` directive at the top** → this is a **Server Component**. It runs on the server. The browser never sees this function — it only sees the HTML it produced.
- **No `useState`, no `useEffect`, no event handlers.** Server Components can't have any of those — they don't run in the browser. If you need them, you put `"use client"` at the top and the file becomes a Client Component (Day 2).
- **The path that produced the URL `/`** is literally `app/page.tsx`. The folder structure IS the routing config. If you wanted `/trips`, you'd create `app/trips/page.tsx`. No `react-router`, no manual route registration.
- **`className="dark:bg-neutral-800"`** — Tailwind's dark mode variants are already in place. When we add a theme toggle on Day 3, these will just light up.

### `app/api/health/route.ts` — the route handler

```ts
export async function GET() {
  return Response.json({ ok: true, ts: Date.now() });
}
```

Three lines. Each one is doing work:

- **`export async function GET()`** — the function name **MUST** be an HTTP verb (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`, `HEAD`). Anything else is ignored. We only exported `GET`, so `POST /api/health` would 405.
- **The file's path determines the URL.** `app/api/health/route.ts` → `/api/health`. The folder name `health` is the URL segment. If we renamed the folder to `pulse`, the URL becomes `/api/pulse` — no config to update.
- **The filename MUST be `route.ts`.** Not `handler.ts`, not `api.ts`, not `health.ts`. Next.js looks specifically for `route.ts` (or `route.js`).
- **`Response.json({...})`** is the standard Web API — same `Response` you'd use in a Service Worker, an Edge function on Cloudflare Workers, or Deno. Next.js didn't invent it. It's `new Response(JSON.stringify(data), { headers: { "content-type": "application/json" } })` with less ceremony.
- **`Date.now()` runs on the server** — every request gets a fresh timestamp. If you `curl` twice in quick succession, you'll see two different `ts` values.

---

## 🔄 Server Component vs Client Component (Quick Anchor)

Day 1 only uses Server Components. But the distinction is worth previewing because Day 2 will introduce the first Client Component.

| Concept                | Server Component (default)              | Client Component (`"use client"`)        |
| ---------------------- | --------------------------------------- | ---------------------------------------- |
| Where it runs          | Server                                  | Browser                                  |
| Initial HTML           | Yes — rendered on server, sent as HTML  | Sent as JS, hydrated in browser          |
| `useState`/`useEffect` | ❌ Forbidden                            | ✅ Required for state/effects             |
| `await db.findMany()`  | ✅ Direct DB access fine                | ❌ No (use Server Action or fetch)        |
| `onClick`              | ❌ Can't attach event handlers          | ✅ Yes                                    |
| `process.env.DB_URL`   | ✅ Server-only env vars OK              | ❌ Would leak to browser                  |
| Import in client comp  | ⚠️ Goes via "server boundary"          | ✅ Imports anything                       |

**Rule of thumb for now:** start every component as a Server Component (no directive). Only add `"use client"` when you need state, an effect, or an event handler.

---

## 💻 Tiny Isolated Example

The two files we just walked through ARE the tiny example. Both fit on one screen, and together they show the full UI + API split. There's nothing more to demo until Day 2 introduces nested routes.

---

## ⚠️ Gotchas & Beginner Mistakes

- **`page.tsx` must be the default export.** `export function HomePage()` (no `default`) → Next.js renders an empty page silently. The error message ("The default export is not a React Component in page") only shows up if you typo'd the name.
- **`route.ts` filename is hardcoded.** A common newbie mistake: creating `app/api/health/index.ts` because every other framework calls it `index`. Won't work.
- **Folder names are URL segments — including bad ones.** `app/api/my route/route.ts` is a folder with a space; that becomes URL `/api/my%20route`. Folder hygiene matters.
- **`Response.json()` is not the same as `NextResponse.json()`.** Both work in route handlers. `Response.json()` is the Web standard (preferred for portability). `NextResponse` adds Next.js-specific helpers (cookies, redirects) — use it when you need those.
- **No `"use client"` does NOT mean "use server".** Server Components are the default; `"use server"` is a different thing entirely (it marks a Server Action, which is a function the client can call as if it were local). Don't confuse the two — Day 4 will dig into Server Actions properly.
- **Editing `page.tsx` while `pnpm dev` runs:** Fast Refresh updates the browser within ~200ms. If the page doesn't update, you probably edited a Server Component in a way that requires a full reload (rare) — just refresh manually.

---

## 🧪 Quick Quiz

1. What makes `app/page.tsx` a Server Component? (Hint: it's the absence of one thing.)
2. If I created `app/trips/[id]/page.tsx`, what URL would render it?
3. Why is the file at `app/api/health/route.ts` and not `app/api/health.ts`?
4. In `route.ts`, what would happen if I renamed `GET` to `Get`?
5. Could `app/page.tsx` import `"@/lib/db"` and call `await db.trip.findMany()` directly inside the component? Why or why not?

(Answers below — try them first.)

<details>
<summary>Answers</summary>

1. The **absence of `"use client"` at the top of the file.** Server Components are the default; you opt *out* into client-side behavior, not in.
2. **`/trips/<some-id>`** — the `[id]` folder is a dynamic segment. Inside the page, `params.id` would give you the value.
3. **The filename is hardcoded.** Next.js specifically looks for `route.ts` (or `route.js`) inside a folder. The folder name (`health`) becomes the URL segment; the filename tells Next.js "this folder is a route handler, not a page."
4. **405 Method Not Allowed.** Next.js matches exported function names *exactly* against HTTP verbs. `Get` doesn't match `GET`, so the handler is never called.
5. **Yes.** Server Components run on the server, so they can `await` database calls directly. No `getServerSideProps`, no `useEffect`. This is the App Router's superpower — see [day1_setup.md](./day1_setup.md) for the longer pitch.

</details>

---

## 📌 Key Takeaways

- **One Next.js project = UI + API.** `app/page.tsx` ships HTML; `app/api/*/route.ts` ships JSON. Same dev server, same tsconfig, same deploy.
- **Server Components are the default.** No directive = runs on the server. Add `"use client"` only when you need state, effects, or events.
- **The filesystem IS the routing config.** Folder names = URL segments. `page.tsx` = a page. `route.ts` = an HTTP endpoint. `layout.tsx` = a wrapper.
- **The verification matters.** Day 1 didn't end when the docs were written — it ended when `pnpm dev` actually started and `curl /api/health` actually returned JSON. Real software, real artifacts.

---

## 🔗 References

- [Day 1 — Project Setup: Why Next.js (App Router)](./day1_setup.md) — the bigger conceptual pitch
- [Day 1 — Installation: Tooling Checklist](./day1_installation.md) — Node, pnpm, env vars
- [Task 01 — Project Scaffolding](../task/01_project_scaffolding.md) — the file-by-file tour
- [Bug 01 — pnpm/Node version mismatch](../bug/01_pnpm_node_version_mismatch.md) — what blocked us, what fixed it
- [Next.js — Route Handlers (official)](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Next.js — Server and Client Components (official)](https://nextjs.org/docs/app/building-your-application/rendering/server-components)

---

## ➡️ What's Next?

**Day 2 — App Router & RSC Mental Model.** We'll go beyond the home page:
- `layout.tsx` nesting (header/footer that wraps multiple pages)
- `loading.tsx` for streaming + skeletons
- `error.tsx` boundaries
- The first **Client Component** ("use client") — probably a simple counter to feel the boundary
- Nested routes — `app/trips/page.tsx` + `app/trips/[id]/page.tsx`
- `<Link>` for client-side navigation between routes

After Day 2, you'll have the full App Router toolkit. Day 3 builds the design system on top.
