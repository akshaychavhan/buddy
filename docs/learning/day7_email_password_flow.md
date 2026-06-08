# Day 7 — Email/Password Sign-Up & Sign-In: The Server Action Flow

> **Created:** 2026-06-04
> **Phase:** 3 — Auth & Backend Wiring (pulled forward by the Auth Detour)

---

## 🎯 What Are We Learning?

How a **Server Action** moves a form submission from the browser, through Next.js, through Better Auth, into MongoDB, and back to the browser as a cookie + redirect — without any client-side `fetch`, without an API call from React, without `useEffect`. By the end of this doc you should be able to:

1. Sketch the full request lifecycle of a sign-up form, from `<button type="submit">` click to "you're signed in" — including which steps run on the server, which run in the browser, and which serialize across the boundary.
2. Explain what `"use server"` does and why a Server Action is *not* a Client Component event handler in disguise.
3. Write the validation + error-handling pattern we'll use in `Day_25` (sign-up) and `Day_26` (sign-in) — including how to bubble validation errors back to the form without page reload.
4. Recognize the five common foot-guns: `<form action={...}>` vs `onSubmit`, `redirect()` only works server-side, `cookies()` is read-only in some contexts, and so on.

The next two code commits apply this doc directly — `Day_25` creates `/sign-up` and `Day_26` replaces the `/sign-in` stub with the real form.

---

## 🤔 Why Does This Matter?

In a Pages Router (or Vite + React) app, a sign-up form usually looks like this:

```tsx
"use client";
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState<string>();

async function onSubmit(e: FormEvent) {
  e.preventDefault();
  const res = await fetch("/api/sign-up", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    setError(await res.text());
    return;
  }
  router.push("/");
}
```

Six things going on: form state, controlled inputs, fetch boilerplate, JSON serialization, error state, client-side redirect. The form **must** be a Client Component — `useState` + `onSubmit` are browser-only. Every byte of the form's logic ships to the browser.

The App Router collapses this. With Server Actions:

```tsx
// app/(auth)/sign-up/page.tsx — Server Component
import { signUpAction } from "./actions";

export default function SignUpPage() {
  return (
    <form action={signUpAction}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit">Sign up</button>
    </form>
  );
}
```

```ts
// app/(auth)/sign-up/actions.ts
"use server";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function signUpAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  await auth.api.signUpEmail({
    body: { email, password, name: email.split("@")[0] },
    headers: headers(),
  });
  redirect("/");
}
```

The form is a Server Component. No `useState`, no `onSubmit`, no `fetch`. The form's `action={signUpAction}` reference is *not* a function passed to the browser — it's a **server-side function reference** that Next.js serializes into the HTML as a hidden POST endpoint. When the user clicks Submit, the browser POSTs the form data; Next.js receives it, looks up `signUpAction` by its server-only ID, and runs it. The browser never sees JavaScript for any of this.

That's the pitch. Now let's understand the mechanics.

---

## 🧠 How It Works (The Concept)

### `"use server"` — the inverse of `"use client"`

Day 4's RSC-vs-Client doc covered `"use client"` (file becomes a Client Component, ships JS to the browser). `"use server"` is the inverse: it marks a *function* (not a whole file's components) as a **Server Action**.

You can put `"use server"` at the **top of a file**, in which case every exported function in that file is a Server Action:

```ts
// app/(auth)/sign-up/actions.ts
"use server";

export async function signUpAction(formData: FormData) { ... }
export async function checkEmailExists(email: string) { ... }
// both are Server Actions
```

Or you can put it **inside a function body**, in which case just that one function is a Server Action:

```tsx
// app/(auth)/sign-up/page.tsx (Server Component)
export default function SignUpPage() {
  async function signUpAction(formData: FormData) {
    "use server";
    // ...
  }
  return <form action={signUpAction}>...</form>;
}
```

For Buddies we'll use the file-level form — separates concerns, easier to import.

### The lifecycle of a `<form action={serverAction}>` submission

Walk through what happens when a user clicks "Sign up":

