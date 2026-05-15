# Day_06_Add_app_route_group_and_move_home_page

## Goal

First **code** commit of Day 2. Creates the `(app)` route group and atomically moves the existing home page into it. After this commit, `/` is still served — but it's now routed through `app/(app)/page.tsx` under `app/(app)/layout.tsx`, ready for `Day_08` to wrap it with a header + `<Link>` nav. The move is in a single commit (not two) because both `app/page.tsx` and `app/(app)/page.tsx` resolving to `/` would crash the build.

The `(app)` layout in this commit is intentionally **minimal** — just a passthrough Server Component. Header + nav land in `Day_08` after the `(auth)` group exists, so the `<Link>` destinations are real and not 404-stubs.

## Summary

**Files at a glance**

| Group     | Files                                                         |
| --------- | ------------------------------------------------------------- |
| Plan doc  | `plans/Day_06_Add_app_route_group_and_move_home_page.md`      |
| App code  | `app/(app)/layout.tsx` (new), `app/(app)/page.tsx` (moved)    |
| Removed   | `app/page.tsx` (moved into `(app)`)                           |

**What you'll run / what you'll see**

| Command                                                    | What it does                                                                                |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `nvm use && pnpm dev`                                      | Starts dev server. Browse to `http://localhost:3000/` → see the same Day 1 page (`Buddies — Day 1` heading + tagline). |
| `curl -s http://localhost:3000/api/health`                 | Still returns `{"ok":true,"ts":<number>}` — unchanged. |
| `pnpm build`                                               | Compiles successfully. Build output shows `/` resolved via the `(app)` group: a route listed as `/` (not `/(app)`). |
| `git log --stat -1`                                        | Diff shows `app/page.tsx → app/(app)/page.tsx` as a **rename** (not delete + add), plus the new `app/(app)/layout.tsx`. |

> First code touch of Day 2. The visible page output is identical to Day 1 — the *organization* changed, not the rendering.

## Commands

```bash
# Create the route group + move the page atomically.
mkdir -p "app/(app)"
git mv app/page.tsx "app/(app)/page.tsx"

# Create the minimal layout file (passthrough, header lands in Day_08).
# (See app/(app)/layout.tsx for content.)

# Verify locally.
nvm use
pnpm dev
# Open http://localhost:3000/ — same page as Day 1.
```

## Files changed

- `plans/Day_06_Add_app_route_group_and_move_home_page.md` — **created**: this file.
- `app/(app)/layout.tsx` — **created**: minimal Server Component, 7 lines. Just renders `{children}` so Next.js can compose it into the tree. No header yet — that arrives in `Day_08` after the `(auth)` group + `/sign-in` + `/trips` exist as `<Link>` destinations.
- `app/(app)/page.tsx` — **moved** from `app/page.tsx` via `git mv`. Content unchanged; the diff displays as a rename. Same JSX, same dark-mode classes, same "Buddies — Day 1" heading.
- `app/page.tsx` — **removed** (as a side-effect of the `git mv`). No longer needed; the URL `/` is now owned by `(app)/page.tsx`.

## Verification

1. `ls app/` — shows `(app)/`, `api/`, `globals.css`, `layout.tsx`. Note: **no `page.tsx` directly under `app/`** anymore.
2. `ls "app/(app)/"` — shows `layout.tsx` and `page.tsx`.
3. `git log --stat -1` — output names the moved file as a rename (`app/page.tsx → app/(app)/page.tsx`), not a delete + create.
4. `nvm use && pnpm dev` → open `http://localhost:3000/` → exact same page as Day 1 (heading "Buddies — Day 1", tagline, `/api/health` hint).
5. `curl -s http://localhost:3000/api/health` returns `{"ok":true,"ts":<number>}` — Day 1 endpoint untouched.
6. `pnpm typecheck && pnpm lint` — both pass.
7. `pnpm build` — succeeds. The route summary at the end lists `/` (not `/(app)`); confirms route groups don't add URL segments.

## Gotchas / decisions

- **Why atomic move?** If we created `app/(app)/page.tsx` *first* and left `app/page.tsx` in place, Next would refuse to build with: `Error: You cannot have two parallel pages that resolve to the same path: "app/page" and "app/(app)/page"`. The commit *must* land both edits together. `git mv` does this — the working tree never has both files simultaneously.
- **Why `git mv` instead of copy + delete?** `git mv` preserves the file's history under the new path. `git log app/(app)/page.tsx` will show every prior commit that touched the file (including `Infra_02_Scaffold_root_nextjs` that originally created it). Plain `cp` + `rm` would break that lineage.
- **Why is `(app)/layout.tsx` so empty?** It needs to exist (otherwise the `(app)` group does nothing different from the root layout), but the header + nav want **three** `<Link>` destinations that all *resolve*: `/`, `/trips`, `/sign-in`. Only `/` exists right now. Adding the header in this commit would mean two `<Link>` typos resolving to 404. We instead let `Day_07` add `(auth)/sign-in` and `Day_08` add `/trips` *while* it adds the header — so every link in the header points at a real route from the moment it lands.
- **Root `app/layout.tsx` is untouched.** It still owns `<html>` and `<body>`. `(app)/layout.tsx` only wraps the chrome *inside* `<body>`. Nothing about Day 1's setup needs to change.
- **`app/api/health/route.ts` doesn't move.** The `(app)` group is for **pages**, not API routes. Route handlers live outside any group. `/api/health` stays at `/api/health`.
- **Dev cache.** If `pnpm dev` was already running when the move happened, restart it. Next caches the route tree at startup; the rename won't pick up until the next boot.
