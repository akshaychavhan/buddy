# Day 7 — OAuth Extension: Sign In with Google

> **Created:** 2026-06-10
> **Phase:** 3 — Auth & Backend Wiring (pulled forward by the Auth Detour)

---

## 🎯 What Are We Learning?

How to add **"Sign in with Google"** alongside email/password (Day_26) and magic-link (Day_32). After `Day_35` ships, a user can click one button, get redirected to Google's consent screen, approve, and end up signed in to Buddies — with their Google profile linked to a Buddies `User` row via an `Account` table entry.

By the end of this doc you should know:

1. The OAuth 2.0 handshake in one diagram — who calls whom, what each leg carries, and where session creation actually happens.
2. **Why `BETTER_AUTH_URL` must match the redirect URI registered in Google Console** exactly, and what the failure (`redirect_uri_mismatch`) looks like.
3. How the **`Account` table** links a `User` to a `providerId: "google"` — and how the same `User` can have multiple `Account` rows (one for password, one for Google, etc.).
4. The minimum API surface: `socialProviders.google: { clientId, clientSecret }` in `lib/auth.ts` + a button on the sign-in page.
5. The scope guardrail — `Day_34` is manual (register the OAuth app); `Day_35` is the code. We're NOT building GitHub, Apple, Discord, etc. — those are copy-paste extensions for later.

`Day_34` ships the manual walkthrough. `Day_35` ships the code. This doc is the *why* + the contract.

---

## 🤔 Why Does This Matter?

Buddies already has two sign-in paths: email/password (low UX cost for power users), and magic-link (low UX cost for casual users). Why a third?

Three reasons:

1. **Reduces sign-up friction.** "Continue with Google" is one click. No password to invent, no email to wait for, no link to click. For mobile users tapping with thumbs, this dominates.

2. **Email verification is implicit.** Google has already verified the email belongs to the user. Better Auth's magic-link flow does the same thing, but Google adds *trust* — we know the address is owned by a Google-authenticated identity. No squatting.

3. **Profile data for free.** Google gives us `name` and (with the `profile` scope) `image` — populated on the `User` row automatically. Magic-link sign-ups have `image: null` until the user uploads one; Google users get an avatar from day one.

The trade-off: we depend on Google's identity service. If their OAuth goes down, our Google button is broken (but password + magic-link still work). For Buddies that's acceptable — we have three sign-in paths; one going down is a degraded experience, not an outage.

---

## 🧠 How It Works (The Concept)

### The OAuth 2.0 handshake — full picture

What happens when a user clicks "Sign in with Google":

```
┌────────────────────────────────────────────────────────────────────┐
│  1. User clicks "Sign in with Google" on /sign-in                  │
└────────────────────────────────────────────────────────────────────┘
         │  POST /api/auth/sign-in/social with { provider: "google" }
         ▼
┌────────────────────────────────────────────────────────────────────┐
│  2. Better Auth (server-side):                                      │
│      a. Generate a `state` token (CSRF protection — random nonce)   │
│      b. Build the Google authorize URL:                             │
│           https://accounts.google.com/o/oauth2/v2/auth?              │
│             client_id=${GOOGLE_CLIENT_ID}&                          │
│             redirect_uri=${BETTER_AUTH_URL}/api/auth/callback/google&│
│             response_type=code&                                     │
│             scope=email profile&                                    │
│             state=${state}                                          │
│      c. Store state in a short-lived cookie (validated in step 6)   │
│      d. 302 redirect the browser to the Google URL                  │
└────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────────────┐
│  3. Google shows the consent screen ("Buddies wants to know your   │
│     email & profile"). User clicks Allow.                           │
└────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────────────┐
│  4. Google → browser: 302 redirect to                              │
│     ${BETTER_AUTH_URL}/api/auth/callback/google                    │
│       ?code=4/0AeaY...                                              │
│       &state=${state}                                               │
│       &scope=email profile                                          │
└────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────────────┐
│  5. Browser → Buddies's catch-all route (Day_23's [...all]/route)  │
│     hits the callback handler                                       │
└────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────────────┐
│  6. Better Auth (server-side):                                      │
│      a. Validate `state` cookie matches the URL param (CSRF check) │
│      b. POST to Google's token endpoint with `code` + clientSecret: │
│           https://oauth2.googleapis.com/token                       │
│         Google responds with { access_token, id_token }             │
│      c. GET https://www.googleapis.com/oauth2/v2/userinfo with     │
│         the access token → { email, name, picture, ... }           │
│      d. Look up Account row by (providerId: "google", accountId:   │
│         <google user id>):                                          │
│           - Found → use the linked User row                         │
│           - Not found → create a User row (or link to existing      │
│             one by email if "trustedProviders" includes "google")  │
│           - Create/update the Account row                           │
│      e. Create a Session row + set the session cookie               │
│      f. 302 redirect to "/" (or wherever was the post-sign-in       │
│         destination)                                                │
└────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────────────┐
│  7. Browser at "/" with the session cookie. Signed in.              │
└────────────────────────────────────────────────────────────────────┘
```

