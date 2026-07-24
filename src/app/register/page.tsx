import { RegisterForm } from "@/features/auth/components/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm space-y-6 rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Create an account</h1>
          <p className="mt-1 text-sm text-gray-500">Start tracking your tasks</p>
        </div>
        <RegisterForm />
      </div>
    </main>
  );
}
