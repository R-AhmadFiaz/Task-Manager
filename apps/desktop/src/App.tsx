import { useAuth } from "./hooks/useAuth";
import { AuthView } from "./components/AuthView";
import { TasksView } from "./components/TasksView";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./App.css";

function App() {
  const { session, initializing, initError } = useAuth();

  if (initializing) {
    return (
      <main className="app">
        <div className="centered">
          <p className="muted-text">Checking your session…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="app">
      <ErrorBoundary>
        {session ? (
          <TasksView session={session} />
        ) : (
          <>
            {initError && (
              <p className="error-text session-error-banner" role="alert">
                {initError}
              </p>
            )}
            <AuthView />
          </>
        )}
      </ErrorBoundary>
    </main>
  );
}

export default App;
