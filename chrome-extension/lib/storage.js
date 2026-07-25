/** chrome.storage.local is isolated per-extension — not reachable from web pages or other extensions. */
export const SESSION_STORAGE_KEY = "taskManagerSession";
export async function getStoredSession() {
    const result = await chrome.storage.local.get(SESSION_STORAGE_KEY);
    return result[SESSION_STORAGE_KEY] ?? null;
}
export async function setStoredSession(session) {
    if (session) {
        await chrome.storage.local.set({ [SESSION_STORAGE_KEY]: session });
    }
    else {
        await chrome.storage.local.remove(SESSION_STORAGE_KEY);
    }
}
