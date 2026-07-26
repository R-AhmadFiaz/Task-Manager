import { createClient } from "@supabase/supabase-js";

// Same project the web app, Chrome extension, and mobile app use. The anon
// key is meant to be public — Row Level Security, not secrecy, is what
// protects the data.
const SUPABASE_URL = "https://kegtulkvmdudvdbqixwc.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_mDJ4o0gfrZk7vrrq3ljOKw_Fe_0iZnm";

// Tauri's webview is a real browser engine (WebView2/WebKit), so the
// default browser storage (localStorage) supabase-js normally uses works
// as-is — no custom storage adapter needed, unlike React Native.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
