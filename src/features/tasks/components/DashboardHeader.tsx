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
        <form action={signOut}>
          <button
            type="submit"
            className="cursor-pointer rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Logout
          </button>
        </form>
      </div>
    </header>
  );
}
