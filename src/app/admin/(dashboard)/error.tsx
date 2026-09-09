"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-start gap-4 rounded-xl border border-red-200 bg-red-50 p-8">
      <p className="text-sm text-red-600">
        Something went wrong while loading this page.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-full bg-neutral-900 px-5 py-2 text-xs uppercase tracking-wide text-white transition-opacity hover:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}
