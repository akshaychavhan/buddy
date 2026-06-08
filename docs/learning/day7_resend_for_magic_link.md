# Day 7 — Resend for Magic-Link Sign-In

> **Created:** 2026-06-08
> **Phase:** 3 — Auth & Backend Wiring (pulled forward by the Auth Detour, narrow slice)

---

## 🎯 What Are We Learning?

How to add **magic-link sign-in** — passwordless authentication via a one-time link emailed to the user. After `Day_32` ships, a user can type their email on the sign-in page, click "Email me a link," receive a Resend-sent email, click the link, and end up signed in. No password, no remembering, no password-strength meter.

By the end of this doc you should know:

1. What Resend is and why we picked it (vs. SendGrid, Postmark, AWS SES, raw SMTP).
2. The minimum API surface: one `pnpm add resend`, one `lib/email.ts` with a single `sendMagicLink` function, one Better Auth plugin call.
3. The exact end-to-end flow: form submit → Better Auth generates a token → writes to the `Verification` table → invokes our `sendMagicLink` → email arrives → user clicks → Better Auth validates → session created.
4. The deferred scope: this is the *magic-link slice* of Resend. Day 11 (per PROMPT.md) brings the rest — trip invitations, reminders, broadcast emails. We're not building that today.

`Day_32` ships the code. This doc is the *why* + the contract.

---

## 🤔 Why Does This Matter?

Email/password works (Day_26 ships it), but it carries real UX cost: users forget passwords. The classic recovery flow ("forgot password?") sends a one-time link to the email anyway — so why not skip the password entirely?

Magic-links collapse three flows into one:

| Old (password) | New (magic-link) |
|---|---|
| Sign-up: type email + password | Sign-up: type email → click email → done |
| Sign-in: type email + password | Sign-in: type email → click email → done |
| Forgot password: type email → click email → set new password | (doesn't exist; there's no password) |

The same flow handles new users and returning users. The same flow handles "forgot my password" implicitly. The password-strength meter, the bcrypt-or-scrypt-or-Argon2 decision, the "rotate after breach" headache — all gone.

The trade-off: **users need email access**. If your inbox is compromised, all your magic-link accounts are too. (Same as password reset, but more direct.) The threat model is: assume the user controls their email. If they don't, the security story changes — but at that point password reset is also broken.

For Buddies, magic-link is the *better default* for a trip-planning app: low friction, low cognitive load, low support cost. We're keeping email/password as a parallel option (some users prefer passwords, and password managers fill them); magic-link is just one more sign-in method.

---

## 🧠 How It Works (The Concept)

### What Resend is

**Resend** (resend.com) is a transactional email API. You send `POST /emails` with `{ from, to, subject, html }` and they deliver. They handle:
- **Authenticated sender** via DKIM/SPF/DMARC — emails don't land in spam.
- **High deliverability** — better than rolling your own SMTP from a fresh DigitalOcean droplet.
- **Webhook callbacks** for bounce / spam-complaint tracking.
- **A free tier** that's generous enough for a learning project (3,000 emails/month, 100/day).

The API surface is famously small: one POST endpoint. The Node SDK is a thin wrapper around it.

### Why Resend specifically

| | Resend | SendGrid | Postmark | AWS SES | Raw SMTP |
|---|---|---|---|---|---|
| Free tier | 3k/month forever | Trial only | Trial only | Pay per email (~$0.10/1k) | Free (your costs) |
| Setup time | ~10 min | ~30 min | ~30 min | ~1 hour (DKIM, DNS) | hours |
| SDK quality | Tiny, modern | Sprawling | Decent | AWS SDK overhead | None |
| DKIM/DMARC | Auto | Manual | Manual | Manual | DIY |
| Built for transactional | Yes | Yes (also marketing) | Yes | Generic | DIY |
| React Email templates | First-party | No | Add-on | No | DIY |

For a learning project where shipping speed matters and we'll never approach 100 emails/day, Resend wins on developer experience.

The downside: **you're locked into Resend's API** (small surface, but still). For a real product at scale you might keep your own abstraction layer to swap providers later. For Buddies, the abstraction *is* `lib/email.ts` — if we ever swap, it's one file to rewrite.

### The full magic-link flow

End to end, with every step labelled:

