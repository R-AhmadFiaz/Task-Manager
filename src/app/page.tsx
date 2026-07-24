import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-gray-50 px-4 text-center">
      <div>
        <h1 className="text-4xl font-semibold text-gray-900">Task Manager</h1>
        <p className="mt-3 text-gray-500">Simple, focused task management.</p>
      </div>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="rounded-md bg-gray-900 px-6 py-2.5 text-sm font-medium text-white"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="rounded-md border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-900"
        >
          Register
        </Link>
      </div>
    </main>
  );
}
