# Day 2 — Server Components vs Client Components: The Boundary Rule

> **Created:** 2026-05-14
> **Phase:** 1 — Foundations

---

## 🎯 What Are We Learning?

The single most important rule of the App Router:

> **Every component is a Server Component by default. To turn one into a Client Component, you add the magic string `"use client"` at the very top of the file.**

This doc covers:

1. What "Server Component" actually means (it's *not* "runs on a Node server somewhere").
2. What `"use client"` does, and where the boundary literally lives.
3. The rules for what can cross the boundary (props yes, functions no).
4. The four signals that tell you "this needs to be a Client Component."
5. The classic beginner mistakes — every Next.js dev hits these at least once.

We'll *use* this rule starting in `Day_07` (sign-in stub), `Day_11` (`error.tsx`), and `Day_12` (theme-toggle). Reading this first means those commits will feel obvious instead of magic.

---

## 🤔 Why Does This Matter?

If you came from the Pages Router or from a Vite + React app, every component you wrote was a **Client Component** — even if you didn't know to call it that. The browser downloaded JavaScript, React executed it, and the DOM appeared.

The App Router flips the default. Now most of your components run on the server, render to HTML, and the browser never downloads their JS at all. That's how Next.js makes "static-looking" pages fast.

But the moment you need `useState`, `useEffect`, an `onClick` handler, `localStorage`, or anything `window.*` — you've stepped outside what the server can do. You need a Client Component. The question of "where does the boundary go?" is the single design decision you'll make most often in this codebase.

Get the boundary right and Buddies stays fast and simple. Get it wrong and you'll either ship megabytes of unnecessary JS or hit cryptic errors like *"useState is not a function"* on the server.

---

## 🧠 How It Works (The Concept)

### Server Components (the default)

A Server Component:

- Runs **once on the server** (during request handling, or at build time for static pages).
- Returns JSX that Next.js serializes into HTML.
- Can `await` database calls, read files, use `process.env` secrets, import server-only libraries.
- **Cannot** use `useState`, `useEffect`, `onClick`, `onChange`, or anything that reacts to user input.
- Ships **zero** JavaScript to the browser. The browser sees the resulting HTML, never the component's source.

Day 1's `app/page.tsx` is a Server Component. Notice it has no `"use client"` at the top — that's all it takes.

### Client Components (opt-in)

A Client Component:

- Starts with the string literal `"use client"` on the **very first line** of the file (only blank lines or comments allowed above).
- Runs both on the server (for the initial HTML, called *server-side rendering*) **and** in the browser (for interactivity, called *hydration*).
- Can use `useState`, `useEffect`, event handlers, browser APIs.
- Ships its JS to the browser as part of a bundle.
- **Cannot** be `async`. **Cannot** import server-only libraries. **Cannot** read `process.env` secrets directly.

### The boundary is *the file*, not the component

This is the part that confuses everyone. The `"use client"` directive applies to **the whole file** and **everything it imports** that doesn't itself have the directive. The boundary is established the moment you write `"use client"` at the top.

```
app/(app)/layout.tsx       ← Server Component (no directive)
   └─ imports <ThemeToggle> from components/theme-toggle.tsx
                          ↑
                  THIS file has "use client" at top
                  → ThemeToggle is a Client Component
                  → It can have onClick
                  → Its JS ships to the browser
```

Critically, **a Server Component can render a Client Component as a child** — that's how the "islands" pattern works. The layout stays on the server; the interactive bits become islands of JS in an HTML ocean.

The reverse is restricted: a Client Component can render a Server Component **only if it's passed in as a prop** (typically as `children`). It cannot `import` a Server Component directly.

### What can cross the boundary?

When a Server Component renders a Client Component, it passes props. Those props are **serialized** (sent as JSON-ish data from server to client). Therefore:

| Prop type | Can cross? |
|---|---|
| Strings, numbers, booleans, `null`, `undefined` | ✅ |
| Plain objects, arrays of the above | ✅ |
| `Date` objects | ✅ (auto-converted) |
| React elements (other JSX) | ✅ (this is how `children` works) |
| **Functions** | ❌ (cannot serialize a closure) |
| Class instances, `Map`, `Set` | ❌ |

The function rule is the one beginners hit constantly. If you want to pass `onClick={handleClick}` from a Server Component to a Client Component, you can't — the function would need to be defined in the *Client* Component (or be a Server Action, which is a different feature for Day 4).

---

## 💻 Tiny Isolated Example

The smallest possible illustration of all the rules above:

```tsx
// app/page.tsx — Server Component
//   No "use client" directive
//   Runs on the server, renders to HTML
//   Imports a Client Component child

import { Counter } from "./counter";

export default function HomePage() {
  return (
    <main>
      <h1>Hello from the server</h1>
      <p>The heading above is HTML. The counter below is JS.</p>
      <Counter initial={0} />
    </main>
  );
}
```

```tsx
// app/counter.tsx — Client Component
//   "use client" on line 1
//   Can use useState, onClick, etc.
//   Receives `initial` (a number) as a prop — that's serializable, so it crosses the boundary cleanly

"use client";

import { useState } from "react";

export function Counter({ initial }: { initial: number }) {
  const [count, setCount] = useState(initial);
  return (
    <button onClick={() => setCount((c) => c + 1)}>
      Clicked {count} times
    </button>
  );
}
```

Two files. The first ships only HTML. The second ships ~1 KB of JS (after gzip) for `useState` + the click handler. Open DevTools → Network and you can see the split.

---

## 🚀 Applied to Buddies

> See: [Task 02 — App Shell](../task/02_app_shell.md)

Day 2's Client-Component touchpoints:

| File | Type | Why |
|---|---|---|
| `app/(app)/layout.tsx` | Server | Pure structure, no interactivity |
| `app/(auth)/layout.tsx` | Server | Same |
| `app/(app)/page.tsx` | Server | Static landing copy |
| `app/(app)/trips/page.tsx` | Server | Renders a hardcoded list; later will `await db.trip.findMany()` |
| `app/(auth)/sign-in/page.tsx` | Server (Day 2 stub); becomes Client on Day 7 | Form state needs `useState` |
| `app/loading.tsx` | Server | Static skeleton |
| `app/error.tsx` | **Client (required)** | Next.js mandates `"use client"` so the error boundary can attach in the browser |
| `components/theme-toggle.tsx` | **Client** | Button has `onClick`; later reads/writes `localStorage` |

Two Client Components total in Day 2 — `error.tsx` and `theme-toggle.tsx`. Everything else stays on the server. That ratio (lots of Server, few Client islands) is the App Router pitch in one column.

---

## ⚠️ Gotchas & Beginner Mistakes

1. **The directive must be the *first* line.** Comments and blank lines above it are fine, but a single `import` before `"use client"` makes the directive a no-op and you'll get cryptic errors. Always:

   ```tsx
   "use client";

   import { useState } from "react";   // imports go AFTER the directive
   ```

2. **`"use client"` ≠ `"use server"`.** They look symmetric but they're not. `"use server"` marks a function as a **Server Action** (Day 4) — a way to send form data from the browser to the server. It's not the inverse of `"use client"`. Mixing them up is the #1 first-day Next.js confusion.

3. **You can't `async` a Client Component.** Server Components can be `async function HomePage()` and `await` things. Client Components can't — React hooks like `useState` don't work in async functions. If you find yourself needing both `async` and `useState`, the answer is usually: fetch on the server, pass the result as a prop.

4. **Don't sprinkle `"use client"` everywhere just to be safe.** It's the *opposite* of safe — it ships more JS, slows the page, and makes the boundary harder to reason about. The rule is: keep `"use client"` as deep in the tree as possible (the small interactive leaf), not at the top (the whole page).

5. **`onClick` can't be passed from a Server Component.** This will fail:

   ```tsx
   // Server Component
   return <ClientButton onClick={() => console.log("nope")} />;
   //                            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
   //                            Functions can't cross the boundary
   ```

   Fix: define the handler *inside* the Client Component, or use a Server Action for the form-submit case.

6. **`error.tsx` MUST start with `"use client"`.** The error boundary uses React's `ErrorBoundary` machinery, which is browser-only. Next.js will refuse to build otherwise. (We'll hit this in `Day_11`.)