```
┌──────────────────────────────────────────────────────────────────────┐
│  1. User types email on /sign-in (or /sign-up), clicks "Email link"  │
└──────────────────────────────────────────────────────────────────────┘
         │  POST /api/auth/magic-link with { email }
         ▼
┌──────────────────────────────────────────────────────────────────────┐
│  2. Better Auth (server-side):                                        │
│      a. Generate a random token (cryptographically secure)            │
│      b. Insert Verification row: { identifier: email, value: token,   │
│         expiresAt: now + 10min }                                       │
│      c. Build link URL: ${BETTER_AUTH_URL}/api/auth/magic-link/verify │
│         ?token=<token>&email=<email>                                  │
│      d. Call OUR sendMagicLink({ email, url, token }) callback        │
└──────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────────────┐
│  3. Our lib/email.ts sendMagicLink:                                   │
│      await resend.emails.send({                                       │
│        from: EMAIL_FROM,                                              │
│        to: email,                                                     │
│        subject: "Sign in to Buddies",                                 │
│        html: `<a href="${url}">Click to sign in</a>`,                 │
│      })                                                               │
└──────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────────────┐
│  4. Resend → user's inbox in ~5 seconds                               │
└──────────────────────────────────────────────────────────────────────┘
         │  User clicks link
         ▼
┌──────────────────────────────────────────────────────────────────────┐
│  5. Browser → GET /api/auth/magic-link/verify?token=...&email=...     │
│                                                                       │
│     Better Auth (server-side):                                        │
│      a. Look up Verification row by (identifier, value)               │
│      b. Check expiresAt > now                                         │
│      c. Find or create the User row by email                          │
│      d. Create a Session row + set the session cookie                 │
│      e. Delete the Verification row (one-time use)                    │
│      f. Redirect to "/"                                               │
└──────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────────────┐
│  6. Browser at "/" with cookie set. User is signed in.                │
└──────────────────────────────────────────────────────────────────────┘
```

The user types one thing (their email) and clicks two things (the form button, then the email link). That's the whole interaction.

### The minimum API surface (what Day_32 ships)

Three pieces:

**(a) `lib/email.ts`** — a single function that wraps Resend.

```ts
// lib/email.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type SendMagicLinkArgs = {
  email: string;
  url: string;
};

export async function sendMagicLink({ email, url }: SendMagicLinkArgs) {
  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: email,
    subject: "Sign in to Buddies",
    html: `
      <p>Hello,</p>
      <p>Click the link below to sign in to Buddies:</p>
      <p><a href="${url}">Sign in to Buddies</a></p>
      <p>This link expires in 10 minutes. If you didn't request it, ignore this email.</p>
    `,
  });
}
```

A single export, no class, no complicated config. The HTML is intentionally bare-bones — fancy React Email templates can come later.

**(b) `lib/auth.ts` update** — wire the magic-link plugin into Better Auth.

```ts
// lib/auth.ts (delta)
import { betterAuth } from "better-auth";
import { magicLink } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { prisma } from "@/lib/prisma";
import { sendMagicLink } from "@/lib/email";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "mongodb" }),
  emailAndPassword: { enabled: true },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await sendMagicLink({ email, url });
      },
    }),
  ],
});
```

The `plugins: [magicLink({ sendMagicLink })]` block is the entire wiring. Better Auth handles token generation, the Verification table, the verify route, expiration. We supply the email-sending callback.

**(c) `app/(auth)/sign-in/page.tsx` & `actions.ts` update** — add a magic-link button next to the password form.

The sign-in page becomes "Email + Password" (existing) OR "Email me a link" (new). One additional form. The Day_26 sign-in code stays; we add a parallel `magicLinkAction` and a second button.

That's it. Three file edits in `Day_32`. No new Prisma model needed — `Verification` was already generated by the Better Auth CLI in `Day_22`.

### Why we use `Verification` (the already-existing table)

Day_22's CLI run wrote four models: `User`, `Session`, `Account`, and `Verification`. We didn't use `Verification` yet — it was waiting for this commit. Its purpose: store one-time tokens like magic-link verifications, email-verification codes, password-reset tokens, etc.

```prisma
model Verification {
  id         String   @id @map("_id")
  identifier String                                   // the email (or user ID)
  value      String                                   // the random token
  expiresAt  DateTime                                 // 10-15 min from creation
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([identifier])
}
```

Each magic-link request inserts a row. Each click-and-verify deletes it. Better Auth handles the lifecycle; we just had to have the table.

### What this is NOT (deferred to Day 11)

This commit only adds **magic-link**. It does *not* add:

- Trip invitation emails ("Akshay invited you to plan a Goa trip")
- Reminder emails ("Your Tokyo trip starts in 3 days — pack your camera!")
- Receipt emails
- Newsletter / marketing emails
- React Email templates with branded design
- Webhook handling for bounces
- Email-open / click tracking

