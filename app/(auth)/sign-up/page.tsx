import type { Metadata } from "next";

import { SignUpForm } from "./sign-up-form";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create a Buddies account to start planning trips with friends.",
  openGraph: {
    title: "Sign up · Buddies",
    description: "Create a Buddies account to start planning trips with friends.",
  },
};

export default function SignUpPage() {
  return (
    <div className="flex flex-col gap-6 text-center">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">
          Create your account
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Email + password, plain and simple. Magic-link and Google sign-in
          land later in Day 7.
        </p>
      </div>

      <SignUpForm />
    </div>
  );
}
