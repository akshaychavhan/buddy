# Day_23_Add_better_auth_api_route_handler

## Goal

**Closes Phase B.** Three lines of code in a single new file: a Next.js catch-all route handler that hands every `/api/auth/*` request to Better Auth. After this commit the server-side auth API is end-to-end functional — sign-up, sign-in, sign-out, session lookup, OAuth callbacks all work via HTTP. The UI for those flows lands `Day_25` onward, but they can already be exercised today with `curl`.

Plus one infra patch: mark `better-auth` as a `serverComponentsExternalPackages` in `next.config.mjs` so Webpack doesn't try to bundle Better Auth's transitive kysely-adapter (which references symbols missing from the kysely version pinned by the lockfile). Without that patch, `pnpm build` fails with `'DEFAULT_MIGRATION_TABLE' is not exported from 'kysely'`.

## Summary

**Files at a glance**

| Group     | Files                                                              |
| --------- | ------------------------------------------------------------------ |
| Plan doc  | `plans/Day_23_Add_better_auth_api_route_handler.md`                |
| App code  | `app/api/auth/[...all]/route.ts` (new, 3 lines)                    |
| Config    | `next.config.mjs` (adds `serverComponentsExternalPackages`)        |
| Index     | `docs/README.md` (Auth Detour checklist row flipped)               |

**What you'll run / what you'll see**

| Command                                                            | What it does                                                                                |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| `curl -s http://localhost:3001/api/auth/ok`                        | Returns `{"ok":true}` — Better Auth's built-in healthcheck. Confirms the handler is mounted. |
| `curl -s http://localhost:3001/api/auth/get-session`               | Returns `null` (or `{"user":...,"session":...}` if signed in). The handler is reading the cookie. |
| `curl -sX POST http://localhost:3001/api/auth/sign-up/email -H "Content-Type: application/json" -d '{"email":"...","password":"...","name":"..."}'` | Creates a User + Account + Session row in Atlas. Returns `{token, user}`. Cookie set in response headers. |
| `pnpm build`                                                       | Compiles successfully. Build summary now lists `ƒ /api/auth/[...all]` alongside the existing routes. |

> Phase B complete. Three lines of code; a working auth API. The 2-doc + 5-code commits of Phase B (Day_19–Day_23) bring us from "no auth at all" to "fully functional auth backend, no UI yet."

## Commands

```bash
# Create the route folder + file.
mkdir -p "app/api/auth/[...all]"
# Write app/api/auth/[...all]/route.ts (3 lines — see Files changed).
# Add serverComponentsExternalPackages: ["better-auth"] to next.config.mjs.

# Verify locally.
nvm use
pnpm build         # should compile cleanly
pnpm dev           # start dev server

# In another terminal:
curl -s http://localhost:PORT/api/auth/ok                # → {"ok":true}
curl -s http://localhost:PORT/api/auth/get-session       # → null
curl -sX POST http://localhost:PORT/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email":"smoke@example.com","password":"correct horse battery staple","name":"Smoke Test"}'
# → 200 with {token, user}; cookie set
```

## Files changed

- `plans/Day_23_Add_better_auth_api_route_handler.md` — **created**: this file.
- `app/api/auth/[...all]/route.ts` — **created**: 3 lines.
  ```ts
  import { toNextJsHandler } from "better-auth/next-js";

  import { auth } from "@/lib/auth";

  export const { GET, POST } = toNextJsHandler(auth);
  ```
  The catch-all `[...all]` means this single file handles **every** `/api/auth/*` path: `/api/auth/sign-up/email`, `/api/auth/sign-in/email`, `/api/auth/sign-out`, `/api/auth/get-session`, `/api/auth/callback/google` (when Day_35 wires Google), and Better Auth's built-in introspection endpoints like `/api/auth/ok`. The `toNextJsHandler` wrapper unwraps Better Auth's WHATWG-Fetch-style handlers into Next.js's `(GET, POST)` exports.