All those are Day 11 territory per PROMPT.md. We're pulling forward just enough Resend to satisfy auth, then closing the slice.

---

## 💻 Tiny Isolated Example

The full email send in 10 lines, isolated from any framework:

```ts
import { Resend } from "resend";

const resend = new Resend("re_..."); // your API key

await resend.emails.send({
  from: "Buddies <noreply@yourdomain.com>",
  to: "user@example.com",
  subject: "Hello",
  html: "<p>This is a test.</p>",
});
```

This works in any Node script. The Better Auth integration is just plugging this kind of call into the `magicLink` plugin's `sendMagicLink` callback.

---

## 🚀 Applied to Buddies

> See: [Task — Auth Detour](../task/) — task doc will land in `Day_32`.

`Day_32` ships three file changes:

| File | Change |
|---|---|
| `lib/email.ts` | **Created.** Single `sendMagicLink(args)` export wrapping Resend. ~20 lines. |
| `lib/auth.ts` | **Edited.** Add `plugins: [magicLink({ sendMagicLink: ... })]` to the betterAuth config. ~5 line addition. |
| `app/(auth)/sign-in/page.tsx` and `app/(auth)/sign-in/actions.ts` | **Edited.** Add a second form ("Email me a link") + `magicLinkAction` Server Action that calls `auth.api.signInMagicLink({ body: { email }, ... })`. ~30 line addition across both files. |

Plus `pnpm add resend` (package install) and a **manual Resend account setup** before `Day_32`'s commit can be tested end-to-end.

After `Day_32`:
- `/sign-in` shows two forms: password (existing) and magic-link (new).
- Type email + click "Email me a link" → email arrives within ~5 seconds.
- Click the email link → signed in, cookie set, redirect to `/`.

---

## ⚠️ Gotchas & Beginner Mistakes

1. **`RESEND_API_KEY` must be set.** Resend's free tier gives you a key on signup. Paste into `.env.local`. Without it, `resend.emails.send` will throw `401 Unauthorized` at call time — not at boot, so the error only surfaces when a user requests a magic-link.

2. **`EMAIL_FROM` must be a verified sender.** Resend rejects emails from unverified domains. Two paths:
   - **Easiest for dev:** use Resend's `onboarding@resend.dev` testing address. Always works, no DNS setup. But you can only send to your own verified email.
   - **For real use:** verify a custom domain in the Resend dashboard (TXT records for DKIM, SPF). After verification, `noreply@yourdomain.com` works.
   We'll use `onboarding@resend.dev` for the detour to skip DNS work.

3. **The link URL contains the token in cleartext.** Anyone who reads the email can sign in as the user. Magic-link security assumes the user controls their inbox. If you wouldn't send a password reset to that email, don't use magic-link there.

4. **Tokens are one-time.** Once verified, the row is deleted. If the user clicks twice, the second click 404s. Real apps sometimes display "Link expired or already used" on this path; for the detour we accept Better Auth's default behavior (redirect to the sign-in page with an error).

5. **10-minute expiry is the default.** Better Auth's `magicLink` plugin defaults to 10 minutes. You can override (`magicLink({ expiresIn: 60 * 30, sendMagicLink: ... })` for 30 minutes), but the default is fine.

6. **Magic-link creates the user automatically.** If the email doesn't exist in `User`, Better Auth creates the row on first verify. So magic-link is *also* sign-up. No separate signup flow needed for magic-link users.

7. **The `Verification` row's `value` is the token itself, not a hash.** Anyone with DB read access could exfiltrate active tokens and sign in. For a learning project this is acceptable; for production, consider rotating tokens or using a hashed reference (Better Auth doesn't ship this OOTB).

8. **Resend logs the email subject + recipient.** They redact the body, but subject and `to` are stored for delivery debugging. Don't put sensitive data in subject lines.

9. **Email arrives in ~5 seconds**, sometimes longer. Don't show the user "Link sent! Click within 1 second" — be generous: "Check your inbox (and maybe spam folder)."

10. **Spam folder is a real concern** even with Resend. First-time recipients sometimes find magic-link emails in spam. We'll add a "Didn't receive it? Check spam, or try again in 30 seconds" hint in the UI.

---

## 🧪 Quick Quiz

**1.** Why does Better Auth need a `sendMagicLink` callback from us instead of just having a built-in Resend integration?

