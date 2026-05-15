# Day 2 — Layouts, Templates, and Route Groups

> **Created:** 2026-05-15
> **Phase:** 1 — Foundations

---

## 🎯 What Are We Learning?

How the App Router maps your **folder tree** to URLs and to a **layout tree**, and how to use the three big tools it gives you:

1. **`layout.tsx`** — a shared shell that wraps every page under it; persists across navigation (state is *not* re-mounted).
2. **`template.tsx`** — like a layout but *does* re-mount on every navigation. We rarely need this; covered for awareness.
3. **Route groups** `(name)` — folders wrapped in parentheses that organize the layout tree **without** adding a URL segment.

By the end of this doc you should be able to:

- Draw the folder tree we're about to build (`(app)` shell with header + nav, `(auth)` shell centered) **on paper**, before any code lands.
- Predict the URL each `page.tsx` will resolve to.
- Explain why `(app)` and `(auth)` are in parentheses while `trips` is not.

We *use* all this starting in `Day_06` (create `(app)` + move home page), `Day_07` (add `(auth)`), and `Day_08` (header + `<Link>` nav inside `(app)/layout.tsx`).

---

## 🤔 Why Does This Matter?

In the Pages Router (or in any Vite + React app), a shared header was something you imported into every page manually. Forget the import in one page and you'd render the page without the chrome.

The App Router flips this: **layout = the chrome, page = the unique content inside.** You can't accidentally drop the chrome — the framework wraps every page under a layout file with that layout's JSX. Refactoring becomes safer; nesting becomes natural; persistent UI (a sidebar, a player bar, an open modal state) survives navigation **for free** because the layout doesn't unmount.

Then there's the "we have two app shells" problem. The auth pages (sign-in, sign-up, forgot-password) need a centered, no-header shell. The rest of the app needs a header + nav. Without route groups, you'd have to either (a) duplicate two parallel layouts or (b) do `if (pathname.startsWith("/sign-in")) { ... }` conditional rendering in the root layout — which would force the root layout to become a Client Component (needs `usePathname`) and defeat the RSC pitch.

Route groups solve this in 4 keystrokes per folder: rename `auth` → `(auth)`. Same URLs, different layouts.

---

## 🧠 How It Works (The Concept)

### The folder-to-URL mapping

```
app/
├── layout.tsx              ← Root layout — wraps EVERYTHING
├── page.tsx                ← /
├── about/
│   └── page.tsx            ← /about
└── trips/
    ├── layout.tsx          ← Trips layout — wraps every page under /trips
    ├── page.tsx            ← /trips
    └── [id]/
        └── page.tsx        ← /trips/:id
```

Three rules to internalize:

1. **A folder becomes a URL segment.** `app/trips/page.tsx` → `/trips`. `app/trips/[id]/page.tsx` → `/trips/123` (dynamic).
2. **`page.tsx` makes the segment a real, navigable URL.** A folder without `page.tsx` is invisible to the URL — useful for "container" folders.
3. **`layout.tsx` wraps everything below it in the folder tree.** It receives `children` and decides where to render them. Layouts compose: every page is wrapped by every layout above it.

### The layout tree (different from the URL tree)

For `/trips/123`, React effectively renders:

```tsx
<RootLayout>                       {/* app/layout.tsx */}
  <TripsLayout>                    {/* app/trips/layout.tsx */}
    <TripDetailPage params={...}/> {/* app/trips/[id]/page.tsx */}
  </TripsLayout>
</RootLayout>
```

Two things to notice:
- **Layouts nest.** Each `layout.tsx` is one level of the React tree.
- **Layouts persist across navigation within their subtree.** Navigating from `/trips/1` to `/trips/2` re-renders the page but keeps `TripsLayout` mounted — its state, scroll position, open menus all survive.

### Route groups — `(name)` folders

A folder named with parentheses, like `(app)` or `(auth)`, behaves like a regular folder in **every** way except one: **it doesn't add a URL segment.**

```
app/
├── layout.tsx
├── (app)/
│   ├── layout.tsx          ← wraps everything in (app)
│   ├── page.tsx            ← /         ← NOT /(app)
│   └── trips/
│       └── page.tsx        ← /trips    ← NOT /(app)/trips
└── (auth)/
    ├── layout.tsx          ← wraps everything in (auth)
    └── sign-in/
        └── page.tsx        ← /sign-in  ← NOT /(auth)/sign-in
```

The parentheses are a signal to the framework: *"group these for layout purposes, but pretend the folder isn't there when computing URLs."* That's the whole feature.

The payoff: `app/(app)/page.tsx` and `app/(auth)/sign-in/page.tsx` get **different layouts** even though both URLs (`/` and `/sign-in`) are siblings at the URL level.

### Layout vs. Template — when do we use each?

