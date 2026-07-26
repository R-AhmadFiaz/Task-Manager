import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-gray-50">
      <nav className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <span className="text-sm font-semibold text-gray-900">Task Manager</span>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex gap-3">
            <Link
              href="/login"
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-900"
            >
              Register
            </Link>
          </div>
          <Link href="/downloads" className="text-sm text-gray-500 hover:text-gray-700">
            Downloads
          </Link>
        </div>
      </nav>

      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
        <h1 className="text-4xl font-semibold text-gray-900">Task Manager</h1>
        <p className="text-gray-500">Simple, focused task management.</p>
      </div>
    </main>
  );
}