<details>
<summary>Show answer</summary>

Better Auth is provider-agnostic. They don't want to take on a Resend dependency (or SendGrid, or Postmark, or Mailgun) because users have different preferences. The plugin contract is: "Better Auth will give you the email address and a verification URL — you decide how to send it." For Buddies that's Resend, but the next person's app might use Postmark or AWS SES with no code change to Better Auth itself.
</details>

**2.** A user clicks their magic-link 15 minutes after requesting it. What happens?

<details>
<summary>Show answer</summary>

The token's `expiresAt` is 10 minutes from creation (Better Auth's default). Verification fails because the row's `expiresAt < now`. Better Auth deletes the expired row and redirects to `/sign-in` (or shows an "expired" error, depending on configuration). User has to request a new link.
</details>

**3.** I want to also send a "Welcome to Buddies!" email after a user signs up via magic-link. Where does that go?

<details>
<summary>Show answer</summary>

**Not here.** That's Day 11 territory (broader Resend / transactional email). For the auth detour we're pulling forward ONLY the magic-link slice. Adding a welcome email would mean a new `sendWelcomeEmail` function, a hook into Better Auth's `user.created` event, plus template work. It's the kind of scope creep that turns a 22-commit detour into a 35-commit detour. Defer it.
</details>

**4.** Could I skip Resend entirely and just `console.log` the magic-link URL in dev?

<details>
<summary>Show answer</summary>

For dev, absolutely — and that's actually a recommended pattern when iterating: `sendMagicLink: async ({ email, url }) => { console.log(`Magic link for ${email}: ${url}`) }`. You then copy-paste the URL from the terminal. Saves dev cycles and uses no email quota. We could even gate Resend behind a `process.env.NODE_ENV === "production"` check. For Day_32 we use Resend in both dev and prod for consistency, but if free-tier limits become an issue, the console-log fallback is the obvious move.
</details>

**5.** Better Auth deletes the Verification row after a successful click. Why not keep it around for audit?

<details>
<summary>Show answer</summary>

Security: a stored, unhashed token is a liability. If someone reads the DB later, they shouldn't be able to extract a token that *was* used (and replay it within the 10-minute window). Auditing what users signed in is what the `Session` table is for — `session.createdAt`, `session.ipAddress`, `session.userAgent` give a full sign-in history. The verification token's job ends the moment it's used.
</details>

---

## 📌 Key Takeaways

- **Magic-link replaces "password + forgot-password" with "click email link".** Same flow handles sign-up, sign-in, recovery.
- **Resend** is the email provider — 3k/month free tier, tiny SDK, auto-DKIM, ~10 min setup. Good fit for learning + small apps.
- **One `lib/email.ts`** with a single `sendMagicLink` export is the entire abstraction layer.
- **Better Auth's `magicLink` plugin** handles tokens, Verification rows, 10-min expiry, one-time use. We supply only the email-sending callback.
- **`Verification` table** was already created by the Day_22 CLI run; Day_32 finally uses it.
- **Use `onboarding@resend.dev` for dev**, verify a real domain only for production.
- **Tokens are one-time.** Once clicked, the row is deleted.
- **Magic-link creates the user automatically** if their email isn't in `User` yet — so it's sign-up + sign-in in one flow.
- **Scope stays narrow:** only magic-link in this detour. Trip invitations, reminders, etc. = Day 11 proper.

---

## 🔗 References

- [Resend docs — Send emails](https://resend.com/docs/send-with-nodejs)
- [Better Auth — Magic Link plugin](https://www.better-auth.com/docs/plugins/magic-link)
- [Better Auth — Plugin contract](https://www.better-auth.com/docs/concepts/plugins)
- Local: [Day 7 — Better Auth Overview](./day7_better_auth_overview.md) — the plugin model
- Local: [Day 7 — Email/Password Flow](./day7_email_password_flow.md) — Server Action pattern this builds on

---

## ➡️ What's Next?

- **`Day_32` (next commit)** — Apply this doc. `pnpm add resend`, write `lib/email.ts`, update `lib/auth.ts` with the plugin, add the magic-link form + action to `/sign-in`. **Manual setup needed first:** create Resend account, get API key, paste into `.env.local`.
- **Phase F** — `Day_33`–`Day_35`: Google OAuth (Cloud Console setup + provider config + button).
- **Phase G** — `Day_36`: close-out. Flip Day 2, Day 6 (partial), Day 7 tracker rows.
- **Day 11 proper** — broader Resend usage: trip invitations, reminders, etc.
