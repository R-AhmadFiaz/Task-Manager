import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config.js";
import { getStoredSession, setStoredSession } from "./storage.js";
/**
 * A small, purpose-built REST client for the two things this extension
 * needs from Supabase: password sign-in and inserting a task. It talks to
 * the exact same Auth (`/auth/v1`) and PostgREST (`/rest/v1`) endpoints the
 * official supabase-js SDK uses — same backend, same `tasks` table, same
 * RLS policies, no duplicated server-side logic — without pulling in the
 * full SDK (and the bundler that would require inside a Manifest V3
 * extension, which can't load remotely-hosted code).
 */
const EXPIRY_BUFFER_SECONDS = 60;
function toStoredSession(raw) {
    return {
        access_token: raw.access_token,
        refresh_token: raw.refresh_token,
        expires_at: raw.expires_at,
        user: { id: raw.user.id, email: raw.user.email ?? null },
    };
}
async function parseErrorMessage(response) {
    try {
        const body = (await response.json());
        return body.error_description ?? body.msg ?? body.message ?? `Request failed (${response.status}).`;
    }
    catch {
        return `Request failed (${response.status}).`;
    }
}
export async function signInWithPassword(email, password) {
    try {
        const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
            method: "POST",
            headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        if (!response.ok) {
            return { session: null, error: await parseErrorMessage(response) };
        }
        const session = toStoredSession((await response.json()));
        await setStoredSession(session);
        return { session, error: null };
    }
    catch {
        return { session: null, error: "Network error. Check your connection and try again." };
    }
}
export async function signOut() {
    const session = await getStoredSession();
    await setStoredSession(null);
    if (!session)
        return;
    try {
        // Best-effort server-side revocation — the local session is already
        // cleared either way, so a failure here isn't user-visible.
        await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
            method: "POST",
            headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${session.access_token}` },
        });
    }
    catch {
        // Ignored — see comment above.
    }
}
async function refreshSession(session) {
    try {
        const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
            method: "POST",
            headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: session.refresh_token }),
        });
        if (!response.ok) {
            await setStoredSession(null);
            return null;
        }
        const refreshed = toStoredSession((await response.json()));
        await setStoredSession(refreshed);
        return refreshed;
    }
    catch {
        // A transient network error shouldn't sign the user out — just report
        // "no valid session right now" and let the next attempt retry.
        return null;
    }
}
/** Returns a valid session, transparently refreshing it first if it's expired or close to it. */
export async function getValidSession() {
    const session = await getStoredSession();
    if (!session)
        return null;
    const nowSeconds = Date.now() / 1000;
    if (session.expires_at - nowSeconds > EXPIRY_BUFFER_SECONDS) {
        return session;
    }
    return refreshSession(session);
}
export async function createTask(title) {
    const session = await getValidSession();
    if (!session) {
        return { error: "You've been signed out. Please log in again." };
    }
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/tasks`, {
            method: "POST",
            headers: {
                apikey: SUPABASE_ANON_KEY,
                Authorization: `Bearer ${session.access_token}`,
                "Content-Type": "application/json",
                Prefer: "return=minimal",
            },
            body: JSON.stringify({ title, user_id: session.user.id }),
        });
        if (!response.ok) {
            return { error: await parseErrorMessage(response) };
        }
        return { error: null };
    }
    catch {
        return { error: "Network error. Check your connection and try again." };
    }
}
