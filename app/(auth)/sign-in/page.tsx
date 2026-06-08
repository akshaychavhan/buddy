import type { Metadata } from "next";

import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to plan trips with friends.",
  openGraph: {
    title: "Sign in · Buddies",
    description: "Sign in to plan trips with friends.",
  },
};

export default function SignInPage() {
  return (
    <div className="flex flex-col gap-6 text-center">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">
          Sign in to Buddies
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Welcome back. Magic-link and Google sign-in land later in Day 7.
        </p>
      </div>

      <SignInForm />
    </div>
  );
}
