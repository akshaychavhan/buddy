import type { Metadata } from "next";

import { GoogleSignInButton } from "./google-sign-in-button";
import { MagicLinkForm } from "./magic-link-form";
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
          Welcome back.
        </p>
      </div>

      <SignInForm />

      <div className="flex items-center gap-3 text-xs text-neutral-500">
        <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
        <span>or</span>
        <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
      </div>

      <MagicLinkForm />

      <div className="flex items-center gap-3 text-xs text-neutral-500">
        <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
        <span>or</span>
        <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
      </div>

      <GoogleSignInButton />
    </div>
  );
}
