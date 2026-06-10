"use client";

import { useFormStatus } from "react-dom";

import { googleSignInAction } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 flex items-center justify-center gap-2 rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-900"
    >
      {/* Bare-bones G mark; Day_3 will replace with a real Google logo SVG. */}
      <span aria-hidden="true" className="font-semibold">G</span>
      <span>{pending ? "Redirecting…" : "Sign in with Google"}</span>
    </button>
  );
}

export function GoogleSignInButton() {
  return (
    <form action={googleSignInAction}>
      <SubmitButton />
    </form>
  );
}