7. **`localStorage`, `window`, `document` — all browser-only.** Touching them from a Server Component throws. If you need them, you need `"use client"`. If you also need to *avoid* hydration mismatch (server renders one thing, client renders another), wrap the read in `useEffect` so it only happens after hydration.

---

## 🧪 Quick Quiz

Try to answer before opening the `<details>` blocks.

**1.** A file has no `"use client"` at the top, but it uses `useState`. What happens at build time?

<details>
<summary>Show answer</summary>

Build fails with an error like *"You're importing a component that needs `useState`. It only works in a Client Component but none of its parents are marked with `"use client"`."* Next.js refuses to compile — `useState` simply doesn't exist on the server side of the rendering pipeline.
</details>

**2.** Can a Server Component pass an `onClick` handler as a prop to a Client Component?

<details>
<summary>Show answer</summary>

No. Functions can't be serialized across the server/client boundary. The handler has to be defined *inside* the Client Component, or — for form submissions — defined as a Server Action (a special function marked with `"use server"`, covered in Day 4).
</details>

**3.** A Client Component imports a third file with no `"use client"` directive. Does that third file become a Client Component too?

<details>
<summary>Show answer</summary>

Yes. Once a file is in the client bundle, everything it imports goes into the client bundle with it (unless that import is itself a *Server Component passed as `children`*, which is a different pattern). Practically: anything reachable from a `"use client"` file ships to the browser.
</details>

