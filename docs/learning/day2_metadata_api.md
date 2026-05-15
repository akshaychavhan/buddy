# Day 2 — The Metadata API: Per-Page Titles, OpenGraph, and Friends

> **Created:** 2026-05-15
> **Phase:** 1 — Foundations

---

## 🎯 What Are We Learning?

How to control the contents of `<head>` — the page `<title>`, the meta description, OpenGraph cards for link previews, favicons, robots directives — using **Next.js's Metadata API**, which is the App Router's replacement for `next/head` and `_document.tsx`.

By the end of this doc you should be able to:

1. Know that **every layout and every page can export a `metadata` object**, and that Next.js merges them top-down to produce the final `<head>`.
2. Use **`title.template`** in the root layout so pages can set just their own segment (e.g. `"Trips"`) and the full title renders as `"Trips · Buddies"`.
3. Choose between **`export const metadata`** (static, build-time) and **`export async function generateMetadata`** (dynamic, request-time) — and know which one each kind of page needs.
4. Add **OpenGraph metadata** so a link to `/trips` shared on Slack/iMessage/X renders a proper preview card.
5. Avoid the four most common metadata pitfalls (most of them involve thinking the Pages Router's `next/head` will work — it won't).

We *use* all of this in `Day_14`: root `app/layout.tsx` gets a `title.template`, and `/`, `/trips`, `/sign-in` each export a per-page `metadata` object.

---

## 🤔 Why Does This Matter?

A page's `<title>` is what shows in the browser tab, the bookmark, the history menu, and — most importantly for a product like Buddies — the link preview when someone shares the URL on Slack, iMessage, WhatsApp, or X. Get it wrong and your trip-planning app shows up as "Buddies — Day 1" on every link, with no image and no description. Get it right and a shared `/trips` link previews as a polished card.

The Pages Router's answer was `<Head>` from `next/head`: import it inside your component, render `<title>...</title>` as a child. The App Router took it away, for one important reason: **`<Head>` only worked inside Client Components, because it injected DOM nodes on the client side.** That conflicted with the Server-Component-first model.

The Metadata API replaces it with a *declarative* approach: export an object, Next reads it at build time (or per request), generates the right HTML on the server, and the browser gets a fully-formed `<head>` before any JS runs. Better for SEO, better for share previews, smaller bundle.

---

## 🧠 How It Works (The Concept)

### Where you export `metadata`