- `next.config.mjs` — **edited**: adds `serverComponentsExternalPackages: ["better-auth"]` to the `experimental` block, with a comment explaining the Webpack/kysely issue. Without this, `pnpm build` fails because Better Auth's `kysely-adapter` re-exports symbols (`DEFAULT_MIGRATION_TABLE`, `DEFAULT_MIGRATION_LOCK_TABLE`) that don't exist in the kysely version pinned by Better Auth's lockfile. Marking `better-auth` external tells Next to `require()` it at runtime instead of bundling, sidestepping the import-error chain.
- `docs/README.md` — **edited**: Auth Detour checklist row "`app/api/auth/[...all]/route.ts` catch-all route handler" flips from **Concepts pending ⏳** to **Concepts covered ✅**, tagged `Day_23`. Covered: 8 → 9; pending: 14 → 13.

## Verification

1. `ls "app/api/auth/[...all]/"` — shows `route.ts`.
2. `grep "serverComponentsExternalPackages" next.config.mjs` — shows the new array containing `"better-auth"`.
3. `pnpm build` — exits 0; route table now lists **`ƒ /api/auth/[...all]`** alongside the existing routes (`/`, `/_not-found`, `/api/health`, `/sign-in`, `/trips`). The `ƒ` (dynamic) marker is correct: auth endpoints can't be statically prerendered.
4. `pnpm typecheck && pnpm lint` — both pass.
5. **End-to-end smoke test (manual):**
   - `pnpm dev`, note the port (usually 3000 or 3001/3002 if occupied).
   - `curl -s http://localhost:PORT/api/auth/ok` → `{"ok":true}`.
   - `curl -s http://localhost:PORT/api/auth/get-session` → `null`.
   - `curl -sX POST http://localhost:PORT/api/auth/sign-up/email -H "Content-Type: application/json" -d '{"email":"smoke@example.com","password":"correct horse battery staple","name":"Smoke"}'` → 200; response body has `{token, user}`; `set-cookie` header sets `better-auth.session_token=...; HttpOnly; SameSite=Lax`.
   - In Atlas → "Browse Collections" → `user` collection now has 1 document with the smoke email; `account` has 1 doc linking it back to the user with `providerId: "credential"`; `session` has 1 doc with the token.
6. `docs/README.md` Auth Detour Checklist: 9 covered, 13 pending, 4 deferred.

## Gotchas / decisions

- **`/session` is NOT the endpoint — `/get-session` is.** Better Auth's Day_19 doc casually mentions `/api/auth/session` returning JSON; the actual endpoint in v1.6.14 is `/api/auth/get-session`. Calling `/session` returns 404. Worth noting because plenty of online tutorials show the older path.
- **The kysely-adapter Webpack issue is a real bug in Better Auth 1.6.14**, not a config error on our side. Better Auth's `dist/index.mjs` re-exports the kysely-adapter even though we're using Prisma; the adapter imports symbols (`DEFAULT_MIGRATION_TABLE`, `DEFAULT_MIGRATION_LOCK_TABLE`) that no longer exist in modern kysely. Marking `better-auth` external in `next.config.mjs` is the standard workaround until either (a) Better Auth ships a tree-shakeable build or (b) the kysely deps get re-aligned. Documented in plan file so future-you knows why this config line exists.
- **Why `serverComponentsExternalPackages` and not `transpilePackages`?** Because Better Auth runs **only on the server** — the route handler is a server-side function. `serverComponentsExternalPackages` tells Next "don't bundle this for server-side execution, use `require()` at runtime." `transpilePackages` is for client-side ESM-to-CJS shimming; that's not the issue here.
- **First-time smoke test created a real Atlas row.** The "smoke@example.com" user from the verification step is in your Atlas DB right now. Leaving it for future debugging; you can drop it in the Atlas UI if you want a clean slate. Don't sign up with a real email yet — `Day_25`/`Day_26` ship the proper sign-up UI; testing should go through that.
- **No UI changes in this commit.** `/sign-in` is still the stub from Day_07. The auth API surface exists but nothing in the app calls it yet. Day_25 (sign-up page + server action) is the first UI consumer.
- **The catch-all is the *only* `/api/auth/*` route allowed.** If you accidentally create a sibling route like `app/api/auth/custom/route.ts`, Next will route it before falling through to the catch-all, breaking Better Auth's URL contract. Convention: keep `app/api/auth/` empty except for the `[...all]` folder.
- **Phase B is done.** Phase C (UI forms via Server Actions) opens with `Day_24`'s doc-first commit. Pace remains: doc → code → doc → code.
