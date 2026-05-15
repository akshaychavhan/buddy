"use client";

export default function RootError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-start gap-4 px-6 py-12">
      <h2 className="text-2xl font-semibold tracking-tight">
        Something went wrong
      </h2>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        {error.message}
      </p>
      {error.digest ? (
        <p className="text-xs text-neutral-500">
          Error id: <code>{error.digest}</code>
        </p>
      ) : null}
      <button
        onClick={reset}
        className="mt-2 rounded border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-900"
      >
        Try again
      </button>
    </div>
  );
}
