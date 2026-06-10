# Day_34_Register_google_oauth_app_and_set_env

## Goal

**Infra commit — no code change.** Ships a guided walkthrough for **registering a Google OAuth 2.0 client in Google Cloud Console** and pasting the resulting `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` into `.env.local`. The plan file IS the deliverable; the cloud work happens in your browser, on your own schedule.

After this commit, your `.env.local` has both env vars populated. `Day_35` (the next commit) then wires `lib/auth.ts` to use them — `pnpm build` passes regardless, but the runtime "Sign in with Google" round-trip only succeeds once these creds are in place.

This commit can land **before** you actually do the manual setup (per the approved autonomous loop scope). The checklist row flips to ✅ because the *walkthrough* is in the repo; you populate creds whenever convenient.

## Summary

**Files at a glance**

| Group     | Files                                                          |
| --------- | -------------------------------------------------------------- |
| Plan doc  | `plans/Day_34_Register_google_oauth_app_and_set_env.md`        |
| Index     | `docs/README.md` (Auth Detour checklist row flipped)           |

**What you'll do / what you'll see**

| Step                                                                                 | What happens                                                                                |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| Sign in to https://console.cloud.google.com (any Google account)                    | Google Cloud dashboard. |
| Create a new project named "Buddies dev" (or similar)                              | Takes ~30 seconds to provision. |
| Configure OAuth consent screen → External → fill in app name, support email, scopes (`openid`, `email`, `profile`) | Consent screen drafted in Testing mode (limited to listed test users until verified). |
| Credentials → Create credentials → OAuth 2.0 Client ID → "Web application"          | Two new values: client ID (public) and client secret (sensitive). |
| Add `http://localhost:3000/api/auth/callback/google` to "Authorized redirect URIs" | Tells Google which return URL is trusted. |
| Copy client ID + client secret                                                       | You'll paste these into `.env.local` in the next step. |
| Paste into `.env.local` as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`           | Local-only; gitignored. |

> The commit itself only ships the plan file + a checklist row flip. **The actual cloud work happens in your browser whenever you're ready.**

## Commands

```bash
# After registering the OAuth app in the browser:
# Open .env.local and add (or fill in) these lines:
#   GOOGLE_CLIENT_ID="<paste client ID here>"
#   GOOGLE_CLIENT_SECRET="<paste client secret here>"

# Verify the env vars are picked up (don't print the secret):
grep '^GOOGLE_CLIENT_ID=' .env.local | wc -c     # > 20 means populated
grep '^GOOGLE_CLIENT_SECRET=' .env.local | wc -c # > 20 means populated
```

## Files changed

- `plans/Day_34_Register_google_oauth_app_and_set_env.md` — **created**: this file. Contains the **full guided walkthrough** below.
- `docs/README.md` — **edited**: Auth Detour checklist row "Google Cloud Console OAuth app registered + env vars set" flips from **Concepts pending ⏳** to **Concepts covered ✅**, tagged `Day_34`. Covered: 18 → 19; pending: 3 → 2.

No code change. No `lib/auth.ts` change. No `.env.example` change (the `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` lines were scaffolded in `Day_21`, so the contract is already documented).

## Verification

1. After completing the walkthrough below: Google Cloud Console shows a "Buddies dev" project with an active OAuth 2.0 Client ID under Credentials.
2. The Authorized redirect URIs list contains `http://localhost:3000/api/auth/callback/google` (and any other URLs you sometimes run dev on, e.g. `:3001`).
3. Your `.env.local` has `GOOGLE_CLIENT_ID="…"` and `GOOGLE_CLIENT_SECRET="…"` lines, **both populated** (not empty strings).
4. `docs/README.md` Auth Detour Checklist shows "Google Cloud Console OAuth app registered + env vars set" under **Concepts covered ✅** with `Day_34` tag. Covered: **19**, pending: **2**.

---

