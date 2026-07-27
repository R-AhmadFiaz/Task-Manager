import { LoginForm } from "@/features/auth/components/LoginForm";
import { SiteNav } from "@/components/SiteNav";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col bg-gray-50">
      <SiteNav />
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-6 rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-gray-900">Welcome back</h1>
            <p className="mt-1 text-sm text-gray-500">Log in to manage your tasks</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
