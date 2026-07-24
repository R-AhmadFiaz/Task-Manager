"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AuthFormState } from "@/features/auth/types";

function parseCredentials(formData: FormData): { email: string; password: string } | null {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    return null;
  }

  if (!email.trim() || !password) {
    return null;
  }

  return { email: email.trim(), password };
}

export async function signUp(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const credentials = parseCredentials(formData);

  if (!credentials) {
    return { error: "Email and password are required.", info: null };
  }

  if (credentials.password.length < 6) {
    return { error: "Password must be at least 6 characters.", info: null };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp(credentials);

  if (error) {
    return { error: error.message, info: null };
  }

  if (!data.session) {
    return {
      error: null,
      info: "Account created. Check your email to confirm before logging in.",
    };
  }

  redirect("/dashboard");
}

export async function signIn(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const credentials = parseCredentials(formData);

  if (!credentials) {
    return { error: "Email and password are required.", info: null };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(credentials);

  if (error) {
    return { error: error.message, info: null };
  }

  redirect("/dashboard");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
