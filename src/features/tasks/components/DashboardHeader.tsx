import Link from "next/link";
import { signOut } from "@/features/auth/actions";

interface DashboardHeaderProps {
  email: string;
}

export function DashboardHeader({ email }: DashboardHeaderProps) {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Task Manager</h1>
          <p className="text-sm text-gray-500">{email}</p>
        </div>
        <div className="flex items-center gap-4">
          <form action={signOut}>
            <button
              type="submit"
              className="cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-150 hover:border-gray-900 hover:bg-gray-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
            >
              Logout
            </button>
          </form>
          <Link
            href="/downloads"
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-150 hover:border-gray-900 hover:bg-gray-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
          >
            Downloads
          </Link>
        </div>
      </div>
    </header>
  );
}
