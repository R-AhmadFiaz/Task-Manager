# Real-Time Communication Research

**Project:** Cross-Platform Real-Time Task Manager
**Session:** 2 — Task 1
**Type:** Research & Architecture Decision Document
**Status:** Research only — no application code included

---

## 1. What is Real-Time Communication?

Real-time communication means data moves between the server and the client **the moment it changes**, without the client having to ask for it.

In a **traditional request/response** model (the standard REST API pattern), the client is always the one who initiates contact:

```
Client  →  "Do you have new data?"  →  Server
Client  ←  "Here you go"            ←  Server
```

The client only finds out about a change if it happens to ask again. If nothing asks, nothing updates — even if the data changed a second after the last request.

In a **real-time** model, the connection stays open (or the server has a way to reach the client), so the flow becomes:

```
Server  →  "Something changed!"  →  Client   (server pushes, unprompted)
```

The client doesn't need to ask — it is *told*.

### Practical examples

| App | Real-time behavior |
|---|---|
| **WhatsApp** | A message you send appears on the recipient's screen instantly, without them refreshing the app. |
| **Discord** | When someone sends a message or joins a voice channel, every other member's client updates immediately. |
| **Google Docs** | You see another person's cursor and keystrokes appear on the page as they type, live. |
| **Trello** | If a teammate moves a card to "Done," your board updates without a page reload. |
| **Our Task Manager** | If User A marks a task complete, User B looking at the same task list should see it flip to "Completed" instantly — no refresh needed. |

This last example is exactly what Session 2 of this project needs to support.

---

## 2. Common Real-Time Approaches

There are several techniques that simulate or achieve "real-time" behavior, each with different trade-offs. They form a progression from "client keeps asking" to "server keeps a live line open."

### 2.1 Polling

**How it works:** The client sends a request every N seconds (e.g., every 5s) asking "anything new?" regardless of whether something actually changed.

**Advantages:**
- Extremely simple to implement (a basic `setInterval` + `fetch`).
- Works with any standard HTTP server, no special infrastructure.

**Disadvantages:**
- Wasteful — most requests return "no changes."
- Not truly real-time; there's a delay up to the polling interval.
- Doesn't scale well: more users = proportionally more constant requests hitting the server.

**Typical use cases:** Low-priority background checks (e.g., checking for app version updates), dashboards where a few seconds of delay is acceptable.

---

### 2.2 Long Polling

**How it works:** The client sends a request, but the server **holds it open** without responding until either new data is available or a timeout is reached. Once it responds, the client immediately opens a new request.

**Advantages:**
- Much lower latency than plain polling — updates arrive close to instantly when they happen.
- Works over plain HTTP, so it's compatible with older infrastructure/proxies.

**Disadvantages:**
- Still relies on constant reconnects, which adds overhead.
- Keeps server resources (a thread/connection) tied up waiting.
- More complex to implement correctly (timeouts, reconnect logic, race conditions).

**Typical use cases:** Chat systems before WebSockets became widely supported; environments where WebSockets are blocked by a proxy/firewall.

---

### 2.3 Server-Sent Events (SSE)

**How it works:** The client opens a single, one-directional HTTP connection to the server using the `EventSource` API. The server can then push text-based events down that same connection whenever it wants, indefinitely.

**Advantages:**
- Simple browser API (`EventSource`), no special library needed.
- Naturally reconnects on drop.
- Lightweight compared to WebSockets for one-way (server → client) updates.

**Disadvantages:**
- **One-directional only** — the client cannot send messages back over the same connection (it would need a separate regular HTTP request for that).
- Less broadly supported outside browsers (e.g., some mobile/native environments need polyfills).
- Not ideal when the client also needs to push frequent updates back.

**Typical use cases:** Live sports scores, stock ticker feeds, notification streams — anything where data flows mainly server → client.

---

### 2.4 WebSockets

**How it works:** The client and server perform a one-time HTTP "handshake" that **upgrades** the connection to a persistent, full-duplex (two-way) socket. After that, both sides can send messages to each other at any time over the same open connection.

**Advantages:**
- True bidirectional, low-latency communication.
- Efficient — no repeated handshakes or headers per message.
- Ideal for highly interactive apps (chat, games, collaborative editing).

**Disadvantages:**
- Requires a **persistent, long-lived server process** to hold connections open.
- Harder to scale horizontally (needs sticky sessions or a shared pub/sub layer like Redis).
- **Does not work well in serverless environments** (see Section 5).
- More moving parts: reconnect logic, heartbeat/ping-pong, auth-per-socket, etc.

**Typical use cases:** Multiplayer games, live collaborative tools, trading platforms, chat apps — anything needing constant two-way low-latency traffic.

---

### 2.5 Supabase Realtime

