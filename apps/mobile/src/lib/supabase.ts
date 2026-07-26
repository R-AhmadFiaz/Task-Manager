import { boot } from "./bootLog";

boot("supabase.ts module start");

import "react-native-url-polyfill/auto";

boot("react-native-url-polyfill/auto imported");

// expo-sqlite/kv-store, not @react-native-async-storage/async-storage: the
// latter throws synchronously at *import time* (AsyncStorage.native.ts) if
// its native module isn't registered in the host binary, which crashes the
// whole app before React ever mounts — before any error boundary can catch
// it. expo-sqlite is an Expo-owned module guaranteed to ship in Expo Go in
// lockstep with the SDK, and its storage access is entirely lazy (only hits
// the native module when getItem/setItem actually run), so a missing native
// module surfaces as a catchable rejected promise instead of a fatal crash.
import AsyncStorage from "expo-sqlite/kv-store";

boot(`expo-sqlite/kv-store imported, typeof AsyncStorage=${typeof AsyncStorage}`);

import { AppState, type AppStateStatus } from "react-native";
import { createClient } from "@supabase/supabase-js";

boot("@supabase/supabase-js imported");

// Same project the web app and Chrome extension use. The anon key is meant
// to be public — Row Level Security, not secrecy, is what protects data.
const SUPABASE_URL = "https://kegtulkvmdudvdbqixwc.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_mDJ4o0gfrZk7vrrq3ljOKw_Fe_0iZnm";

boot(`SUPABASE_URL=${SUPABASE_URL} SUPABASE_ANON_KEY set=${!!SUPABASE_ANON_KEY}`);

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

boot("createClient() returned successfully");

/**
 * Supabase's token auto-refresh timer only ticks while something calls
 * startAutoRefresh(); tying that to the app actually being in the
 * foreground avoids a backgrounded app silently missing a refresh and
 * coming back to a dead session.
 *
 * Deliberately NOT registered as a module-level side effect (unlike
 * Supabase's own docs example) — touching a native module the instant
 * this file is imported, before the app has even mounted, means any
 * failure here crashes the whole app before a single screen renders, with
 * no React error boundary able to catch it (boundaries only catch
 * render-phase errors). Call this from a useEffect in App.tsx instead, so
 * a failure here can be caught and merely disables auto-refresh-on-
 * foreground rather than taking down the app.
 */
export function startAppStateAuthSync(): () => void {
  function handleChange(state: AppStateStatus) {
    if (state === "active") {
      void supabase.auth.startAutoRefresh();
    } else {
      void supabase.auth.stopAutoRefresh();
    }
  }

  try {
    const subscription = AppState.addEventListener("change", handleChange);
    return () => subscription.remove();
  } catch (error) {
    console.warn("AppState auth sync unavailable; auto-refresh on foreground is disabled.", error);
    return () => {};
  }
}