```
┌────────────────────────────────────────────────────────────────┐
│ 1. User types email + password → clicks <button type="submit">  │
└────────────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────────┐
│ 2. Browser collects form fields into FormData                   │
│    POST /sign-up                                                │
│    Content-Type: multipart/form-data                            │
│    Body: email=...&password=...&[hidden Server-Action-ID]      │
└────────────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────────┐
│ 3. Next.js receives the POST, looks up the Server Action by    │
│    the hidden ID embedded in the form's metadata                │
└────────────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────────┐
│ 4. signUpAction(formData) runs ON THE SERVER                    │
│      ├─ formData.get("email")  →  string                       │
│      ├─ formData.get("password") →  string                     │
│      ├─ await auth.api.signUpEmail({ ... })                    │
│      │     ├─ Better Auth hashes password (scrypt)             │
│      │     ├─ Better Auth INSERTs into Mongo: user + account   │
│      │     ├─ Better Auth INSERTs into Mongo: session           │
│      │     └─ Better Auth returns { token, user }              │
│      └─ redirect("/")                                          │
└────────────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────────┐
│ 5. Next.js responds:                                            │
│      Status: 303 See Other  (or RSC re-render payload)          │
│      Location: /                                                │
│      Set-Cookie: better-auth.session_token=...;                 │
│                  Path=/; HttpOnly; SameSite=Lax                 │
└────────────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────────┐
│ 6. Browser follows redirect → renders home page                 │
│    Cookie is attached to every subsequent request               │
└────────────────────────────────────────────────────────────────┘
```

Three things to internalize:

- **No JavaScript ships to the browser** for the form itself. The Server Action is server-only.
- **`FormData` is the bridge.** The form's `name="email"` / `name="password"` attributes are what `formData.get("email")` reads. No JSON. No fetch.
- **`redirect()` is a *server-side* function** from `next/navigation`. Calling it throws a special error that Next catches to issue the 303. Don't put `redirect()` in a Client Component — it'll throw and burn.

### What `auth.api.signUpEmail(...)` actually does

We call this in `Day_25`'s action. Internally (in Better Auth's source):

1. **Validates inputs** — email format, password length (default min 8 chars).
2. **Checks for duplicate email** — `prisma.user.findUnique({ where: { email } })`. If exists, throws.
3. **Hashes the password** — scrypt with a random salt.
4. **Creates the User row** in Mongo via Prisma.
5. **Creates the Account row** linking user → "credential" provider with the hashed password.
6. **Creates the Session row** with a fresh token, 7-day expiry.
7. **Returns** `{ token, user }`.
8. **Sets the session cookie** (via `headers()` which Better Auth uses to write a `Set-Cookie`).

Steps 1–6 are DB writes. Step 8 is the cookie that makes the user logged in. After this, `auth.api.getSession({ headers: headers() })` will return a populated session.

### Validation: Zod or hand-rolled?

For Buddies, we'll keep `Day_25`/`Day_26` validation *minimal* — Better Auth already validates email format and password length on the server. We'll add basic client-side `required` and `type="email"` for browser-side feedback, and trust Better Auth for the rest.

When we get to **`Day_24` task forms** (trip creation) the validation gets richer, and we'll introduce Zod + `useFormState`. For auth, the conservative choice is: rely on Better Auth's server-side validation, surface errors via `useFormState`.

### Surfacing errors back to the form: `useFormState`

When `auth.api.signUpEmail` throws (duplicate email, weak password, etc.), the Server Action needs to *return* the error rather than crash. React's `useFormState` is the bridge:

```ts
// actions.ts
export async function signUpAction(
  prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  try {
    await auth.api.signUpEmail({ ... });
  } catch (err) {
    return { error: (err as Error).message };
  }
  redirect("/");
}
```

```tsx
// page.tsx — needs "use client" for useFormState
"use client";
import { useFormState } from "react-dom";
import { signUpAction } from "./actions";

const initialState = { error: null };

export function SignUpForm() {
  const [state, formAction] = useFormState(signUpAction, initialState);
  return (
    <form action={formAction}>
      <input name="email" />
      <input name="password" type="password" />
      {state.error && <p className="text-red-600">{state.error}</p>}
      <button type="submit">Sign up</button>
    </form>
  );
}
```

This adds Client Component overhead, but it's necessary for "show validation errors in place." Trade-off accepted.

For `Day_25`, we'll use the **`useFormState` pattern** — page stays a Server Component, form becomes a Client Component that imports the action.

### Redirect vs return — the subtle one

`redirect("/")` inside a Server Action **throws a special error** that Next.js catches and turns into a 303 response. **You can't put it in a `try/catch`** that catches *all* errors — it'd be swallowed:

```ts
// ❌ WRONG — redirect gets swallowed
try {
  await auth.api.signUpEmail({ ... });
  redirect("/");  // throws; caught by the catch below
} catch (err) {
  return { error: (err as Error).message };
}
```

Fix: call `redirect()` **outside** the try/catch, or check for it specifically:

```ts
// ✅ RIGHT
try {
  await auth.api.signUpEmail({ ... });
} catch (err) {
  return { error: (err as Error).message };
}
redirect("/");  // outside the try, only runs if no error
```

This is the most common Server Action footgun. Day_25 will follow the second pattern.

---

