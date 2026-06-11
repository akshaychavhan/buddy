"use client";

import { useFormStatus } from "react-dom";

import { signOutAction } from "./actions";

function SignOutSubmit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="text-neutral-700 hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-50 dark:text-neutral-300 dark:hover:text-neutral-50"
    >
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <SignOutSubmit />
    </form>
  );
}
