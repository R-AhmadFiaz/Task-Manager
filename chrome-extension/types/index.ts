export interface SessionUser {
  id: string;
  email: string | null;
}

/** Minimal shape of a Supabase Auth session — only what the extension needs. */
export interface StoredSession {
  access_token: string;
  refresh_token: string;
  /** Unix seconds. */
  expires_at: number;
  user: SessionUser;
}

export interface AuthResult {
  session: StoredSession | null;
  error: string | null;
}

export interface ActionResult {
  error: string | null;
}
