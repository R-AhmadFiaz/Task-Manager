"use client";

import { useEffect } from "react";

interface DashboardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4 text-center">
      <h1 className="text-lg font-semibold text-gray-900">Something went wrong</h1>
      <p className="max-w-sm text-sm text-gray-500">
        We couldn&apos;t load your tasks. This is usually temporary — try again in a moment.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white"
      >
        Try again
      </button>
    </main>
  );
}
