import { getStoredSession, SESSION_STORAGE_KEY } from "../lib/storage.js";

// Gives an at-a-glance signal in the toolbar of whether the extension is
// ready to use, without having to open the popup first.
const LOGGED_OUT_BADGE_COLOR = "#d1d5db"; // gray-300, matches the app's neutral palette

async function updateBadgeForSession(): Promise<void> {
  const session = await getStoredSession();
  if (session) {
    await chrome.action.setBadgeText({ text: "" });
    return;
  }
  await chrome.action.setBadgeText({ text: "•" });
  await chrome.action.setBadgeBackgroundColor({ color: LOGGED_OUT_BADGE_COLOR });
}

chrome.runtime.onInstalled.addListener(() => {
  void updateBadgeForSession();
});

chrome.runtime.onStartup.addListener(() => {
  void updateBadgeForSession();
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local") return;
  if (!(SESSION_STORAGE_KEY in changes)) return;
  void updateBadgeForSession();
});
