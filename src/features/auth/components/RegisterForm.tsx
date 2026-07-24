"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUp } from "@/features/auth/actions";
import { initialAuthFormState } from "@/features/auth/types";
import { SubmitButton } from "@/components/SubmitButton";

export function RegisterForm() {
  const [state, formAction] = useActionState(signUp, initialAuthFormState);

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
          minLength={6}
          autoComplete="new-password"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
        <p className="mt-1 text-xs text-gray-400">At least 6 characters.</p>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.info && <p className="text-sm text-green-600">{state.info}</p>}

      <SubmitButton
        pendingLabel="Creating account..."
        className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white"
      >
        Create account
      </SubmitButton>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-gray-900 underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
