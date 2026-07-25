# Task Manager — Chrome Extension

A Manifest V3 popup extension for quickly adding tasks to the Task Manager web app
without opening it. Reuses the exact same Supabase project, `tasks` table, RLS
policies, and Realtime setup as the web app — a task created here appears in the
dashboard instantly, same as if it were created from another browser tab.

## Load it

The compiled `.js` files are committed, so this folder is loadable as-is:

1. Open `chrome://extensions`.
2. Enable **Developer mode** (top right).
3. Click **Load unpacked** and select this `chrome-extension/` folder.

## Develop

```bash
npm install
npm run typecheck   # tsc --noEmit
npm run build       # tsc — compiles each .ts to a sibling .js in place
```

After changing any `.ts` file, run `npm run build`, then click the refresh icon
for the extension on `chrome://extensions` (or reload the popup) to pick up the
change.

## How it works

- **`lib/config.ts`** — the Supabase project URL and anon key (same public,
  RLS-protected values already embedded in the web app's client bundle) and the
  dashboard URL the "Open Dashboard" button opens. Update `DASHBOARD_URL` here
  when pointing at a deployed instance instead of `localhost:3000`.
- **`lib/supabaseClient.ts`** — a small, purpose-built `fetch` client for the two
  things the extension needs (password sign-in, inserting a task), talking to the
  same `/auth/v1` and `/rest/v1` endpoints the official SDK uses. See "Why not
  the supabase-js SDK?" below.
- **`lib/storage.ts`** — persists the session in `chrome.storage.local`, which is
  isolated per-extension (not reachable from web pages or other extensions).
- **`popup/`** — the popup UI. Checks for a stored session on open; shows the
  login form if there isn't one, or the task-creation form if there is.
- **`background/background.ts`** — a service worker that gives an at-a-glance
  signal in the toolbar (a small badge dot) when you're signed out, without
  needing to open the popup first.

## Why not session/cookie reuse?

The web app's session lives in an `httpOnly` cookie set by `@supabase/ssr` — by
design, that's invisible to any JavaScript, including an extension's. Reading it
anyway would mean a background script parsing `@supabase/ssr`'s internal,
undocumented cookie encoding via the privileged `chrome.cookies` API — fragile
(it can change between package versions) and not something to build production
auth on.

Instead, the extension performs its own sign-in directly against the same
Supabase Auth backend (same `auth.users` table — an existing web app account logs
in here with the same email and password) and keeps its own session in
`chrome.storage.local`. Same backend, same users, same RLS; a genuinely separate,
secure session rather than a fragile shared one.

## Why not the supabase-js SDK?

Manifest V3 disallows remotely-hosted code, so any npm dependency has to be
bundled into the extension. The extension only ever needs two things — sign in,
and insert one row — a much smaller surface than the full SDK (which also
pulls in realtime, storage, and functions clients this extension doesn't use).
A ~150-line typed `fetch` client covers it with zero runtime dependencies and no
bundler step.
