"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn } from "@/features/auth/actions";
import { initialAuthFormState } from "@/features/auth/types";
import { SubmitButton } from "@/components/SubmitButton";

export function LoginForm() {
  const [state, formAction] = useActionState(signIn, initialAuthFormState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <SubmitButton
        pendingLabel="Signing in..."
        className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white"
      >
        Sign in
      </SubmitButton>

      <p className="text-center text-sm text-gray-600">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-gray-900 underline">
          Register
        </Link>
      </p>
    </form>
  );
}
