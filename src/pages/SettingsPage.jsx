// src/pages/SettingsPage.jsx
// Full settings: Profile, Appearance, Change Password, Activity stats, Data summary.

import "../styles/settings.css";
import React, { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { authAPI } from "../services/api";

// ─── Formats seconds as "1h 24m" / "24m" / "< 1m" ────────────────────────────
function formatDuration(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const hrs  = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (totalSeconds < 60) return "< 1m";
  if (hrs > 0) return `${hrs}h ${remMins}m`;
  return `${mins}m`;
}

// ─── Reusable section wrapper ─────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div className="card settings-section">
      <div className="settings-section-title">{title}</div>
      {children}
    </div>
  );
}

// ─── Inline alert (success or error) ─────────────────────────────────────────
function Alert({ type, msg }) {
  if (!msg) return null;
  const styles = {
    success: { bg: "var(--success-light)", color: "var(--success)", border: "var(--success)" },
    error:   { bg: "var(--danger-light)",  color: "var(--danger)",  border: "var(--danger)"  },
  }[type];
  return (
    <div style={{
      background: styles.bg, color: styles.color,
      border: `1px solid ${styles.border}`, borderRadius: 8,
      padding: "10px 14px", fontSize: "0.85rem", marginBottom: 14, lineHeight: 1.5,
    }}>
      {msg}
    </div>
  );
}