**4.** What's the safest mental model: "Server by default, opt into Client" or "Client by default, opt into Server"?

<details>
<summary>Show answer</summary>

**Server by default, opt into Client.** That matches what the App Router actually does: no directive = Server Component. The opt-in is the explicit `"use client"`. Keeping this mental model means you naturally minimize the client bundle.
</details>

**5.** Where in a component tree should `"use client"` go: at the top of the page, or as deep as possible?

<details>
<summary>Show answer</summary>

**As deep as possible.** If only a small button needs interactivity, mark just the button as a Client Component — not the whole page. Server Components compose around Client Component "islands"; the island should be as small as the interactive surface requires.
</details>

---

## 📌 Key Takeaways

- **Default = Server**. No directive = Server Component. Renders to HTML, ships zero JS.
- **`"use client"` on line 1** turns the whole file (and everything it imports) into a Client Component.
- **Server → Client** can pass serializable props (strings, numbers, JSX `children`), but **never functions**.
- **Server Components can render Client Components as children.** This is the islands pattern.
- **Client Components can render Server Components only via `children` props**, not direct imports.
- **`error.tsx` is always a Client Component.** Required by Next.js.
- **Keep `"use client"` as deep in the tree as possible** to minimize the client bundle.
- **`"use client"` ≠ `"use server"`.** The latter marks Server Actions, a separate feature.

---

## 🔗 References

- [Next.js docs — Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Next.js docs — Client Components](https://nextjs.org/docs/app/building-your-application/rendering/client-components)
- [Next.js docs — Composition Patterns](https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns)
- [React docs — Server Components RFC](https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md)
- Local: [Day 1 — First Page Walkthrough](./day1_first_page.md) — where Server Components first appeared

---

## ➡️ What's Next?

- **`Day_05` (next commit)** — Learning doc: nested layouts + route groups `(app)` / `(auth)`. Still no app code; we're loading concepts in order.
- **`Day_06`** — First code commit of Day 2: create `app/(app)/layout.tsx` and move `app/page.tsx` into the `(app)` group.
- **`Day_11`** — First Client Component we'll ship: `app/error.tsx`. The rule from this doc (`"use client"` required for `error.tsx`) is the reason it's a Client Component.
- **`Day_12`** — Second Client Component: `components/theme-toggle.tsx`. Renders inside the Server-Component layout — the islands pattern in action.