## 💻 Tiny Isolated Example

The minimal sign-up flow, with `useFormState` for inline errors:

```ts
// app/(auth)/sign-up/actions.ts
"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

type State = { error: string | null };

export async function signUpAction(
  _prev: State,
  formData: FormData,
): Promise<State> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = (formData.get("name") as string) || email.split("@")[0];

  try {
    await auth.api.signUpEmail({
      body: { email, password, name },
      headers: headers(),
    });
  } catch (err) {
    return { error: (err as Error).message };
  }
  redirect("/");
}
```

```tsx
// app/(auth)/sign-up/page.tsx
import { SignUpForm } from "./sign-up-form";

export default function SignUpPage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold">Create your account</h1>
      <SignUpForm />
    </div>
  );
}
```

```tsx
// app/(auth)/sign-up/sign-up-form.tsx
"use client";

import { useFormState } from "react-dom";
import { signUpAction } from "./actions";

const initialState = { error: null };

export function SignUpForm() {
  const [state, formAction] = useFormState(signUpAction, initialState);
  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input name="email" type="email" required />
      <input name="password" type="password" required minLength={8} />
      {state.error && <p className="text-red-600 text-sm">{state.error}</p>}
      <button type="submit">Sign up</button>
    </form>
  );
}
```

Three files:
- **`actions.ts`** — Server Action, calls Better Auth, returns errors, redirects on success.
- **`page.tsx`** — Server Component, renders the form.
- **`sign-up-form.tsx`** — Client Component (for `useFormState`), passes form data to the action.

This is exactly the shape `Day_25` will ship.

---

## 🚀 Applied to Buddies

> See: [Task — Auth Detour](../task/) — task doc will land alongside `Day_25`.

The next three code commits apply this doc:

| Commit | What ships |
|---|---|
| `Day_25_Add_sign_up_page_and_server_action` | `/sign-up` page + Server Action + Client form, exactly the example above. |
| `Day_26_Replace_sign_in_stub_with_real_form` | Same shape but `auth.api.signInEmail(...)` instead. Overwrites the Day_07 stub. |
| `Day_28_Add_sign_out_action_and_header_session_state` | Sign-out is simpler — no form, just a `<button>` inside a `<form action={signOutAction}>` in the header. |

Each will follow the **three-file pattern** (action / page / form), the **useFormState error pattern**, and the **redirect-outside-try-catch pattern**.

---

## ⚠️ Gotchas & Beginner Mistakes

1. **`redirect()` only works on the server.** Calling it from a Client Component throws *into the void* and the user sees nothing. If you need a client-side redirect (after a `useEffect`, say), use `useRouter().push("/")` from `next/navigation` instead.

2. **`redirect()` inside `try { ... }` gets swallowed.** Always call it *after* the `try/catch`. See the "subtle one" section above.

3. **`<form action={onClick}>` is NOT what you think.** The HTML `action` attribute traditionally takes a URL. With Server Actions, Next reuses the same attribute to take a function reference — but it's still a *server* function reference, not a client `onClick` handler. Don't write `onClick={...}` and `action={...}` together; the action wins.

4. **`useFormState` requires `"use client"`.** The hook lives in `react-dom` and only works in Client Components. That's why the form component is split out from the page.

5. **`auth.api.signUpEmail()` requires `headers: headers()`.** Forgetting this means Better Auth can't set the session cookie. The `headers()` function from `next/headers` gives the action the request headers; Better Auth's response then sets `Set-Cookie` through those.

6. **Server Actions are *not* RPC.** They look like "call this function from the browser," but they're a one-shot POST. You can't return arbitrary objects efficiently — the return value gets serialized to JSON and sent back. Don't try to return `Date` objects or class instances; stick to plain objects.

7. **`FormData.get("name")` returns `string | File | null`.** TypeScript will type it as `FormDataEntryValue | null`. Always cast or check: `formData.get("email") as string` (if you're confident it's there) or `String(formData.get("email") ?? "")` (defensive).

8. **The 8-character password minimum is a Better Auth default.** It's enforced server-side. You can override via `emailAndPassword: { minPasswordLength: 12 }` in `lib/auth.ts` — but we're keeping the default for the detour.

---

## 🧪 Quick Quiz

**1.** Where does the JavaScript for a Server Action ship — to the server, to the browser, or both?

<details>
<summary>Show answer</summary>

The function body itself ships only to the **server** — it's a server-side function. What ships to the browser is a *reference* (an opaque ID) embedded in the HTML as a hidden form field. When the user submits, the browser POSTs that ID + the form data; Next looks up the action server-side and runs it. The action's source code never reaches the browser.
</details>