**How it works:** Supabase runs a managed WebSocket server on top of PostgreSQL. It listens to the database's **Write-Ahead Log (WAL)** and forwards row-level changes (`INSERT`, `UPDATE`, `DELETE`) to subscribed clients over WebSocket **channels**, in addition to supporting custom `broadcast` and `presence` messages.

**Advantages:**
- No need to build or host your own WebSocket server — Supabase manages the persistent connection layer.
- Directly tied to database changes, so the client list is always in sync with actual data state.
- Built-in integration with Supabase Auth (Row Level Security applies to realtime subscriptions too).
- Works cleanly with serverless frontend hosting (like Vercel) because the app itself never has to hold a socket open.

**Disadvantages:**
- Adds a dependency on the Supabase platform.
- Slightly less low-level control than rolling your own WebSocket protocol.
- Realtime is tied to Postgres table structure — some custom event shapes require using `broadcast` channels manually.

**Typical use cases:** Exactly this project — CRUD-based apps needing live updates without maintaining custom socket infrastructure.

---

### Quick Comparison

| Approach | Direction | Latency | Server Persistent? | Complexity |
|---|---|---|---|---|
| Polling | Client → Server (repeated) | High | No | Very Low |
| Long Polling | Client → Server (held open) | Medium | Partially | Medium |
| SSE | Server → Client only | Low | Yes | Low-Medium |
| WebSockets | Both ways | Very Low | Yes | High |
| Supabase Realtime | Both ways (managed) | Very Low | Managed by Supabase | Low (for us) |

---

## 3. WebSocket Lifecycle

A WebSocket connection goes through a clear lifecycle:

```
 ┌────────────┐
 │ Connection │   Client opens a TCP connection to the server
 └─────┬──────┘
       │
       ▼
 ┌────────────┐
 │ Handshake  │   Client sends an HTTP request with an "Upgrade: websocket"
 │            │   header; server responds "101 Switching Protocols"
 └─────┬──────┘
       │
       ▼
 ┌────────────┐
 │ Connected  │   Connection is now a persistent, full-duplex socket
 └─────┬──────┘
       │
       ▼
 ┌────────────┐
 │  Messages  │   Either side sends messages at any time (frames),
 │  (loop)    │   e.g. task created / updated / deleted events
 └─────┬──────┘
       │  (repeats until closed)
       ▼
 ┌────────────┐
 │ Disconnect │   Either side sends a close frame, or the connection
 │            │   drops (network loss, tab closed, timeout)
 └────────────┘
```

Key points:
- The handshake happens **once** — after that there's no repeated HTTP overhead per message.
- Messages can flow in **either direction at any time**, not just as replies.
- A disconnect can be **graceful** (explicit close frame) or **abrupt** (network failure), which is why real-time clients need reconnect logic.

---

## 4. How Supabase Realtime Works

Supabase Realtime is built around PostgreSQL's replication mechanism, plus a message-broadcasting layer.

### 4.1 PostgreSQL WAL (Write-Ahead Log)

Every change to a Postgres database (`INSERT`, `UPDATE`, `DELETE`) is first written to the **Write-Ahead Log** before it's applied to the actual table — this is how Postgres guarantees durability and crash recovery.

Supabase's Realtime server taps into this log as a **logical replication subscriber**. It doesn't poll the tables — it reads the stream of committed changes directly from the WAL, which is efficient and near-instant.

### 4.2 Channels

A **channel** is a named communication topic that clients subscribe to. A channel can carry:
- **Postgres Changes** — row-level `INSERT`/`UPDATE`/`DELETE` events from a specific table (optionally filtered, e.g. only rows where `user_id = X`).
- **Broadcast** — arbitrary custom messages sent directly between clients/server (not tied to a database row), useful for things like "user is typing."
- **Presence** — tracks which users are currently online/connected to a channel (e.g., "who's viewing this board right now").

### 4.3 Subscriptions

A client subscribes to a channel and registers a callback for the event types it cares about:

```
client.channel('tasks-channel')
  .on('postgres_changes', { event: 'UPDATE', table: 'tasks' }, callback)
  .subscribe()
```

Row Level Security (RLS) policies still apply — a client only receives events for rows it's actually authorized to see, since Supabase Realtime respects the same Postgres permissions as regular queries.

### 4.4 End-to-End Flow

```
Database row changes (INSERT/UPDATE/DELETE)
        │
        ▼
Written to PostgreSQL WAL
        │
        ▼
Supabase Realtime server reads the WAL change
        │
        ▼
Change is matched against active channel subscriptions
        │
        ▼
Matching event is pushed over WebSocket to each subscribed client
        │
        ▼
Client's callback fires → UI updates (e.g., task list re-renders)
```

