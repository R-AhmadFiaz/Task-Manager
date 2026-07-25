import { DASHBOARD_URL } from "../lib/config.js";
import { createTask, getValidSession, signInWithPassword, signOut } from "../lib/supabaseClient.js";
function byId(id) {
    const el = document.getElementById(id);
    if (!el)
        throw new Error(`popup.html is missing #${id}`);
    return el;
}
const loadingState = byId("loading-state");
const unauthState = byId("unauthenticated-state");
const authState = byId("authenticated-state");
const loginForm = byId("login-form");
const emailInput = byId("email");
const passwordInput = byId("password");
const loginButton = byId("login-button");
const loginError = byId("login-error");
const openDashboardUnauth = byId("open-dashboard-unauth");
const accountEmail = byId("account-email");
const taskForm = byId("task-form");
const taskTitleInput = byId("task-title");
const addTaskButton = byId("add-task-button");
const taskSuccess = byId("task-success");
const taskError = byId("task-error");
const openDashboardAuth = byId("open-dashboard-auth");
const logoutButton = byId("logout-button");
function setView(view) {
    loadingState.hidden = view !== "loading";
    unauthState.hidden = view !== "unauthenticated";
    authState.hidden = view !== "authenticated";
}
function show(el) {
    el.hidden = false;
}
function hide(el) {
    el.hidden = true;
}
function openDashboard() {
    chrome.tabs.create({ url: DASHBOARD_URL });
}
function renderUnauthenticated() {
    setView("unauthenticated");
    emailInput.focus();
}
function renderAuthenticated(email) {
    setView("authenticated");
    accountEmail.textContent = email ?? "your account";
    taskTitleInput.focus();
}
async function init() {
    setView("loading");
    const session = await getValidSession();
    if (session) {
        renderAuthenticated(session.user.email);
    }
    else {
        renderUnauthenticated();
    }
}
loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    void handleLogin();
});
async function handleLogin() {
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
let successTimeoutId;
async function handleCreateTask() {
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
async function handleLogout() {
    await signOut();
    renderUnauthenticated();
}
void init();