export default function SettingsPage({ user, applications, activity, onLogout, onUserUpdate }) {
  const { theme, toggleTheme } = useTheme();

  // ── Change-password state ─────────────────────────────────────────────────
  const [pwForm, setPwForm]   = useState({ current: "", newPass: "", confirm: "" });
  const [pwError, setPwError] = useState("");
  const [pwOk, setPwOk]       = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  function handlePwChange(e) {
    setPwError(""); setPwOk("");
    setPwForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    if (!pwForm.current || !pwForm.newPass || !pwForm.confirm) {
      setPwError("Please fill in all password fields."); return;
    }
    if (pwForm.newPass.length < 6) {
      setPwError("New password must be at least 6 characters."); return;
    }
    if (pwForm.newPass !== pwForm.confirm) {
      setPwError("New password and confirm password do not match."); return;
    }
    setPwLoading(true);
    try {
      const res = await authAPI.changePassword(pwForm.current, pwForm.newPass);
      setPwOk(res.message || "Password changed successfully.");
      setPwForm({ current: "", newPass: "", confirm: "" });
    } catch (err) {
      setPwError(err.message || "Failed to change password.");
    }
    setPwLoading(false);
  }

  // ── Change-email state ────────────────────────────────────────────────────
  const [emailForm, setEmailForm]   = useState({ newEmail: "", password: "" });
  const [emailError, setEmailError] = useState("");
  const [emailOk, setEmailOk]       = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  function handleEmailFormChange(e) {
    setEmailError(""); setEmailOk("");
    setEmailForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleChangeEmail(e) {
    e.preventDefault();
    if (!emailForm.newEmail || !emailForm.password) {
      setEmailError("Please fill in both fields."); return;
    }
    setEmailLoading(true);
    try {
      const res = await authAPI.changeEmail(emailForm.newEmail, emailForm.password);
      setEmailOk(res.message || "Email changed successfully.");
      setEmailForm({ newEmail: "", password: "" });
      if (onUserUpdate) onUserUpdate({ email: res.email });
    } catch (err) {
      setEmailError(err.message || "Failed to change email.");
    }
    setEmailLoading(false);
  }

  // ── Delete-account state ───────────────────────────────────────────────────
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError]       = useState("");
  const [deleteLoading, setDeleteLoading]   = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  async function handleDeleteAccount(e) {
    e.preventDefault();
    setDeleteError("");
    const confirmed = window.confirm(
      "This will permanently delete your account and all your data. This cannot be undone. Continue?"
    );
    if (!confirmed) return;

    setDeleteLoading(true);
    try {
      await authAPI.deleteAccount(deletePassword);
      if (onLogout) onLogout();
    } catch (err) {
      setDeleteError(err.message || "Failed to delete account.");
      setDeleteLoading(false);
    }
  }

  // ── Activity data ─────────────────────────────────────────────────────────
  const today  = activity?.today;
  const recent = activity?.recent || [];

  return (
    <div className="page-wrapper">
      <h1 className="page-title">Settings</h1>
      <p className="page-subtitle">Manage your account, security, and preferences.</p>

      {/* ── Profile ── */}
      <Section title="Profile">
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div className="settings-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: "1rem", color: "var(--text-primary)" }}>
              {user?.name || "User"}
            </div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: 2 }}>
              {user?.email}
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 4 }}>
              Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "long" }) : "—"}
            </div>
          </div>
        </div>
      </Section>

      {/* ── Appearance ── */}
      <Section title="Appearance">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 500, color: "var(--text-primary)", marginBottom: 4 }}>Theme</div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              Currently using <strong>{theme === "light" ? "Light" : "Dark"}</strong> theme.
            </div>
          </div>
          <button className="btn btn-ghost" onClick={toggleTheme}>
            Switch to {theme === "light" ? "Dark ☾" : "Light ☀︎"}
          </button>
        </div>
      </Section>

      {/* ── Change Password ── */}
      <Section title="Change Password">
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 18, lineHeight: 1.6 }}>
          Update your password. You'll receive a confirmation email after the change.
        </p>

        <Alert type="success" msg={pwOk} />
        <Alert type="error"   msg={pwError} />

        <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 420 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Current Password</label>
            <input
              className="form-control"
              type="password"
              name="current"
              value={pwForm.current}
              onChange={handlePwChange}
              placeholder="Your current password"
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>New Password</label>
            <input
              className="form-control"
              type="password"
              name="newPass"
              value={pwForm.newPass}
              onChange={handlePwChange}
              placeholder="At least 6 characters"
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Confirm New Password</label>
            <input
              className="form-control"
              type="password"
              name="confirm"
              value={pwForm.confirm}
              onChange={handlePwChange}
              placeholder="Repeat new password"
            />
          </div>
          <div>
            <button type="submit" className="btn btn-primary" disabled={pwLoading} style={{ minWidth: 160 }}>
              {pwLoading ? "Updating…" : "Update Password"}
            </button>
          </div>
        </form>
      </Section>

      {/* ── Change Email ── */}
      <Section title="Change Email">
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 18, lineHeight: 1.6 }}>
          Update the email address linked to your account. You'll receive a confirmation email at your old address.
        </p>

        <Alert type="success" msg={emailOk} />
        <Alert type="error"   msg={emailError} />

        <form onSubmit={handleChangeEmail} style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 420 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>New Email</label>
            <input
              className="form-control"
              type="email"
              name="newEmail"
              value={emailForm.newEmail}
              onChange={handleEmailFormChange}
              placeholder="new-email@example.com"
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Current Password</label>
            <input
              className="form-control"
              type="password"
              name="password"
              value={emailForm.password}
              onChange={handleEmailFormChange}
              placeholder="Confirm with your password"
            />
          </div>
          <div>
            <button type="submit" className="btn btn-primary" disabled={emailLoading} style={{ minWidth: 160 }}>
              {emailLoading ? "Updating…" : "Update Email"}
            </button>
          </div>
        </form>
      </Section>

      {/* ── Today's Activity ── */}
      <Section title="Today's Activity">
        {today ? (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, marginBottom: 20, maxWidth: 400 }}>
              <div className="settings-stat-box">
                <div className="settings-stat-value">{today.login_count}</div>
                <div className="settings-stat-label">
                  {today.login_count === 1 ? "Login today" : "Logins today"}
                </div>
              </div>
              <div className="settings-stat-box">
                <div className="settings-stat-value">{formatDuration(today.duration_seconds || 0)}</div>
                <div className="settings-stat-label">Time spent today</div>
              </div>
            </div>

            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 16 }}>
              Today you spent <strong>{formatDuration(today.duration_seconds || 0)}</strong>{" "}
              in Trackify and logged in{" "}
              <strong>{today.login_count}</strong>{" "}
              {today.login_count === 1 ? "time" : "times"}.
            </div>

            {/* 7-day history table */}
            {recent.length > 1 && (
              <>
                <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
                  Last 7 Days
                </div>
                <table style={{ width: "100%", maxWidth: 420, borderCollapse: "collapse", fontSize: "0.85rem" }}>
                  <thead>
                    <tr>
                      {["Date", "Logins", "Time Spent"].map(h => (
                        <th key={h} style={{ textAlign: "left", padding: "6px 10px", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.78rem", borderBottom: "1px solid var(--border)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map(r => (
                      <tr key={r.date} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "8px 10px", color: "var(--text-secondary)" }}>{r.date}</td>
                        <td style={{ padding: "8px 10px", color: "var(--text-primary)", fontWeight: 500 }}>{r.login_count}</td>
                        <td style={{ padding: "8px 10px", color: "var(--text-primary)", fontWeight: 500 }}>{formatDuration(r.duration_seconds || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </>
        ) : (
          <p style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>Activity data unavailable.</p>
        )}
      </Section>

      {/* ── Your Data ── */}
      <Section title="Your Data">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 16 }}>
          {[
            { label: "Total Applications", value: applications.length },
            { label: "Interviews",          value: applications.filter(a => a.status === "Interview Scheduled").length },
            { label: "Offers",              value: applications.filter(a => a.status === "Offer Received").length },
          ].map(item => (
            <div key={item.label} className="settings-stat-box">
              <div className="settings-stat-value">{item.value}</div>
              <div className="settings-stat-label">{item.label}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: "0.83rem", color: "var(--text-secondary)" }}>
          All your data is securely stored in PostgreSQL and synced across sessions.
        </p>
      </Section>

      {/* ── Danger Zone ── */}
      <Section title="Danger Zone">
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 18, lineHeight: 1.6 }}>
          Deleting your account is permanent and removes all your applications, reminders, and activity data.
        </p>

        <Alert type="error" msg={deleteError} />

        {!showDeleteConfirm ? (
          <button
            className="btn"
            style={{ background: "var(--danger)", color: "#fff", border: "none" }}
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete Account
          </button>
        ) : (
          <form onSubmit={handleDeleteAccount} style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 420 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Enter your password to confirm</label>
              <input
                className="form-control"
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Your password"
              />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="submit"
                className="btn"
                style={{ background: "var(--danger)", color: "#fff", border: "none", minWidth: 160 }}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting…" : "Confirm Delete"}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => { setShowDeleteConfirm(false); setDeleteError(""); }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </Section>
    </div>
  );
}
