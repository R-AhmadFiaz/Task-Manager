import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export interface AuthResult {
  error: string | null;
  /** Set when sign-up succeeded but the project requires email confirmation before a session exists. */
  info: string | null;
}

interface UseAuthResult {
  session: Session | null;
  initializing: boolean;
  initError: string | null;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

function validateCredentials(email: string, password: string): string | null {
  if (!email.trim()) return "Email is required.";
  // Keep in sync with the <input type="email" required> browser validation —
  // this is a defensive fallback for programmatic submits, not the primary check.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "Enter a valid email address.";
  if (!password) return "Password is required.";
  return null;
}

export function useAuth(): UseAuthResult {
  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!isMounted) return;
        if (error) setInitError(error.message);
        setSession(data.session);
      })
      .catch((error: unknown) => {
        // A failure here (e.g. reading the persisted session) must not
        // leave the app stuck on the loading screen forever, or become an
        // unhandled promise rejection — fall back to the logged-out view
        // with a visible reason instead.
        if (!isMounted) return;
        setInitError(error instanceof Error ? error.message : "Could not restore your session.");
        setSession(null);
      })
      .finally(() => {
        if (isMounted) setInitializing(false);
      });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function signIn(email: string, password: string): Promise<AuthResult> {
    const validationError = validateCredentials(email, password);
    if (validationError) return { error: validationError, info: null };

    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      return { error: error?.message ?? null, info: null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Could not sign in.", info: null };
    }
  }

  async function signUp(email: string, password: string): Promise<AuthResult> {
    const validationError = validateCredentials(email, password);
    if (validationError) return { error: validationError, info: null };
    if (password.length < 6) return { error: "Password must be at least 6 characters.", info: null };

    try {
      const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
      if (error) return { error: error.message, info: null };

      if (!data.session) {
        // Email confirmation is required by the project — there's no
        // session yet, so onAuthStateChange won't fire. Surface this
        // clearly instead of silently doing nothing.
        return { error: null, info: "Account created. Check your email to confirm before logging in." };
      }

      // A session came back immediately (email confirmation is off) —
      // onAuthStateChange fires from supabase.auth.signUp itself, which
      // updates `session` and moves the app to the authenticated view.
      return { error: null, info: null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Could not create account.", info: null };
    }
  }

  async function signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.warn("Sign out request failed; local session is cleared regardless.", error);
    }
  }

  return { session, initializing, initError, signIn, signUp, signOut };
}