| | `layout.tsx` | `template.tsx` |
|---|---|---|
| Wraps children? | yes | yes |
| **Persists across navigation?** | **yes (the default we want 99% of the time)** | **no — re-mounts on every navigation** |
| Common use | header, nav, sidebar, persistent state | logging on every page view, animations that need a fresh mount |

For Buddies we'll use `layout.tsx` everywhere and probably never need `template.tsx`. Mentioned here so it's not a black box when you stumble across it in docs.

### What you can put in a layout

A `layout.tsx` is a **Server Component by default** (same rule as Day 4). It receives one prop:

```tsx
export default function MyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <header>...</header>
      <main>{children}</main>
    </div>
  );
}
```

- `children` is the page (or nested layout) that the framework will inject. **You must render it** or the page disappears.
- You can `await` data in a layout (since it's a Server Component). The trips layout could `await db.tripGroup.findMany()` once and reuse the result across all nested pages.
- A layout **doesn't** receive `params` or `searchParams` directly — those are page-level. Workaround: read them in the page and pass them down.

---

## 💻 Tiny Isolated Example

Two shells, three URLs, no conditionals:

```
app/
├── layout.tsx                     ← Root <html><body>
├── (app)/
│   ├── layout.tsx                 ← <header>Brand</header>{children}
│   ├── page.tsx                   ← URL: /
│   └── trips/
│       └── page.tsx               ← URL: /trips
└── (auth)/
    ├── layout.tsx                 ← <div className="centered">{children}</div>
    └── sign-in/
        └── page.tsx               ← URL: /sign-in
```

```tsx
// app/(app)/layout.tsx — Server Component, wraps / and /trips
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <header style={{ padding: 16, borderBottom: "1px solid #ccc" }}>
        Buddies
      </header>
      <main>{children}</main>
    </div>
  );
}
```

```tsx
// app/(auth)/layout.tsx — Server Component, wraps /sign-in
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      {children}
    </div>
  );
}
```

Open `/` or `/trips` → see the header. Open `/sign-in` → see a centered shell. Same browser, same `pnpm dev`, no `pathname` check anywhere in the code.

---

## 🚀 Applied to Buddies

> See: [Task 02 — App Shell](../task/02_app_shell.md)

Day 2's target folder layout (will be built across `Day_06`–`Day_08`):

```
app/
├── layout.tsx                              ← root <html><body>, unchanged from Day 1
├── (app)/
│   ├── layout.tsx                          ← header + <Link> nav  (Day_06 minimal; Day_08 adds header)
│   ├── page.tsx                            ← /            (moved from app/page.tsx in Day_06)
│   └── trips/
│       └── page.tsx                        ← /trips       (created in Day_08, 3 hardcoded trips)
├── (auth)/
│   ├── layout.tsx                          ← centered shell, no header  (Day_07)
│   └── sign-in/
│       └── page.tsx                        ← /sign-in     (Day_07 stub)
└── api/
    └── health/
        └── route.ts                        ← /api/health  (unchanged from Day 1)
```

Why the two groups?

| `(app)` group | `(auth)` group |
|---|---|
| `/`, `/trips`, later `/trips/:id`, `/settings` | `/sign-in`, later `/sign-up`, `/forgot-password` |
| Has the brand header + nav | No header — centered single card |
| Day 7 (auth) will require a logged-in user | Day 7 will require a *not*-logged-in user (signed-in users should redirect away) |

The split also previews **Day 7's auth gating**: each group will get its own gate logic in its layout. No `if (pathname...)` sprinkling.

---

## ⚠️ Gotchas & Beginner Mistakes

1. **Two `page.tsx` files resolving to the same URL = build error.** This is the *one* gotcha that forces our hand in `Day_06`. If `app/page.tsx` and `app/(app)/page.tsx` both exist, Next throws *"You cannot have two parallel pages that resolve to the same path"*. That's why `Day_06` does both things in one commit: create `(app)/layout.tsx` **and** `git mv app/page.tsx app/(app)/page.tsx`.

2. **A folder without `page.tsx` is not a URL.** `app/(app)/` doesn't expose `/(app)` — partly because of the route-group rule, but also because there's no `page.tsx` directly inside it. Even *without* the parens, `app/foo/` with no `page.tsx` is just a container.

3. **Layouts must render `{children}`.** Easy to forget after refactoring. If you remove `{children}` from a layout, the page disappears and the dev overlay says "page not found" — even though `page.tsx` is right there. Always render `children`.

4. **A layout doesn't get `params` / `searchParams`.** Only `page.tsx` does. If you need them in a layout, read them in the page and pass them via React context (Client) or props (rare). Most of the time, layouts shouldn't *care* about params anyway.

5. **Route groups don't change *anything* about the URL.** Reordering files into `(group)` folders is a refactor that the browser can't see. Useful: you can introduce a group later without breaking links.

6. **Multiple `layout.tsx` files in the same folder is illegal.** Each folder gets at most one layout. To compose shells, nest folders.

7. **`template.tsx` and `layout.tsx` in the same folder both apply.** If both exist, the template wraps `children` and the layout wraps the template. Rarely useful; mention it so it's not a surprise.

8. **The root `app/layout.tsx` is special.** It's the *only* layout that must render `<html>` and `<body>` tags. Nested layouts render just the chrome that goes *inside* `<body>`.

---

## 🧪 Quick Quiz

**1.** What URL does `app/(app)/trips/page.tsx` resolve to?

<details>
<summary>Show answer</summary>

`/trips`. Route groups (parentheses) don't add a URL segment, so the URL is just `/trips`, not `/(app)/trips`.
</details>

**2.** I want `/` and `/sign-in` to have *different* shells (headered vs centered). Without route groups, what's the cheapest way to do it? Why is the route-group approach better?

<details>
<summary>Show answer</summary>

Without groups: a conditional in the root layout like `pathname.startsWith("/sign-in") ? <Centered>{children}</Centered> : <Headered>{children}</Headered>`. That forces the root layout to become a Client Component (needs `usePathname`), which ships the whole layout to the browser as JS.

With groups: `app/(auth)/layout.tsx` and `app/(app)/layout.tsx` each describe *their* shell. The root layout stays a Server Component. No conditionals. No client bundle for the shell. This is the win.
</details>

**3.** Can a folder *both* be a route group `(foo)` *and* contain a `page.tsx`? E.g. does `app/(app)/page.tsx` make sense?

<details>
<summary>Show answer</summary>

Yes — that's exactly what `Day_06` does. `app/(app)/page.tsx` resolves to `/`. The route-group rule says "this folder doesn't add a URL segment"; it doesn't say "this folder can't have a page." So the `page.tsx` inside it owns whatever URL the *next non-group ancestor* would expose — in this case, `/`.
</details>

**4.** I have `app/layout.tsx`, `app/(app)/layout.tsx`, and `app/(app)/trips/layout.tsx`. How many layout components wrap `/trips`?

<details>
<summary>Show answer</summary>

**Three.** From outermost to innermost: root layout → `(app)` layout → `trips` layout → trips page. Every layout file in the path from root to the page applies.
</details>

**5.** What's the practical difference between `layout.tsx` and `template.tsx`?

<details>
<summary>Show answer</summary>

`layout.tsx` **persists** across navigations within its subtree — state, scroll, mounted side-effects survive when only the page changes. `template.tsx` **re-mounts** on every navigation — useful for animations that need a fresh enter/exit, or per-page-view logging. We use `layout.tsx` for everything in Buddies; `template.tsx` would be premature.
</details>

---

## 📌 Key Takeaways

- **Folder = URL segment.** `page.tsx` makes it real. `layout.tsx` wraps everything below.
- **Route groups `(name)`** organize layouts without changing URLs. Used for "two-shell" patterns like `(app)`/`(auth)`.
- **Layouts persist across navigation** within their subtree — that's a feature, not a default to be worked around.
- **Layouts are Server Components by default** and can `await` data; they receive `{ children }` and must render it.
- **`app/layout.tsx` is special** — it owns `<html>` and `<body>`; nested layouts only render inner chrome.
- **`template.tsx` exists** but is rarely the right tool. Reach for `layout.tsx` first.
- **The same URL can be reached through different layouts** by moving the page into a different route group — without changing the URL itself.

---

## 🔗 References

- [Next.js docs — Layouts and Templates](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts)
- [Next.js docs — Route Groups](https://nextjs.org/docs/app/building-your-application/routing/route-groups)
- [Next.js docs — Project Structure](https://nextjs.org/docs/app/getting-started/project-structure)
- Local: [Day 2 — Server vs Client Components](./day2_rsc_vs_client_components.md) — covers the underlying Server-Component rule that layouts inherit by default

---

## ➡️ What's Next?

- **`Day_06` (next commit)** — First code change of Day 2: create `app/(app)/layout.tsx` (minimal `<div>{children}</div>`) and `git mv app/page.tsx app/(app)/page.tsx`. The atomic move avoids the "two parallel pages at `/`" build error.
- **`Day_07`** — Add the `(auth)` group: `app/(auth)/layout.tsx` (centered) and `app/(auth)/sign-in/page.tsx` (stub). Two distinct shells from one URL tree.
- **`Day_08`** — Add `<header>` + `<Link>` navigation to `app/(app)/layout.tsx`, plus `app/(app)/trips/page.tsx` so the nav has a third destination.
- **`Day_09`** — Next learning doc: `loading.tsx` and `error.tsx` files.
