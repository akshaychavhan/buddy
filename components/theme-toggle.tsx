"use client";

export function ThemeToggle() {
  return (
    <button
      type="button"
      onClick={() =>
        alert(
          "Theme toggle stub — Day 3 will wire this up to a real light/dark switch."
        )
      }
      aria-label="Toggle theme"
      title="Toggle theme (stub)"
      className="rounded-full border border-neutral-300 px-2 py-1 text-sm hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
    >
      🌓
    </button>
  );
}
