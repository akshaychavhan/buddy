import Link from "next/link";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
          <Link
            href="/sign-in"
            className="text-neutral-700 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-neutral-50"
          >
            Sign in
          </Link>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
