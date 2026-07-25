import type { StoredSession } from "../types/index.js";

/** chrome.storage.local is isolated per-extension — not reachable from web pages or other extensions. */
export const SESSION_STORAGE_KEY = "taskManagerSession";

export async function getStoredSession(): Promise<StoredSession | null> {
  const result = await chrome.storage.local.get(SESSION_STORAGE_KEY);
  return (result[SESSION_STORAGE_KEY] as StoredSession | undefined) ?? null;
}

export async function setStoredSession(session: StoredSession | null): Promise<void> {
  if (session) {
    await chrome.storage.local.set({ [SESSION_STORAGE_KEY]: session });
  } else {
    await chrome.storage.local.remove(SESSION_STORAGE_KEY);
  }
}
