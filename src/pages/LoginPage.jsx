// src/pages/LoginPage.jsx
// Login + Register + Forgot Password + Reset Password (via token in URL)

import { useGoogleLogin } from "@react-oauth/google";
import React, { useState, useEffect } from "react";
import { authAPI } from "../services/api";
import LoginShowcase from "../components/LoginShowcase";
import "../styles/login.css";

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

// Views: "login" | "register" | "forgot" | "reset" | "forgot-sent"
export default function LoginPage({ onLogin, onRegister }) {
  const [view, setView]         = useState("login");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [name, setName]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPass, setNewPass]   = useState("");
  const [resetToken, setResetToken] = useState("");
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [showPassword, setShowPassword]   = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Check for ?token= in URL on mount (deep-link from reset email)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (t) {
      setResetToken(t);
      setView("reset");
      // Clean URL without reloading
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  function clear() { setError(""); setSuccess(""); }

  // ── Email / Password login ──────────────────────────────────────────────
  async function handleEmailLogin(e) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true); clear();
    try {
      await onLogin("email", { email, password });
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    }
    setLoading(false);
  }

  // ── Register ───────────────────────────────────────────────────────────
  async function handleRegister(e) {
    e.preventDefault();
    if (!email.trim() || !name.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true); clear();
    try {
      await onRegister(email, name, password);
    } catch (err) {
      setError(err.message || "Registration failed.");
    }
    setLoading(false);
  }

  // ── Forgot password request ────────────────────────────────────────────
  async function handleForgotPassword(e) {
    e.preventDefault();
    if (!email.trim()) { setError("Please enter your email."); return; }
    setLoading(true); clear();
    try {
      await authAPI.forgotPassword(email.trim());
      setView("forgot-sent");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
    setLoading(false);
  }

  // ── Reset password confirm ─────────────────────────────────────────────
  async function handleResetPassword(e) {
    e.preventDefault();
    if (!newPass.trim() || newPass.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true); clear();
    try {
      await authAPI.resetPassword(resetToken, newPass);
      setSuccess("Password reset successfully! You can now sign in.");
      setView("login");
      setResetToken("");
    } catch (err) {
      setError(err.message || "Reset failed. The link may have expired.");
    }
    setLoading(false);
  }

  // ── Google OAuth ───────────────────────────────────────────────────────
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        await onLogin("google", tokenResponse.access_token);
      } catch (err) {
        setError("Google login failed.");
      }
    },
    onError: () => setError("Google login failed."),
  });

  // ── Left panel (always the same) ───────────────────────────────────────
  const leftPanel = (
    <div className="login-left">
      <div className="login-brand">
        <h1>Trackify</h1>
        <p>Your entire job hunt, in one place.</p>
      </div>
      <LoginShowcase />
    </div>
  );

  // ── Alert helpers ──────────────────────────────────────────────────────
  const ErrorBox = ({ msg }) => msg ? (
    <div className="login-alert login-alert-error">{msg}</div>
  ) : null;

  const SuccessBox = ({ msg }) => msg ? (
    <div className="login-alert login-alert-success">{msg}</div>
  ) : null;

  // ══════════════════════════════════════════════════════════════════════════
  // VIEWS
  // ══════════════════════════════════════════════════════════════════════════

  // ── LOGIN view ────────────────────────────────────────────────────────
  if (view === "login") return (
    <div className="login-page">
      {leftPanel}
      <div className="login-right">
        <div className="login-form-container">
          <h2>Welcome back</h2>
          <p className="subtitle">Sign in to continue to your dashboard.</p>

          <button className="btn-google" onClick={() => googleLogin()}>
            <GoogleIcon />
            Continue with Google
          </button>
          <div className="login-divider"><span>or sign in with email</span></div>

          <SuccessBox msg={success} />
          <ErrorBox   msg={error} />

          <form className="login-form" onSubmit={handleEmailLogin}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Email address</label>
              <input className="form-control" type="email" placeholder="you@example.com"
                value={email} onChange={e => { setEmail(e.target.value); clear(); }} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Password</label>
              <div className="password-field-wrapper">
                <input className="form-control" type={showPassword ? "text" : "password"} placeholder="Enter your password"
                  value={password} onChange={e => { setPassword(e.target.value); clear(); }} />
                <button type="button" className="password-toggle-btn" onClick={() => setShowPassword(v => !v)} aria-label="Toggle password visibility">
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Forgot password link */}
            <div style={{ textAlign: "right", marginTop: -4 }}>
              <button type="button" className="login-text-btn"
                onClick={() => { setView("forgot"); clear(); }}>
                Forgot password?
              </button>
            </div>

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="login-footer-text">
            Don't have an account?{" "}
            <a href="#register" onClick={e => { e.preventDefault(); setView("register"); clear(); }}>
              Create one free
            </a>
          </p>
        </div>
      </div>
    </div>
  );

  // ── REGISTER view ─────────────────────────────────────────────────────
  if (view === "register") return (
    <div className="login-page">
      {leftPanel}
      <div className="login-right">
        <div className="login-form-container">
          <h2>Create account</h2>
          <p className="subtitle">Start tracking your job hunt today.</p>

          <button className="btn-google" onClick={() => googleLogin()}>
            <GoogleIcon />
            Continue with Google
          </button>
          <div className="login-divider"><span>or register with email</span></div>

          <ErrorBox msg={error} />

          <form className="login-form" onSubmit={handleRegister}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Full Name</label>
              <input className="form-control" type="text" placeholder="Your name"
                value={name} onChange={e => { setName(e.target.value); clear(); }} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Email address</label>
              <input className="form-control" type="email" placeholder="you@example.com"
                value={email} onChange={e => { setEmail(e.target.value); clear(); }} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Password</label>
              <div className="password-field-wrapper">
                <input className="form-control" type={showPassword ? "text" : "password"} placeholder="At least 6 characters"
                  value={password} onChange={e => { setPassword(e.target.value); clear(); }} />
                <button type="button" className="password-toggle-btn" onClick={() => setShowPassword(v => !v)} aria-label="Toggle password visibility">
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Confirm Password</label>
              <div className="password-field-wrapper">
                <input className="form-control" type={showConfirmPassword ? "text" : "password"} placeholder="Re-enter your password"
                  value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); clear(); }} />
                <button type="button" className="password-toggle-btn" onClick={() => setShowConfirmPassword(v => !v)} aria-label="Toggle confirm password visibility">
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <p className="login-footer-text">
            Already have an account?{" "}
            <a href="#login" onClick={e => { e.preventDefault(); setView("login"); clear(); }}>
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );

  // ── FORGOT PASSWORD view ──────────────────────────────────────────────
  if (view === "forgot") return (
    <div className="login-page">
      {leftPanel}
      <div className="login-right">
        <div className="login-form-container">
          <h2>Reset password</h2>
          <p className="subtitle">
            Enter your registered email and we'll send a reset link.
          </p>

          <ErrorBox msg={error} />

          <form className="login-form" onSubmit={handleForgotPassword}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Email address</label>
              <input className="form-control" type="email" placeholder="you@example.com"
                value={email} onChange={e => { setEmail(e.target.value); clear(); }} />
            </div>
            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? "Sending…" : "Send Reset Link"}
            </button>
          </form>

          <p className="login-footer-text">
            <a href="#login" onClick={e => { e.preventDefault(); setView("login"); clear(); }}>
              ← Back to sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );

  // ── FORGOT SENT confirmation ──────────────────────────────────────────
  if (view === "forgot-sent") return (
    <div className="login-page">
      {leftPanel}
      <div className="login-right">
        <div className="login-form-container">
          <div className="login-sent-icon">✉️</div>
          <h2>Check your email</h2>
          <p className="subtitle" style={{ marginBottom: 24 }}>
            If <strong>{email}</strong> is registered, a password reset link has been
            sent. The link expires in <strong>1 hour</strong>.
          </p>
          <div className="login-alert login-alert-success">
            Check your inbox (and spam folder) for the reset link.
          </div>
          <p className="login-footer-text" style={{ marginTop: 24 }}>
            <a href="#login" onClick={e => { e.preventDefault(); setView("login"); clear(); }}>
              ← Back to sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );

  // ── RESET PASSWORD view (deep-link from email) ────────────────────────
  if (view === "reset") return (
    <div className="login-page">
      {leftPanel}
      <div className="login-right">
        <div className="login-form-container">
          <h2>Set new password</h2>
          <p className="subtitle">Choose a strong password for your account.</p>

          <ErrorBox msg={error} />

          <form className="login-form" onSubmit={handleResetPassword}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>New Password</label>
              <div className="password-field-wrapper">
                <input className="form-control" type={showNewPassword ? "text" : "password"} placeholder="At least 6 characters"
                  value={newPass} onChange={e => { setNewPass(e.target.value); clear(); }} />
                <button type="button" className="password-toggle-btn" onClick={() => setShowNewPassword(v => !v)} aria-label="Toggle password visibility">
                  {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? "Resetting…" : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return null;
}

// ── Google SVG icon ────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}
