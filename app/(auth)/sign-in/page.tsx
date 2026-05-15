import type { Metadata } from "next";

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
    <div className="flex flex-col gap-4 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Sign in</h1>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        The real sign-in form lands on Day 7 when Better Auth is wired up.
      </p>
      <p className="text-xs text-neutral-500">
        Notice the centered shell — different layout from the rest of the app,
        same URL tree.
      </p>
    </div>
  );
}
