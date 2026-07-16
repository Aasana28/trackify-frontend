// src/services/api.js
// Central file for all backend API calls.

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

// ─── Helper: get token ────────────────────────────────────────────────────
function getToken() {
  return localStorage.getItem("jts_access_token");
}

// ─── Helper: authenticated fetch ─────────────────────────────────────────
async function request(method, endpoint, body = null) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const config = { method, headers };
  if (body) config.body = JSON.stringify(body);

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (response.status === 401) {
    localStorage.removeItem("jts_access_token");
    localStorage.removeItem("jts_refresh_token");
    localStorage.removeItem("jts_user");
    window.location.reload();
    return;
  }

  // DELETE returns 204 with no body
  if (response.status === 204) return null;

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || data.detail || "Something went wrong");
  return data;
}

// ─── AUTH ─────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (email, name, password) =>
    request("POST", "/auth/register/", { email, name, password }),

  login: (email, password) =>
    request("POST", "/auth/login/", { email, password }),

  googleLogin: (access_token) =>
    request("POST", "/auth/google/", { access_token }),

  getProfile: () =>
    request("GET", "/auth/me/"),

  // Password Reset
  forgotPassword: (email) =>
    request("POST", "/auth/forgot-password/", { email }),

  resetPassword: (token, new_password) =>
    request("POST", "/auth/reset-password/", { token, new_password }),

  changePassword: (current_password, new_password) =>
    request("POST", "/auth/change-password/", { current_password, new_password }),

  // Activity Tracking
  getActivity: () =>
    request("GET", "/auth/activity/"),

  recordAccess: () =>
    request("POST", "/auth/record-access/", {}),

  heartbeat: () =>
    request("POST", "/auth/heartbeat/", {}),
};

// ─── APPLICATIONS ─────────────────────────────────────────────────────────
export const applicationsAPI = {
  getAll: (filters = {}) => {
    let query = "";
    if (filters.status && filters.status !== "All") query += `?status=${filters.status}`;
    if (filters.search) query += `${query ? "&" : "?"}search=${filters.search}`;
    return request("GET", `/applications/${query}`);
  },
  create: (data) => request("POST", "/applications/", data),
  update: (id, data) => request("PUT", `/applications/${id}/`, data),
  delete: (id) => request("DELETE", `/applications/${id}/`),
  addTimeline: (id, data) => request("POST", `/applications/${id}/timeline/`, data),
};

// ─── REMINDERS ────────────────────────────────────────────────────────────
export const remindersAPI = {
  getAll: () => request("GET", "/reminders/"),
  create: (data) => request("POST", "/reminders/", data),
  toggle: (id) => request("POST", `/reminders/${id}/toggle/`),
  delete: (id) => request("DELETE", `/reminders/${id}/`),
};

// ─── BRAIN DUMPS ──────────────────────────────────────────────────────────
export const brainDumpAPI = {
  getAll: () => request("GET", "/braindumps/"),
  create: (data) => request("POST", "/braindumps/", data),
  delete: (id) => request("DELETE", `/braindumps/${id}/`),
};

// ─── AI (proxied through Django backend — key stays server-side) ───────────
export const aiAPI = {
  /**
   * chat({ messages: [{role, content}], system?: string })
   * Returns the AI's plain-text response string.
   */
  chat: async ({ messages, system = "" }) => {
    const data = await request("POST", "/ai/chat/", { messages, system });
    return data.content;
  },
};
