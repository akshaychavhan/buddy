export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-6 px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">
        Buddies — Day 1
      </h1>
      <p className="text-lg text-neutral-600 dark:text-neutral-400">
        Plan trips. Travel together. Remember everything.
      </p>
      <p className="text-sm text-neutral-500">
        The single Next.js app is alive. Try{" "}
        <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs dark:bg-neutral-800">
          /api/health
        </code>{" "}
        to see the same app serve a JSON endpoint.
      </p>
    </main>
  );
}
