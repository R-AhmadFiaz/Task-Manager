import { useState, type FormEvent } from "react";
import { useAuth } from "../hooks/useAuth";

type AuthMode = "login" | "register";

export function AuthView() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const isLogin = mode === "login";

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    setError(null);
    setInfo(null);
    setPassword("");
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);

    const result = isLogin ? await signIn(email, password) : await signUp(email, password);

    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.info) {
      setInfo(result.info);
      return;
    }
    // Otherwise a session was established and useAuth's own
    // onAuthStateChange listener updates `session` — App switches to the
    // authenticated view on its own, nothing to do here.
  }

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleSubmit} noValidate>
        <h1 className="login-title">Task Manager</h1>
        <p className="login-subtitle">
          {isLogin ? "Log in to see your tasks" : "Create an account to get started"}
        </p>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            // eslint-disable-next-line jsx-a11y/no-autofocus -- deliberate: this is the only field in the app's entry view
            autoFocus
            required
          />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete={isLogin ? "current-password" : "new-password"}
            minLength={isLogin ? undefined : 6}
            required
          />
          {!isLogin && <p className="field-hint">At least 6 characters.</p>}
        </div>

        {error && (
          <p className="error-text" role="alert">
            {error}
          </p>
        )}
        {info && (
          <p className="info-text" role="status">
            {info}
          </p>
        )}

        <button type="submit" className="primary-button" disabled={submitting}>
          {submitting
            ? isLogin
              ? "Signing in…"
              : "Creating account…"
            : isLogin
              ? "Log in"
              : "Create account"}
        </button>

        <p className="auth-switch">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            className="link-button"
            onClick={() => switchMode(isLogin ? "register" : "login")}
          >
            {isLogin ? "Register" : "Log in"}
          </button>
        </p>
      </form>
    </div>
  );
}
