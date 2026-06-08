import Link from "next/link";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { ThemeToggle } from "@/components/theme-toggle";

import { SignOutButton } from "./sign-out-button";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    // `headers()` is sync in Next 14.2 but async in Next 15. `await` works in
    // both versions (no-op on the sync value). Keeps the upgrade frictionless.
    // eslint-disable-next-line @typescript-eslint/await-thenable
    headers: await headers(),
  });

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
        <Link href="/" className="text-base font-semibold tracking-tight">
          Buddies
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link
            href="/trips"
            className="text-neutral-700 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-neutral-50"
          >
            Trips
          </Link>
          {session ? (
            <>
              <span className="text-neutral-500 dark:text-neutral-400">
                {session.user.name}
              </span>
              <SignOutButton />
            </>
          ) : (
            <Link
              href="/sign-in"
              className="text-neutral-700 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-neutral-50"
            >
              Sign in
            </Link>
          )}
          <ThemeToggle />
        </nav>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
