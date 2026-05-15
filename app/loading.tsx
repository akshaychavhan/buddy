export default function Loading() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 px-6 py-12">
      <div className="h-8 w-1/3 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
      <div className="h-4 w-2/3 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
      <div className="mt-4 flex flex-col gap-3">
        <div className="h-14 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-900" />
        <div className="h-14 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-900" />
        <div className="h-14 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-900" />
      </div>
    </div>
  );
}
