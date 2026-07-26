import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { boot } from "../lib/bootLog";
import { supabase } from "../lib/supabase";

boot("useAuth.ts module evaluated, supabase client imported");

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
    boot("useAuth effect started, calling supabase.auth.getSession()");

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        boot(`getSession() resolved: error=${error?.message ?? "null"} hasSession=${!!data.session}`);
        if (!isMounted) return;
        if (error) setInitError(error.message);
        setSession(data.session);
      })
      .catch((error: unknown) => {
        // A failure here (e.g. reading the persisted session from
        // storage) must not leave the app stuck on the loading screen
        // forever, or become an unhandled promise rejection — fall back
        // to the logged-out view with a visible reason instead.
        boot(`getSession() rejected: ${error instanceof Error ? error.message : String(error)}`);
        if (!isMounted) return;
        setInitError(error instanceof Error ? error.message : "Could not restore your session.");
        setSession(null);
      })
      .finally(() => {
        boot("getSession() settled (finally)");
        if (isMounted) setInitializing(false);
      });

    boot("useAuth effect: calling supabase.auth.onAuthStateChange()");
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      boot(`onAuthStateChange fired: event=${_event} hasSession=${!!newSession}`);
      setSession(newSession);
    });
    boot("useAuth effect: onAuthStateChange() subscribed");

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
        return { error: null, info: "Account created. Check your email to confirm before logging in." };
      }

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
