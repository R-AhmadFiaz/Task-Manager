import { DASHBOARD_URL } from "../lib/config.js";
import { createTask, getValidSession, signInWithPassword, signOut } from "../lib/supabaseClient.js";

function byId<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`popup.html is missing #${id}`);
  return el as T;
}

const loadingState = byId<HTMLDivElement>("loading-state");
const unauthState = byId<HTMLDivElement>("unauthenticated-state");
const authState = byId<HTMLDivElement>("authenticated-state");

const loginForm = byId<HTMLFormElement>("login-form");
const emailInput = byId<HTMLInputElement>("email");
const passwordInput = byId<HTMLInputElement>("password");
const loginButton = byId<HTMLButtonElement>("login-button");
const loginError = byId<HTMLParagraphElement>("login-error");
const openDashboardUnauth = byId<HTMLButtonElement>("open-dashboard-unauth");

const accountEmail = byId<HTMLSpanElement>("account-email");
const taskForm = byId<HTMLFormElement>("task-form");
const taskTitleInput = byId<HTMLInputElement>("task-title");
const addTaskButton = byId<HTMLButtonElement>("add-task-button");
const taskSuccess = byId<HTMLParagraphElement>("task-success");
const taskError = byId<HTMLParagraphElement>("task-error");
const openDashboardAuth = byId<HTMLButtonElement>("open-dashboard-auth");
const logoutButton = byId<HTMLButtonElement>("logout-button");

// ---- Single source of truth for which section is visible ----
// Every rendered section depends on this and only this — there is no way
// for two views to be visible at once, or for "loading" to stay shown
// after it resolves, because setView() is the only thing that ever
// toggles the three container elements, and it always shows exactly one.
type PopupView = "loading" | "unauthenticated" | "authenticated";

function setView(view: PopupView): void {
  loadingState.hidden = view !== "loading";
  unauthState.hidden = view !== "unauthenticated";
  authState.hidden = view !== "authenticated";
}

function show(el: HTMLElement): void {
  el.hidden = false;
}

function hide(el: HTMLElement): void {
  el.hidden = true;
}

function openDashboard(): void {
  chrome.tabs.create({ url: DASHBOARD_URL });
}

function renderUnauthenticated(): void {
  setView("unauthenticated");
  emailInput.focus();
}

function renderAuthenticated(email: string | null): void {
  setView("authenticated");
  accountEmail.textContent = email ?? "your account";
  taskTitleInput.focus();
}

async function init(): Promise<void> {
  setView("loading");
  const session = await getValidSession();
  if (session) {
    renderAuthenticated(session.user.email);
  } else {
    renderUnauthenticated();
  }
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  void handleLogin();
});

async function handleLogin(): Promise<void> {
  hide(loginError);
  loginButton.disabled = true;
  loginButton.textContent = "Signing in…";

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  const { session, error } = await signInWithPassword(email, password);

  loginButton.disabled = false;
  loginButton.textContent = "Log in";

  if (error || !session) {
    loginError.textContent = error ?? "Could not sign in.";
    show(loginError);
    return;
  }

  passwordInput.value = "";
  renderAuthenticated(session.user.email);
}

openDashboardUnauth.addEventListener("click", openDashboard);
openDashboardAuth.addEventListener("click", openDashboard);

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  void handleCreateTask();
});

let successTimeoutId: number | undefined;

async function handleCreateTask(): Promise<void> {
  hide(taskError);
  hide(taskSuccess);
  window.clearTimeout(successTimeoutId);

  const title = taskTitleInput.value.trim();
  if (!title) {
    taskError.textContent = "Task title cannot be empty.";
    show(taskError);
    return;
  }

  addTaskButton.disabled = true;
  addTaskButton.textContent = "Adding…";

  const { error } = await createTask(title);

  addTaskButton.disabled = false;
  addTaskButton.textContent = "Add Task";

  if (error) {
    // The session may have expired/been revoked server-side. Re-check
    // rather than assume: if it's genuinely gone, switch views outright
    // instead of showing a "signed out" message underneath a form that's
    // still claiming to be signed in.
    const stillValid = await getValidSession();
    if (!stillValid) {
      renderUnauthenticated();
      loginError.textContent = "Your session expired. Please log in again.";
      show(loginError);
      return;
    }

    taskError.textContent = error;
    show(taskError);
    return;
  }

  taskTitleInput.value = "";
  taskTitleInput.focus();
  show(taskSuccess);
  successTimeoutId = window.setTimeout(() => hide(taskSuccess), 2500);
}

logoutButton.addEventListener("click", () => {
  void handleLogout();
});

async function handleLogout(): Promise<void> {
  await signOut();
  renderUnauthenticated();
}

void init();
