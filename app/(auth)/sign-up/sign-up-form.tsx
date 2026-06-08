"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";

import { signUpAction, type SignUpState } from "./actions";

const initialState: SignUpState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
    >
      {pending ? "Creating account…" : "Sign up"}
    </button>
  );
}

export function SignUpForm() {
  const [state, formAction] = useFormState(signUpAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4 text-left">
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-neutral-700 dark:text-neutral-300">Name</span>
        <input
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Akshay"
          className="rounded-md border border-neutral-300 px-3 py-2 text-base dark:border-neutral-700 dark:bg-neutral-900"
        />
      </label>

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

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-neutral-700 dark:text-neutral-300">Password</span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="rounded-md border border-neutral-300 px-3 py-2 text-base dark:border-neutral-700 dark:bg-neutral-900"
        />
        <span className="text-xs text-neutral-500">At least 8 characters.</span>
      </label>

      {state.error ? (
        <p
          role="alert"
          className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300"
        >
          {state.error}
        </p>
      ) : null}

      <SubmitButton />

      <p className="text-center text-xs text-neutral-500">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-medium text-neutral-900 underline dark:text-neutral-100"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