This means the **database itself is the source of truth for real-time events** — the app doesn't need to manually "emit" events in application code; Supabase watches the data layer directly.

---

## 5. Real-Time on Vercel

### 5.1 Why long-lived WebSocket servers don't fit Vercel Serverless Functions

Vercel Serverless Functions are designed around a **short-lived, stateless execution model**:
- A function spins up, handles one request, returns a response, and shuts down (or is frozen/recycled).
- Functions have **execution time limits** (from a few seconds up to a configurable max, well short of "forever").
- There is no guarantee that two requests from the same client hit the *same* function instance — functions can scale to zero or spin up new instances at any time.

A WebSocket connection, by contrast, needs:
- A single process to hold the connection open **indefinitely** (hours/days).
- The *same* server instance to remain reachable for the entire life of that connection.

These two models are fundamentally incompatible: serverless functions are built to *not* stay alive, and WebSockets require exactly that. Trying to run a raw `ws` server inside a Vercel serverless function will get the connection killed as soon as the function's execution window ends or the instance is recycled.

### 5.2 Why Supabase Realtime solves this

Supabase Realtime moves the "long-lived connection" responsibility **out of Vercel entirely**:
- The persistent WebSocket server lives on **Supabase's infrastructure**, not inside the Next.js app.
- The Next.js app (running on Vercel) only needs to run normal short-lived request/response logic (auth, CRUD API routes, page rendering).
- In the browser, the **client-side Supabase JS SDK** opens the WebSocket connection directly to Supabase — Vercel is never in that connection path at all.

This cleanly separates concerns:
```
Browser  ───(WebSocket)───▶  Supabase Realtime  (long-lived, managed by Supabase)
Browser  ───(HTTPS)──────▶  Next.js on Vercel   (short-lived, stateless requests)
```

### 5.3 Best practices when deploying Next.js on Vercel

- Keep all realtime subscription logic **client-side** (`"use client"` components) — never attempt to hold a socket open inside an API route or Server Component.
- Use Vercel for what it's good at: SSR/SSG pages, API routes for CRUD, authentication callbacks, and short-lived business logic.
- Let Supabase handle anything requiring a persistent connection (Realtime, and if needed later, background workers).
- Keep environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) properly scoped and never expose service-role keys to the client bundle.
- Rely on Supabase RLS policies as the real security boundary for realtime data — don't assume the client filtering the data is enough.

---

## 6. Chosen Architecture

### Recommendation: **Supabase Realtime**

For this internship project, we will use **Supabase Realtime**, not a custom-built WebSocket server.

### Why

| Reason | Explanation |
|---|---|
| **Easier** | No need to design, host, secure, or scale a custom WebSocket server. Supabase already provides subscribe/broadcast APIs out of the box. |
| **Production-ready** | Supabase Realtime is a managed, battle-tested service already used in production by many companies — we're not reinventing infrastructure. |
| **Less backend code** | We don't write any socket-handling server code ourselves; the database change *is* the event. No manual `io.emit(...)` calls needed. |
| **Integrates naturally with Supabase Auth & Database** | Since we're already using Supabase for the database and authentication, Realtime shares the same RLS policies, the same client SDK, and the same project — no separate service to wire up or keep in sync. |
| **Deployment-friendly** | As explained in Section 5, it avoids the fundamental incompatibility between long-lived WebSocket servers and Vercel's serverless model. |

A custom WebSocket server (e.g., raw `ws` or `socket.io` on a separate Node process) would require us to provision and maintain a always-on server (outside Vercel), handle our own auth-per-socket, and manually emit every event from application code — all of which Supabase already gives us for free given our existing stack.

---

## 7. How Our Task Manager Will Use Realtime

### General flow

```
User A creates/updates/deletes a task
        │
        ▼
Task change is written to the Supabase "tasks" table
        │
        ▼
Postgres WAL records the change
        │
        ▼
Supabase Realtime emits a postgres_changes event on the "tasks" channel
        │
        ▼
User B's browser (subscribed to that channel) receives the event
        │
        ▼
Task list in User B's UI updates automatically — no refresh needed
```

### Applied per action

**Create**
```
User A creates task → INSERT into tasks table → Realtime INSERT event
→ User B's task list appends the new task instantly
```

**Update**
```
User A edits task title/details → UPDATE on tasks table → Realtime UPDATE event
→ User B's task list re-renders the changed fields instantly
```

**Delete**
```
User A deletes task → DELETE from tasks table → Realtime DELETE event
→ User B's task list removes that task instantly
```

**Completed**
```
User A marks task as completed → UPDATE (status/completed field) on tasks table
→ Realtime UPDATE event → User B sees the task flip to "Completed" instantly
```

In every case, the app code only ever performs a normal database write — Supabase Realtime handles telling every other connected client that something changed.

---