**2.** Why is `<form action={signUpAction}>` valid, but `<form onSubmit={signUpAction}>` is not?

<details>
<summary>Show answer</summary>

`action={...}` is the Server Action protocol — Next.js intercepts it and routes the form submission through the Server Action lookup. `onSubmit={...}` is a Client Component DOM event handler — it expects a function that runs *in the browser*. A Server Action can't run in the browser (it imports server-only modules like `@/lib/auth`), so passing it to `onSubmit` would throw at submission time. Always use `action={...}` for Server Actions.
</details>

**3.** I wrote `redirect("/dashboard")` inside a Server Action's `try { ... } catch { return { error } }` block. The user signs up successfully but the form doesn't redirect — instead, the error UI shows "NEXT_REDIRECT". What went wrong?

<details>
<summary>Show answer</summary>

`redirect()` throws a special internal error (`NEXT_REDIRECT`) that Next normally catches and turns into a 303 response. By putting it inside a `try`, your `catch` is intercepting that error before Next sees it. The user's catch sees an error message containing "NEXT_REDIRECT" and reports it back to the form.

Fix: move `redirect("/dashboard")` outside the `try/catch`, so it only runs after a successful sign-up. The catch handles real errors; the redirect handles the success path.
</details>

**4.** What does `useFormState` give me that a regular `<form action={...}>` doesn't?

<details>
<summary>Show answer</summary>

It gives you **inline error feedback** without leaving the page. A plain `<form action={action}>` posts to the server, the action either succeeds (and `redirect()` navigates away) or throws (and you see Next's error page). With `useFormState`, the action can `return { error: "..." }` instead of throwing — and `useFormState` captures that return value as `state.error`, which you can render in the form. No reload, no navigation away from the form.

The cost: the form has to be a Client Component (`useFormState` lives in `react-dom`). For sign-up/sign-in, that's worth it.
</details>

**5.** I forgot `headers: headers()` in my `auth.api.signUpEmail({...})` call. The user gets created in MongoDB but they're not signed in afterwards. Why?

<details>
<summary>Show answer</summary>

`auth.api.signUpEmail()` uses the `headers` argument to set the session cookie in the response. The cookie says "this browser is now session XYZ." Without `headers: headers()`, Better Auth has no way to attach `Set-Cookie` to the outgoing response, so the user row gets created (the DB writes succeed) but the browser never gets the session cookie. Next request, no session = not signed in.

Always include `headers: headers()` when you want to sign someone in.
</details>

---

## 📌 Key Takeaways

- **`<form action={serverAction}>`** posts to a server-side function reference; the function never ships to the browser.
- **`"use server"`** marks a function (file-level or inline) as a Server Action. Inverse of `"use client"`.
- **`FormData.get(name)`** reads form fields named via the `<input name="...">` attribute.
- **Three-file pattern** for sign-up/sign-in: `actions.ts` (Server Action), `page.tsx` (Server Component), `form.tsx` (Client Component for `useFormState`).
- **`redirect()` outside `try/catch`**, always. It throws a magic error that the catch will swallow.
- **`auth.api.signUpEmail({ body, headers: headers() })`** does everything: validation, password hashing, user+account+session creation, cookie. You just pass the form data through.
- **`useFormState`** for inline error feedback. Requires Client Component. Worth it for auth forms.
- **No `fetch`, no JSON, no `useState`** in the page or the action. That's the whole pitch.

---

## 🔗 References

- [Next.js docs — Server Actions and Mutations](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Next.js docs — `<form>` with Server Actions](https://nextjs.org/docs/app/api-reference/components/form)
- [React docs — `useFormState`](https://react.dev/reference/react-dom/hooks/useFormState)
- [Better Auth — Email and Password](https://www.better-auth.com/docs/authentication/email-password)
- [Better Auth — `auth.api` reference](https://www.better-auth.com/docs/concepts/api)
- Local: [Day 7 — Better Auth Overview](./day7_better_auth_overview.md)
- Local: [Day 2 — Server vs Client Components](./day2_rsc_vs_client_components.md)

---

## ➡️ What's Next?

- **`Day_25` (next commit)** — Apply this doc. Create `app/(auth)/sign-up/page.tsx`, `actions.ts`, `sign-up-form.tsx`. Sign up a real user through the UI.
- **`Day_26`** — Same pattern, but for sign-in. Overwrites the Day_07 stub at `app/(auth)/sign-in/page.tsx`.
- **`Day_27`** — Learning doc on reading sessions in Server Components / Server Actions (`auth.api.getSession({ headers: headers() })`).
- **`Day_28`** — Sign-out action; header shows session state ("Sign out" when logged in, "Sign in" otherwise).