Every `layout.tsx` and `page.tsx` can export a `metadata` object:

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Buddies — Plan trips together",
  description: "A web-first trip planner...",
};
```

Next collects all the `metadata` exports up the tree, merges them, and renders the result into `<head>`. **Page-level metadata wins** when there's a conflict (more specific overrides more general).

The merge happens **per-key**. So a layout setting `title` and a page setting `description` produces a final `<head>` with the layout's `title` and the page's `description` — no need to repeat keys.

### The `title.template` pattern

If you write `title` as a plain string, that string *is* the full title:

```tsx
// Page-level
export const metadata: Metadata = { title: "Trips" };
// Renders: <title>Trips</title>
```

That's rarely what you want — every page would need to remember "and Buddies." The fix: in the **root** layout, set `title` as an object with a **template**:

```tsx
// app/layout.tsx
export const metadata: Metadata = {
  title: {
    template: "%s · Buddies",
    default: "Buddies — Plan trips together",
  },
};
```

Now pages set their own segment:

```tsx
// app/(app)/trips/page.tsx
export const metadata: Metadata = { title: "Trips" };
// Renders: <title>Trips · Buddies</title>
```

- `template` — the wrapper. `%s` is replaced by the child page's title.
- `default` — used when no child page sets `title` (e.g. the home page if it doesn't override).

This is the single most useful piece of the Metadata API. Set the template once, get composed titles everywhere.

### Static `metadata` vs dynamic `generateMetadata`

For pages where the title is known at build time, **`export const metadata`** is enough. Plain object, statically analyzable, fastest.

For pages where the title depends on runtime data — for example `/trips/[id]` showing "Goa long weekend · Buddies" — you need **`export async function generateMetadata`**:

```tsx
// app/(app)/trips/[id]/page.tsx
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const trip = await db.trip.findUnique({ where: { id: params.id } });
  return { title: trip?.name ?? "Trip not found" };
}
```

Key facts:
- It's an **async function** — can `await` the DB.
- It receives the same `params` and `searchParams` props the page does.
- It returns a `Metadata` object (or a `Promise<Metadata>`).
- It runs **on the server, once per request** (unless statically prerendered).

**Use `generateMetadata` when the value depends on something you only know at request time** (URL params, search params, headers, cookies). Use the plain `const metadata` for everything else.

### OpenGraph and Twitter Cards

The `openGraph` and `twitter` keys produce the meta tags that drive link-preview cards in messaging apps:

```tsx
export const metadata: Metadata = {
  title: "Trips",
  description: "Your saved trips, ready to plan.",
  openGraph: {
    title: "Trips · Buddies",
    description: "Your saved trips, ready to plan.",
    url: "https://buddies.example.com/trips",
    siteName: "Buddies",
    images: [{ url: "/og/trips.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Trips · Buddies",
    description: "Your saved trips, ready to plan.",
    images: ["/og/trips.png"],
  },
};
```

Notice the **separate `title` field inside `openGraph`** — the OpenGraph title doesn't automatically use the `title.template`. If you don't set `openGraph.title`, Next falls back to the page `title` as a literal string (no template applied). That's a footgun: share previews end up reading "Trips" not "Trips · Buddies." Always set `openGraph.title` explicitly when you want the composed name.

OpenGraph images are deserving of their own day; for now we'll keep things simple in `Day_14` (a small set of static text-only previews; real OG image generation lands later, possibly Day 5 with i18n).

### File-based metadata (the other half)

Some metadata is set by *placing files in the right folders*, not by exporting an object:

| File in `app/`           | Effect                                           |
| ------------------------ | ------------------------------------------------ |
| `favicon.ico`            | Browser favicon                                  |
| `icon.png` / `icon.svg`  | Favicon (modern variant)                         |
| `apple-icon.png`         | iOS home-screen icon                             |
| `opengraph-image.png`    | Default OG image for every page                  |
| `twitter-image.png`      | Default Twitter card image                       |
| `robots.txt`             | Search-engine rules                              |
| `sitemap.xml`            | Sitemap                                          |
| `manifest.json`          | PWA manifest                                     |

Day 2 doesn't touch file-based metadata — we're focused on the object API. The list is here so you know the *other* half exists.

### What gets merged how

When Next.js builds the final `<head>`, it walks up from the page to the root, collecting every `metadata` export:

```
app/layout.tsx                    →  { title.template, title.default, OG defaults }
app/(app)/layout.tsx              →  { (none — layouts can skip metadata) }
app/(app)/trips/page.tsx          →  { title: "Trips", OG.title }
```

The merge is **shallow** — `title.template` from root combines with `title: "Trips"` from page to render `<title>Trips · Buddies</title>`. But `openGraph.title` from page **overrides** any `openGraph.title` from root completely; it doesn't merge field-by-field within nested objects. Plan accordingly.

---

## 💻 Tiny Isolated Example

The full pattern in three files:

```tsx
// app/layout.tsx — root, sets title.template + defaults
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s · Buddies",
    default: "Buddies",
  },
  description: "Plan trips with friends.",
  openGraph: {
    siteName: "Buddies",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
```

```tsx
// app/(app)/page.tsx — home, uses the default
// (no metadata export — root's default kicks in)

export default function HomePage() {
  return <h1>Welcome</h1>;
}
// Renders: <title>Buddies</title>
```

```tsx
// app/(app)/trips/page.tsx — sets its own slot via the template
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trips",
  openGraph: { title: "Trips · Buddies" },
};

export default function TripsPage() {
  return <h1>Your trips</h1>;
}
// Renders: <title>Trips · Buddies</title>
//          <meta property="og:title" content="Trips · Buddies" />
```

Three small exports. No imports of `<Head>`, no `useEffect`s, no client-side JS at all for the head tags. View source to confirm.

---

## 🚀 Applied to Buddies

> See: [Task 02 — App Shell](../task/02_app_shell.md)

Day 2's metadata touchpoints (land in `Day_14`):

| File                                | metadata change                                                  |
| ----------------------------------- | ----------------------------------------------------------------- |
| `app/layout.tsx`                    | Broaden root: `title: { template: "%s · Buddies", default: "Buddies — Plan trips together" }` + minimal OG defaults |
| `app/(app)/page.tsx`                | `{ title: "Home", description: "..." }` (or omit `title` to let the default kick in — TBD when we get there) |
| `app/(app)/trips/page.tsx`          | `{ title: "Trips", openGraph: { title: "Trips · Buddies" } }`     |
| `app/(auth)/sign-in/page.tsx`       | `{ title: "Sign in" }`                                            |

We're not adding **`generateMetadata`** yet — no page in Day 2 needs runtime data for its title. The dynamic version arrives when `/trips/[id]` lands, probably Day 6 (DB-backed trips).

We're not adding file-based metadata yet either. `favicon.ico` exists from the scaffold; default OG images land later.

---

## ⚠️ Gotchas & Beginner Mistakes

1. **Don't import `<Head>` from `next/head`.** That's Pages Router. In App Router it'll either throw or silently no-op — definitely won't put anything in the `<head>`. The fix is to remove the import and use the `metadata` export instead.

2. **`metadata` exports must be at the top level of the module.** You can't put `export const metadata = ...` inside a function, inside a conditional, or inside a Client Component. Next reads the export statically. If you're computing the title from props, you need `generateMetadata` instead.

3. **Client Components can't export `metadata`.** Both `export const metadata` and `export async function generateMetadata` are valid only in Server Components (the default — no `"use client"`). If you accidentally add `"use client"` to a page that exports metadata, the export is silently ignored. Always keep `metadata` in the Server-Component portion of your tree.

4. **`openGraph.title` doesn't use the template.** Setting `title: "Trips"` and `title.template: "%s · Buddies"` produces `<title>Trips · Buddies</title>`, but `openGraph.title` (if not set) falls back to the **bare** page title `"Trips"`. Always set `openGraph.title` explicitly with the composed name you want in share previews.

4a. **`twitter.title` has the same trap.** Same reason. If you set `openGraph.title` but not `twitter.title`, the Twitter card uses the bare title. Set both, or rely on `twitter` inheriting from `openGraph` (which Next does for most keys, but be explicit when in doubt).

5. **`generateMetadata` and the page receive the same `params`.** Next.js dedupes the fetch in dev/prod: if `generateMetadata` and the page both `await db.trip.findUnique(...)` with the same args, it actually only runs once. So go ahead and fetch in both — the deduping (called *request-level caching*) is automatic.

6. **`metadata` is not reactive.** Setting a string in `metadata` doesn't subscribe to anything. If you want the title to change in response to client-side state (e.g. an unread-count badge in the tab title), you need to write `document.title = "..."` from a Client Component effect. The Metadata API is for *first render*.

7. **The `<title>` shown in dev mode might include extra noise.** Next.js dev server occasionally appends route info to the tab. Verify the *real* title with `pnpm build && pnpm start` or `curl -s URL | grep '<title>'`.

8. **TypeScript: import `Metadata` from `next`, not from `next/types`.** The latter is internal. `import type { Metadata } from "next";` is the supported path.

---

## 🧪 Quick Quiz

**1.** I set `title.template: "%s · Buddies"` in the root layout and `title: "Trips"` in a page. What does the browser tab show?

<details>
<summary>Show answer</summary>

`Trips · Buddies`. The template's `%s` is replaced by the page's `title` string. This is the most useful pattern in the Metadata API: define the suffix once at the root, let each page set just its own segment.
</details>

**2.** When do I need `generateMetadata` instead of `export const metadata`?

<details>
<summary>Show answer</summary>

When the metadata value depends on something only known at request time — typically URL params (`/trips/[id]`), search params, headers, or cookies. For static titles (`/trips`, `/sign-in`, `/about`), `export const metadata` is enough and runs at build time. For `/trips/[id]` where the title is the trip's name, `generateMetadata` lets you `await` the DB and return the right object.
</details>

**3.** Does `metadata` work in a Client Component (one with `"use client"`)?

<details>
<summary>Show answer</summary>

No. The metadata exports are silently ignored if the file has `"use client"`. The reason: metadata generation runs during server rendering, and Client Components don't have a server-side render phase that exports things. If you need a page to be a Client Component **and** have metadata, move the Client part down into a child component and let the page (Server Component) own the metadata + render the Client child.
</details>

**4.** I set `openGraph.title` on a page but didn't set `twitter.title`. What does the Twitter card preview show?

<details>
<summary>Show answer</summary>

Whatever Next's `twitter` fallback decides — historically it falls back through `openGraph.title` then to the page `title`. In practice, **set `twitter.title` explicitly** alongside `openGraph.title`. Fallback behavior is a documented but subtle area; explicitly setting both means you're not depending on Next's defaults.
</details>

**5.** Can I import `<Head>` from `next/head` in the App Router?

<details>
<summary>Show answer</summary>

You can import it (TypeScript won't error), but it does nothing in the App Router. The App Router replaces `<Head>` entirely with the Metadata API. If you're seeing tutorials that use `<Head>`, they're Pages Router tutorials — translate them to the App Router style: export a `metadata` object instead.
</details>

---

## 📌 Key Takeaways

- **Every layout and page can export `metadata`** — Next merges them top-down to build the final `<head>`.
- **`title.template` in the root layout** + per-page `title: "..."` = composed titles like `Trips · Buddies`. The single most useful pattern.
- **`export const metadata`** for static, **`export async function generateMetadata`** for dynamic. Both run on the server.
- **`metadata` only works in Server Components.** A `"use client"` file's `metadata` export is silently ignored.
- **`openGraph.title` doesn't auto-apply the template.** Set it explicitly. Same for `twitter.title`.
- **Don't use `next/head`.** That's Pages Router; it's a no-op in App Router.
- **File-based metadata exists too** (`favicon.ico`, `opengraph-image.png`, `robots.txt`, …) — not Day 2 scope, but good to know.

---

## 🔗 References

- [Next.js docs — Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Next.js docs — `Metadata` and `generateMetadata` reference](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Next.js docs — File conventions: metadata files](https://nextjs.org/docs/app/api-reference/file-conventions/metadata)
- [OpenGraph protocol — official spec](https://ogp.me/)
- Local: [Day 2 — Server vs Client Components](./day2_rsc_vs_client_components.md) — `metadata` only works in the Server-Component portion of the tree

---

## ➡️ What's Next?

- **`Day_14` (next commit)** — Apply this API. Broaden the root `metadata` with `title.template`, then add per-page `metadata` to `/`, `/trips`, `/sign-in`. Verify in the browser tab and via `view-source:`.
- **`Day_15`** — Day 2 close-out. Flip Day 2 tracker row to ✅ Completed; retrospective in the task doc.
- **Day 6** — Real `generateMetadata` for `/trips/[id]`, awaiting Prisma + MongoDB.