Seven steps. Three different servers involved (Google, our backend, the browser). One round-trip to Google's user endpoint. The whole thing takes ~2 seconds.

### Why `BETTER_AUTH_URL` must match exactly

In step 2c above, Better Auth builds the redirect URI:

```
${BETTER_AUTH_URL}/api/auth/callback/google
```

Google then validates this URI against the **list of authorized redirect URIs** registered for the OAuth client ID. If the URI doesn't match *exactly* — including protocol, host, port, and path — Google returns:

```
Error 400: redirect_uri_mismatch
```

The browser shows Google's error page. Not Buddies's. The user has no way to recover except retry, which fails identically.

Common causes of mismatch:

| Cause | Symptom |
|---|---|
| Dev: `BETTER_AUTH_URL=http://localhost:3001` (port shift) but Console only has `:3000` | Mismatch error every time |
| Prod: deployed to a Vercel preview URL but Console only knows the canonical domain | Mismatch error on previews |
| `http://` vs `https://` confusion | Mismatch error (protocols differ) |
| Trailing slash on the redirect URI | Mismatch error (URL strings differ literally) |

The fix is always: **add the missing URI to the Google Console's authorized list.** You can have multiple (for dev, staging, prod, previews).

For Buddies dev: `http://localhost:3000/api/auth/callback/google` is what Better Auth builds (because `BETTER_AUTH_URL=http://localhost:3000` from Infra_02's `.env.example`). That's exactly what `Day_34`'s walkthrough will register.

### The `Account` table's role

Day_22's CLI ran created four models, including `Account`:

```prisma
model Account {
  id                    String    @id @map("_id")
  accountId             String    // Google's user ID, or email for credential
  providerId            String    // "credential" | "google" | future providers
  userId                String
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  accessToken           String?   // Google OAuth access token (rotatable)
  refreshToken          String?   // Google OAuth refresh token
  idToken               String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  password              String?   // null for OAuth providers; set for "credential"
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@index([userId])
}
```

One `User` row can have **multiple `Account` rows** — one for each sign-in method:

- Password sign-up creates `{ providerId: "credential", accountId: "<email>", password: "<hash>" }`.
- Google sign-up creates `{ providerId: "google", accountId: "<google-user-id>", accessToken: "...", refreshToken: "..." }`.
- A user who started with password and later adds Google would have **two** Account rows linked to the same `User.id`.

This is the *account linking* model. We don't expose linking in this detour, but the schema supports it. If we ever build a "Connect your Google account" button in a profile page later, it just creates a new `Account` row.

### What "trusted providers" means

Better Auth's `socialProviders.google` accepts a config flag like `trustedProviders: ["google"]`. With this set, when a Google sign-in matches an existing `User.email` (e.g. someone signed up with password using `you@example.com`, then later clicks "Sign in with Google" with the same email), the two get **linked automatically** — same `User` row, two `Account` rows.

Without `trustedProviders`, Better Auth would create a new `User` row instead, leaving the user with two separate accounts.

For Buddies, we'll trust Google (their email verification is rigorous). That's the default Better Auth assumes if you don't override. The config will be `socialProviders: { google: { clientId, clientSecret } }` — no special flags.

### The minimum API surface (what Day_35 ships)

Two file changes:

**(a) `lib/auth.ts` — add `socialProviders.google`:**

```ts
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "mongodb" }),
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    },
  },
  plugins: [
    magicLink({ sendMagicLink: async ({ email, url }) => { await sendMagicLink({ email, url }) } }),
  ],
});
```

The `?? ""` fallback is the **lazy-config pattern** matching Day_32's Resend wiring. If the env vars aren't set, the build still passes — only the runtime sign-in attempt fails (Google rejects the empty client ID).

**(b) `app/(auth)/sign-in/page.tsx` — add a "Sign in with Google" button:**

The button posts to a Server Action that calls `auth.api.signInSocial({ body: { provider: "google" } })`. Better Auth returns the redirect URL; the action issues a `redirect()` to it. From there, the OAuth handshake runs (steps 2 onward above).

That's the whole code. Two small additions.

### What this is NOT

Out of scope for the detour:

- **Other OAuth providers** (GitHub, Apple, Discord, Microsoft) — all are copy-paste extensions: add another entry under `socialProviders`, add another button. Future Day-N work.
- **"Connect your Google account" from a profile page** — requires UI we don't have yet.
- **Custom OAuth scopes** beyond `email + profile` — defaults are fine.
- **Token refresh / API access** — we don't call Google APIs after sign-in. The access token sits in the `Account` row unused.

---

## 💻 Tiny Isolated Example

The minimum config for any OAuth provider in Better Auth:

```ts
socialProviders: {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  },
  // Adding github would be:
  // github: { clientId: ..., clientSecret: ... },
}
```

The sign-in button:

```tsx
<form action={async () => {
  "use server";
  const { url } = await auth.api.signInSocial({
    body: { provider: "google" },
    headers: await headers(),
  });
  redirect(url);
}}>
  <button type="submit">Sign in with Google</button>
</form>
```

That's the entire OAuth client side from our perspective. Better Auth handles the rest.

---

## 🚀 Applied to Buddies

> See: [Task — Auth Detour](../task/) — closes in `Day_36`.

`Day_34` and `Day_35` together:

| Commit | What ships |
|---|---|
| `Day_34` | Manual walkthrough in plan file: register the Google OAuth app, paste creds into `.env.local`. No code change. |
| `Day_35` | `lib/auth.ts` adds `socialProviders.google`; new `app/(auth)/sign-in/google-sign-in-button.tsx` Client Component; `sign-in/page.tsx` renders the third option below magic-link. |

After both land:
- `/sign-in` shows **three** sign-in options: password form, magic-link form, Google button.
- Click "Sign in with Google" → redirected to Google → approve → back to `/` signed in.
- New user → `User` + `Account` rows created in Atlas (`Account.providerId = "google"`).
- Existing user (same email previously used for password) → second `Account` row linked to same `User`.

---

## ⚠️ Gotchas & Beginner Mistakes

1. **`redirect_uri_mismatch` is the #1 OAuth bug.** Triple-check that the URI registered in Google Console exactly matches what Better Auth builds: `${BETTER_AUTH_URL}/api/auth/callback/google`. Pay attention to `http` vs `https`, port numbers, and trailing slashes.

2. **Test redirect URIs must be registered too.** If you're running dev on `http://localhost:3000`, register that exact URL in Console. If you sometimes use `localhost:3001` (port shift when 3000 is busy), register that too. You can have many.

3. **`GOOGLE_CLIENT_SECRET` is a secret.** Never commit it. Treat it like `BETTER_AUTH_SECRET` — `.env.local` only, rotate if leaked. Unlike public client IDs, the secret can authorize *anyone* who has it to act as "Buddies" against Google.

4. **OAuth consent screen needs scopes declared.** When you create the OAuth client in Google Console (Day_34), the consent screen config has a separate page where you list the scopes. We need `openid`, `email`, `profile` (Google's defaults for "give me a user's basic info"). Forget this and the access token won't include what we need.

5. **External vs Internal consent screen.** External = anyone with a Google account can sign in. Internal = only your Google Workspace org. For Buddies (anyone-signs-up), pick External. Internal would lock out the world.

6. **App verification for production.** External apps go into "Testing" mode by default — only the test users you list (max 100) can sign in until you submit for verification (a Google review). For dev/learning that's fine. For real product launch, you'd submit.

7. **`auth.api.signInSocial` returns a URL, not a Response.** It returns `{ url, redirect: true }`. Our Server Action has to call `redirect(url)` after. Mixing this up (e.g. trying to `return` the URL from the action) means the user sits on `/sign-in` doing nothing.

8. **The `Account.accessToken` rots over time.** Google access tokens expire after an hour. Better Auth handles refresh via `Account.refreshToken` if and when we actually call Google APIs. For pure sign-in (no API access), the access token gets used once at callback and then sits unused. We don't need to refresh until we need it.

---

## 🧪 Quick Quiz

**1.** A user clicks "Sign in with Google" but lands on a Google error page saying `redirect_uri_mismatch`. What's the most likely cause and where do you fix it?

<details>
<summary>Show answer</summary>

The redirect URI Better Auth built (using `BETTER_AUTH_URL`) doesn't match any of the URIs registered for the OAuth client in Google Cloud Console. Most likely cause: dev server is on `:3001` because `:3000` was busy, but Console only lists `:3000`. Fix: add the missing URI to the Console's "Authorized redirect URIs" list under the OAuth 2.0 Client ID's configuration. Don't change `BETTER_AUTH_URL` to match Console — change Console to match where the app actually runs.
</details>

**2.** A user has a Buddies account with password (signed up earlier via `/sign-up`). They click "Sign in with Google" and Google verifies they're the same email. What happens in Atlas?

<details>
<summary>Show answer</summary>

With Better Auth's `trustedProviders` defaults, Google's verified email matches the existing `User.email`, so the two are **linked** — a new `Account` row is created with `providerId: "google", accountId: <their-google-id>`, linked to the **existing** `User.id`. Now they have two `Account` rows: `credential` (with password hash) and `google`. They can sign in via either path; same user, same data. The session cookie is set; they're signed in.
</details>

**3.** Where in the OAuth handshake does the session cookie actually get set?

<details>
<summary>Show answer</summary>

In step 6e — after Better Auth has exchanged the code for tokens, fetched Google's user info, and created/updated `User` + `Account` rows. The session cookie is set via the response headers of the callback URL (step 6f's redirect). The browser saves the cookie and includes it on every subsequent request. The Google handshake never directly sees or sets our cookie.
</details>

**4.** Why must `GOOGLE_CLIENT_SECRET` be on the server side only, never in client JS?

<details>
<summary>Show answer</summary>

Because the secret is what proves to Google's token endpoint that *we* (not an attacker impersonating us) are making the request. Step 6b uses the secret to exchange the auth code for tokens. If a Client Component or browser JS could see the secret, any user could read it (it'd be in the network response or compiled bundle), and then anyone could pretend to be Buddies — they could trade auth codes for tokens, get user data, even impersonate users in API calls. Server-only is non-negotiable.
</details>

