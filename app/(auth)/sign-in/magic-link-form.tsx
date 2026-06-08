"use client";

import { useFormState, useFormStatus } from "react-dom";

import { magicLinkAction, type MagicLinkState } from "./actions";

const initialState: MagicLinkState = { error: null, sent: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-900"
    >
      {pending ? "Sending…" : "Email me a link"}
    </button>
  );
}

export function MagicLinkForm() {
  const [state, formAction] = useFormState(magicLinkAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4 text-left">
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-neutral-700 dark:text-neutral-300">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="rounded-md border border-neutral-300 px-3 py-2 text-base dark:border-neutral-700 dark:bg-neutral-900"
        />
      </label>

      {state.error ? (
        <p
          role="alert"
          className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300"
        >
          {state.error}
        </p>
      ) : null}

      {state.sent ? (
        <p
          role="status"
          className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300"
        >
          Check your inbox (and your spam folder). The link expires in 10
          minutes.
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
