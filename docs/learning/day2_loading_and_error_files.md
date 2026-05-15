# Day 2 — `loading.tsx` and `error.tsx`: Free Boundaries Per Segment

> **Created:** 2026-05-15
> **Phase:** 1 — Foundations

---

## 🎯 What Are We Learning?

Two more file conventions the App Router gives you, both of which would have required hand-rolled React in the Pages Router:

1. **`loading.tsx`** — drop a file into any segment and Next.js wraps that segment's `page.tsx` in a `<Suspense>` boundary. While the page is loading (or *streaming*), the loading file's UI shows. Zero `<Suspense>` boilerplate from you.
2. **`error.tsx`** — drop a file into any segment and Next.js wraps that segment's tree in a React error boundary. If anything below it throws, the error file's UI shows instead of a crashed page. Must start with `"use client"` (boundary attaches in the browser).

By the end of this doc you should be able to:

- Explain why these are "free" — what the framework is doing under the hood that you don't have to write.
- Predict which segment's `loading.tsx` / `error.tsx` will catch a given event.
- Know the rule that `error.tsx` requires `"use client"` and *why* (it's not arbitrary).
- Use `reset()` to retry an error boundary.
- Trigger an error deliberately to see the boundary work — the `?boom=1` trick we'll use in `Day_11`.

We *use* this rule starting in `Day_10` (root `loading.tsx`) and `Day_11` (root `error.tsx` + a `/trips?boom=1` trigger).

---

## 🤔 Why Does This Matter?

In a Pages Router app, "show a spinner while data loads" meant:
1. Add a `useState<boolean>(true)` for `isLoading`.
2. Manage it inside `useEffect`.
3. Render a spinner conditionally.
4. Worry about flicker when navigating away mid-fetch.

"Catch a render error" meant:
1. Wrap each route in a `<ErrorBoundary>` from `react-error-boundary` or hand-roll one.
2. Track the error in state.
3. Provide a "try again" mechanism.
4. Forget on one route, ship a broken-looking page.

The App Router promotes both patterns to **file conventions**. Drop a file in the right folder, get the behavior. The framework instantiates the `<Suspense>` / `<ErrorBoundary>` for you. Forgetting is harder; the patterns are uniform; the JS cost is small (only the error boundary ships JS).

This pays off most when you have **streamed** server data. A page can `await` a slow query, and during that await the `loading.tsx` skeleton renders *before* the page resolves — the user sees something immediately, the slow content streams in when ready. That's a free progressive-rendering win.

---

## 🧠 How It Works (The Concept)

### Where these files live

Both files are **per-segment**. Drop one into any folder under `app/` and it applies to that segment and everything below.

```
app/
├── loading.tsx           ← root-level: catches loading for EVERY page
├── error.tsx             ← root-level: catches errors for EVERY page
├── (app)/
│   ├── trips/
│   │   ├── loading.tsx   ← only catches loading for /trips and its children
│   │   ├── error.tsx     ← only catches errors for /trips and its children
│   │   └── page.tsx
```

Nesting rule: the **closest ancestor** wins. If `app/(app)/trips/error.tsx` exists and `/trips` throws, the trips-segment error file handles it — not the root one. This is the standard React `<ErrorBoundary>` propagation rule, applied automatically by the file system.

### What `loading.tsx` does

```tsx
// app/loading.tsx — Server Component is fine; no interactivity needed.
export default function Loading() {
  return <div className="animate-pulse">Loading...</div>;
}
```

Mechanically: Next.js wraps `page.tsx` (and any nested layouts below `loading.tsx`'s level) in `<Suspense fallback={<Loading />}>`. While the page is suspending — e.g. it has an `await` in a Server Component — the fallback renders. When the page resolves, the real content **streams** in, replacing the fallback.

Three things to internalize:
- **`loading.tsx` is a Server Component by default.** No `"use client"` needed (unless your skeleton uses `useState`, which is rare).
- **It applies to navigation, not just initial load.** Click a `<Link>` to `/trips`, and while `/trips` resolves its data, the trips-segment `loading.tsx` shows.
- **Layouts above `loading.tsx` do *not* re-render.** Only the segment below the boundary is suspended. That's why `loading.tsx` *under* `(app)/` would keep the header visible while only the trips content shows the skeleton.

### What `error.tsx` does

```tsx
// app/error.tsx — MUST start with "use client".
"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="p-6">
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

Mechanically: Next.js wraps the segment in a React error boundary. If `page.tsx` or anything below it throws during render (server *or* client), `<ErrorPage error={err} reset={fn} />` renders instead.

Two props are passed:
- **`error`** — the actual `Error` object. In production, the `message` is sanitized to "An error occurred"; the original is logged server-side. In dev, you get the real message + stack.
- **`reset`** — a function that re-attempts to render the segment. Click "Try again" → React re-renders the children. If the cause was transient (a network blip), the page recovers.

### Why `error.tsx` MUST be a Client Component

The React `<ErrorBoundary>` machinery is browser-side. Server Components can't be wrapped in an error boundary the same way — if rendering them throws on the server, the server response itself fails. Next.js's solution is to attach the boundary in the *client* portion of the rendering, which means the file must opt into the client bundle.

Forget the `"use client"` and Next will refuse to build with an error that says exactly this. (We'll catch this in `Day_11`.)

### Streaming, briefly

When a page has `loading.tsx` *and* the page body has an `await` (e.g. `await db.trip.findMany()`), Next.js can **stream** the response: it sends the layout + the `<Suspense>` fallback immediately, then sends the resolved page content as soon as it's ready. The browser paints the fallback first, then swaps in the real content. No client-side fetch, no useState, no flicker.

This is one of the App Router's headline features. Day 6 (Prisma + MongoDB) is where we'll actually see streaming in production. Day 2's `loading.tsx` is the *infrastructure* — we'll test it by sticking a temporary `setTimeout` in `/trips` so the slow path is observable.

### Special files: a quick reminder

The App Router has a small set of special filenames. Memorize them:

| File              | Purpose                                          |
| ----------------- | ------------------------------------------------ |
| `page.tsx`        | Makes a segment a real URL                       |
| `layout.tsx`      | Wraps children; persists across navigation       |
| `loading.tsx`     | Suspense fallback for the segment                |
| `error.tsx`       | Error boundary for the segment (Client only)     |
| `not-found.tsx`   | UI when `notFound()` is called or a route 404s   |
| `template.tsx`    | Like layout but re-mounts every navigation       |
| `route.ts`        | HTTP handlers (we used this in Day 1 for `/api/health`) |

Day 2 introduces `loading.tsx` and `error.tsx`. Day 4 will likely introduce `not-found.tsx` when we build real list pages.

---

## 💻 Tiny Isolated Example

```tsx
// app/loading.tsx — Server Component.
export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="h-8 w-1/3 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
      <div className="mt-4 h-4 w-2/3 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
    </div>
  );
}
```

```tsx
// app/error.tsx — Client Component. "use client" on line 1.
"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 px-6 py-12">
      <h2 className="text-2xl font-semibold">Something broke</h2>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        {error.message}
      </p>
      <button
        onClick={reset}
        className="self-start rounded border border-neutral-300 px-3 py-1 text-sm"
      >
        Try again
      </button>
    </div>
  );
}
```

```tsx
// app/(app)/trips/page.tsx — Server Component that can throw on demand.
//
// To deliberately trigger the error boundary, navigate to /trips?boom=1.
export default function TripsPage({
  searchParams,
}: {
  searchParams: { boom?: string };
}) {
  if (searchParams.boom === "1") {
    throw new Error("Boom — error boundary demo");
  }
  return <main>...</main>;
}
```

Three files. The first is a Server Component skeleton. The second is the *only* Client Component on the page — and only because `error.tsx` requires it. The third is still a Server Component; the throw happens server-side; the client-side error boundary catches the rendering failure that bubbled up.

---

## 🚀 Applied to Buddies

> See: [Task 02 — App Shell](../task/02_app_shell.md)

Day 2's loading/error touchpoints:

| File | Type | When it lands | Purpose |
|---|---|---|---|
| `app/loading.tsx` | Server | `Day_10` | Root-level skeleton — shows during any segment-load |
| `app/error.tsx` | **Client (required)** | `Day_11` | Root-level error boundary — catches anything thrown below |
| `app/(app)/trips/page.tsx` | Server | edited in `Day_11` | Add `searchParams.boom === "1"` → throw, as a deliberate trigger |

We're not adding *per-segment* `loading.tsx` / `error.tsx` files yet (no `app/(app)/trips/loading.tsx`, etc.). One root-level pair is enough to demonstrate the concept and protect every route. Per-segment boundaries become useful when each route has its own loading shape — Day 4 (forms), Day 6 (DB queries) are likely candidates.

---

## ⚠️ Gotchas & Beginner Mistakes

1. **`error.tsx` without `"use client"` = build error.** Next refuses to compile, error message points right at the file. Always:

   ```tsx
   "use client";   // first non-comment line

   export default function ErrorPage({ error, reset }: { ... }) { ... }
   ```

2. **`error.tsx` doesn't catch errors in its sibling layout.** If `app/layout.tsx` itself throws, `app/error.tsx` cannot catch it — there's no boundary above the root layout. For that you'd add `app/global-error.tsx`, which is rare. Day 2 doesn't need it.

3. **`reset()` only retries the segment — not the whole app.** If the cause of the error was persistent (e.g. bad data in the DB), clicking "Try again" will fail again. `reset()` is for transient failures, not magic recovery.

4. **`loading.tsx` needs *something* to suspend.** If the page below it doesn't `await` anything, the fallback never shows — the page resolves instantly. To *see* the loading state on a fast machine, you'll need to add a temporary `await new Promise(r => setTimeout(r, 1500))` in the page during testing. (We'll do exactly this in `Day_10`'s verification step.)

5. **Layouts above `loading.tsx` keep rendering.** The `(app)/layout.tsx` header stays visible while `/trips` is loading — only the children inside the `<Suspense>` boundary are replaced. This is a *feature* (no header flicker on navigation), but it can surprise you if you expect the whole page to flash to a skeleton.

6. **Closest boundary wins.** If both `app/error.tsx` and `app/(app)/trips/error.tsx` exist, a throw inside `/trips` is caught by the trips one. The root error file only catches throws *not* caught by a more specific boundary.

7. **`searchParams` is the right way to read URL params in a Server Component page.** Don't reach for `useSearchParams` (Client-only). Pages receive `searchParams` as a prop:

   ```tsx
   export default function TripsPage({
     searchParams,
   }: {
     searchParams: { boom?: string };
   }) { ... }
   ```

   We'll use this in `Day_11`.

8. **Error boundaries don't catch errors in event handlers.** A button's `onClick` that throws is not caught by `error.tsx` (it's caught by the browser, ends up in console). For event-handler errors, use `try/catch` or `react-error-boundary`'s `withErrorBoundary` if you really need it. The `error.tsx` file is for *render-time* errors.

---

## 🧪 Quick Quiz

**1.** A page in `app/(app)/trips/` throws during render. Two files exist: `app/error.tsx` and `app/(app)/trips/error.tsx`. Which one catches it?

<details>
<summary>Show answer</summary>

`app/(app)/trips/error.tsx` — the closest ancestor wins. The root `error.tsx` only catches throws that aren't caught by a more specific boundary. This mirrors how React `<ErrorBoundary>` propagation has always worked; the file convention just sets up the boundaries for you.
</details>

**2.** Why must `error.tsx` start with `"use client"`?

<details>
<summary>Show answer</summary>

Because the React error-boundary machinery is browser-side. Server Components can't be wrapped in a React `<ErrorBoundary>` the same way — if a Server Component throws during render, the *server response itself* fails before any client code runs. Next.js's solution is to attach the boundary in the client portion of the page, which requires `error.tsx` to be part of the client bundle. The `"use client"` directive opts the file in.
</details>

**3.** I have `app/loading.tsx`. My page `app/page.tsx` is purely static — no `await` anywhere. I navigate to `/`. Does the loading UI show?

<details>
<summary>Show answer</summary>

No (or only for an unobservable instant). The fallback shows while React suspends — but a fully synchronous page doesn't suspend at all, so the fallback resolves immediately. To deliberately see the fallback, add an `await new Promise(r => setTimeout(r, N))` to the page during testing. This is the only way to test the loading UI on a fast localhost.
</details>

**4.** `reset()` is called. What re-renders?

<details>
<summary>Show answer</summary>

Just the segment that owned the error boundary. The header (and any layout above the boundary) does **not** re-mount — it stays as it was. This is identical to a normal navigation in App Router. `reset()` essentially says "treat the segment as if we just navigated back to it"; React re-attempts the render with fresh state.
</details>

**5.** A button's `onClick` handler throws. Does the `error.tsx` boundary catch it?

<details>
<summary>Show answer</summary>

No. React error boundaries (the machinery `error.tsx` is built on) only catch errors during rendering, in lifecycle methods, and in constructors. Errors in event handlers, async code, or `setTimeout` callbacks bubble up to the browser and appear in the console. For those, you'd `try/catch` inside the handler, or surface the error via `useState` and re-throw during the next render so the boundary picks it up.
</details>

---

## 📌 Key Takeaways

- **`loading.tsx` = automatic `<Suspense>`** for the segment. Server Component by default. Renders while the page is awaiting data.
- **`error.tsx` = automatic error boundary** for the segment. **MUST be a Client Component** (`"use client"` on line 1). Receives `error` + `reset` props.
- **Closest boundary wins.** Per-segment files override root files for their subtree.
- **Layouts above the boundary persist.** Only the segment below `loading.tsx`/`error.tsx` is replaced.
- **`reset()` retries the segment.** Layout doesn't re-mount. Only useful for transient failures.
- **`searchParams` is the page-level prop for URL params in Server Components.** Don't use `useSearchParams` (Client-only).
- **`error.tsx` doesn't catch errors in event handlers, async code, or its own layout.**
- **To see the loading state during development, add a temporary `await new Promise(r => setTimeout(r, 1500))` in the page.** Required because localhost is too fast.

---

## 🔗 References

- [Next.js docs — `loading.js`](https://nextjs.org/docs/app/api-reference/file-conventions/loading)
- [Next.js docs — `error.js`](https://nextjs.org/docs/app/api-reference/file-conventions/error)
- [Next.js docs — Streaming](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)
- [React docs — Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- Local: [Day 2 — Server vs Client Components](./day2_rsc_vs_client_components.md) — the `"use client"` rule that `error.tsx` depends on

---

## ➡️ What's Next?

- **`Day_10` (next commit)** — Create `app/loading.tsx`. Verify by temporarily adding a `setTimeout` to `/trips` and watching the skeleton stream in.
- **`Day_11`** — Create `app/error.tsx` (with `"use client"`), and add a `searchParams.boom === "1"` throw in `/trips` so we can trigger the boundary on demand. `reset()` recovery.
- **`Day_12`** — First proper Client Component island: `components/theme-toggle.tsx`. Imported into the (Server) `(app)/layout.tsx` header.
- **`Day_13`** — Next learning doc: the Metadata API for per-page `<title>` and OpenGraph.