**5.** If `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are both `""` (empty strings) because we forgot to set them in `.env.local`, does `pnpm build` fail?

<details>
<summary>Show answer</summary>

No — that's the entire reason for the `?? ""` lazy fallback. The build evaluates the `betterAuth({ ... })` call at module load; it accepts empty strings without complaint. The failure surfaces only at runtime: when the user clicks "Sign in with Google," Better Auth constructs the Google authorize URL with an empty `client_id`, redirects to Google, and Google rejects with `invalid_client`. We see this in the browser. Clear error, no broken build. Same architectural choice we made for Resend in Day_32.
</details>

---

## 📌 Key Takeaways

- **OAuth handshake has 7 steps.** Sign-in click → Google authorize URL → consent → callback → token exchange → user info fetch → session creation → final redirect.
- **`BETTER_AUTH_URL` must match the Google Console's registered redirect URI exactly.** Any mismatch = `redirect_uri_mismatch` error before our backend even sees the request.
- **`Account` table holds the link between a `User` and a provider.** One user can have many Account rows (password + Google + future GitHub).
- **`socialProviders.google` config is two lines** in `lib/auth.ts`: clientId, clientSecret.
- **Use lazy fallback (`?? ""`)** so the build passes without creds — failures surface as runtime errors with clear messages.
- **`GOOGLE_CLIENT_SECRET` is a real secret.** Never commit. `.env.local` only. Rotate on leak.
- **OAuth gives us name + email + image for free.** Magic-link / password sign-ups have null images; Google users get an avatar from day one.
- **Other providers (GitHub, Apple, Discord) are copy-paste extensions.** Add another `socialProviders` entry and a button — same shape, different config.
- **Scope guardrail:** Day_35 only does Google. No "connect your Google account from a profile page," no other providers, no custom scopes. Those are later.

---

## 🔗 References

- [Google Cloud — OAuth 2.0 setup for web apps](https://developers.google.com/identity/protocols/oauth2/web-server)
- [Better Auth — Social sign-in](https://www.better-auth.com/docs/concepts/social-sign-in)
- [Better Auth — `google` provider config](https://www.better-auth.com/docs/authentication/google)
- [OAuth 2.0 spec — Authorization Code flow](https://datatracker.ietf.org/doc/html/rfc6749#section-4.1)
- Local: [Day 7 — Better Auth Overview](./day7_better_auth_overview.md) — the plugin model and Account table intro
- Local: [Day 7 — Email/Password Flow](./day7_email_password_flow.md) — the Server Action pattern this builds on

---

## ➡️ What's Next?

- **`Day_34` (next commit)** — Manual walkthrough plan-file: register the Google OAuth app in Cloud Console. No code change in the repo, just a guide you follow whenever convenient. After this, your `.env.local` has `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
- **`Day_35`** — Apply this doc. `lib/auth.ts` gets `socialProviders.google`, sign-in page gets the third option button. End-to-end OAuth works when creds are populated.
- **`Day_36`** — Close-out. Auth Detour ends. Day 2 / Day 6 / Day 7 progress tracker rows flip simultaneously.