## 🛣️ Full Google Cloud Console Walkthrough (Manual Steps)

This is the same shape as `Day_17`'s Atlas walkthrough — opinionated steps you can follow without trial and error. Estimated time: **~10–15 minutes** the first time, ~3 minutes if you've done it before.

### Step 1 — Sign in to Google Cloud Console (~30 sec)

1. Open https://console.cloud.google.com.
2. Sign in with the Google account you want to *administer* the OAuth client. This can be your personal account or a workspace account — it doesn't need to match the email you'll later sign in to Buddies with.
3. Accept any terms of service prompts on first use.

### Step 2 — Create a new project (~1 min)

1. Top-left, click the project picker (next to "Google Cloud" logo).
2. Click **New Project** (top-right of the modal).
3. **Project name**: `Buddies dev` (or any name — this is just a label).
4. **Organization / Location**: leave defaults (no org if personal account).
5. Click **Create**. Project provisions in ~10 seconds.
6. After provisioning, make sure the project picker shows "Buddies dev" — switch to it if it doesn't.

### Step 3 — Configure the OAuth consent screen (~3 min)

The consent screen is what users see when Google asks "Buddies wants to know your email & profile — allow?". You must configure it once before creating an OAuth client.

1. From the left nav (hamburger menu top-left): **APIs & Services → OAuth consent screen**.
2. **User Type**: pick **External**.
   - External = any Google account holder can sign in (correct for Buddies, an anyone-signs-up app).
   - Internal = only your Google Workspace org (wrong here — it'd lock out the world).
3. Click **Create**.
4. **App information** page:
   - **App name**: `Buddies` (this is what users see on the consent screen).
   - **User support email**: your email.
   - **App logo**: optional, skip for dev.
5. **App domain**:
   - **Application home page**: skip for dev.
   - **Application privacy policy / terms of service**: skip for dev. Will need these before production verification.
6. **Authorized domains**: skip for `localhost` dev. Add your real domain later.
7. **Developer contact information**: your email.
8. Click **Save and Continue**.
9. **Scopes** page: click **Add or Remove Scopes**. Tick:
   - `openid`
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   Then click **Update** at the bottom of the modal.
10. Back on the scopes page, click **Save and Continue**.
11. **Test users** page: add your own Google email as a test user.
    - **Why:** External apps default to "Testing" mode. Only listed test users can complete the sign-in flow until the app is verified by Google. You can have up to 100 test users.
    - For Buddies dev, list yourself + any other emails you want to test with.
    - Click **Add Users**, paste emails, **Add**.
12. Click **Save and Continue**.
13. **Summary** page — review, then click **Back to Dashboard**.

### Step 4 — Create the OAuth 2.0 Client ID (~2 min)

This is the actual credential pair Better Auth will use.

1. From the left nav: **APIs & Services → Credentials**.
2. Click **+ Create credentials** (top of page) → **OAuth client ID**.
3. **Application type**: **Web application**.
4. **Name**: `Buddies dev (localhost)` (just a label; not user-facing).
5. **Authorized JavaScript origins**: skip — Better Auth uses server-side OAuth, not implicit flow.
6. **Authorized redirect URIs**: click **+ Add URI**, paste:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
   - **This must match exactly what Better Auth sends.** With `BETTER_AUTH_URL=http://localhost:3000` (from `Infra_02`'s `.env.example`), Better Auth builds the redirect URI as `${BETTER_AUTH_URL}/api/auth/callback/google` = `http://localhost:3000/api/auth/callback/google`. Any character difference = `redirect_uri_mismatch` error at sign-in time.
7. (Optional) If you sometimes run dev on a different port (e.g. when 3000 is busy and Next switches to 3001), click **+ Add URI** again and add `http://localhost:3001/api/auth/callback/google`. You can have many URIs.
8. Click **Create**.
9. A modal pops up showing:
   - **Client ID**: a long string ending in `.apps.googleusercontent.com`
   - **Client secret**: starts with `GOCSPX-`
10. **Click the copy icon** next to each. Paste both into a safe scratchpad (you'll move them to `.env.local` in the next step).
11. Click **OK** to dismiss the modal.
    - **Note:** You can revisit the secret later by clicking the OAuth client name in the Credentials list, then "Download JSON" or copying the secret again.

### Step 5 — Paste into `.env.local` (~1 min)

1. From the repo root, open `.env.local` in your editor.
2. Find these two lines (scaffolded by `Day_21`):
   ```env
   GOOGLE_CLIENT_ID=""
   GOOGLE_CLIENT_SECRET=""
   ```
3. Paste the values you copied between the quotes:
   ```env
   GOOGLE_CLIENT_ID="123456789-abcdefghij.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="GOCSPX-aBcDeFgHiJkLmNoP_qrStUv"
   ```
4. Save. `.env.local` is gitignored (`.env*.local` pattern in `.gitignore` since `Infra_03`).

### Step 6 — (After Day_35 ships) Verify in dev (~1 min)

Once `Day_35`'s code lands:
1. `pnpm dev` (or restart if already running — env vars are read at startup).
2. Browse to `http://localhost:3000/sign-in`.
3. Click the **"Sign in with Google"** button.
4. You'll be redirected to Google's consent screen. Pick the Google account you added as a test user.
5. Click **Allow**.
6. You'll be redirected back to `/` signed in — your Google name shows in the header.
7. Check Atlas → Browse Collections:
   - `user` collection has a row with your Google name + email + image URL.
   - `account` collection has a row with `providerId: "google"` and `accountId: <your-google-user-id>`, linked to that user.

---

## Gotchas / decisions

- **External vs Internal:** External is the right choice for an anyone-signs-up product. Internal would limit sign-in to your own Google Workspace org. Don't pick Internal unless you have a Workspace and explicitly want to lock the app to it.
- **Testing mode is fine for the detour.** External apps default to "Testing" — only listed test users (up to 100) can sign in. For learning-project / personal use this is fine. Production launch needs Google's verification (submit your app for review; takes a few days). Deferred.
- **`http://localhost` is allowed by Google for OAuth.** No HTTPS needed for `localhost` redirects. For any other domain Google requires HTTPS.
- **The client secret can be rotated.** If it leaks, go to Credentials → click the OAuth client → "Reset Secret" → update `.env.local`. All previously-issued tokens stay valid (they're signed with the *current* secret at issue time, not validated against the secret on every request).
- **Multiple redirect URIs are fine.** Register dev, staging, prod, even Vercel preview deploys — Google allows many.
- **The OAuth consent screen project name is user-facing.** "Buddies" is what shows on the consent prompt. If you want to ship to real users, polish this (logo, privacy policy, terms of service, verified domain).
- **You can skip Step 6 verification until `Day_35` ships.** This commit's job is to register the OAuth app and document the walkthrough; testing the full sign-in flow requires `Day_35`'s code (the button + the `socialProviders.google` config). If you do the manual setup before `Day_35`, you'll just have unused creds sitting in `.env.local` — harmless.
- **If you forget to add yourself as a test user**, the sign-in flow will fail with Google's "Access blocked: This app's request is invalid" error. Just go back to the consent screen → Test users → add yourself → retry.
- **The redirect URI is the most common bug.** If you see `redirect_uri_mismatch` later (after `Day_35`), check the URI in Console matches what Better Auth sends *exactly* — including protocol, host, port, and path. Trailing slash counts as a difference.
- **`Day_35` can land before the manual setup is complete.** The lazy-fallback pattern (`process.env.GOOGLE_CLIENT_ID ?? ""`) means `pnpm build` passes even with empty creds. Only the user-clicks-the-button path needs real creds. So the loop's autonomous progress isn't gated on you doing the manual step *right now*.
