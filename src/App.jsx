// src/App.jsx
// Root component — handles auth, data fetching, and routing.

import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";

import Sidebar    from "./components/Sidebar";
import Navbar     from "./components/Navbar";

import LoginPage         from "./pages/LoginPage";
import DashboardPage     from "./pages/DashboardPage";
import ApplicationsPage  from "./pages/ApplicationsPage";
import TimelinePage      from "./pages/TimelinePage";
import RemindersPage     from "./pages/RemindersPage";
import BrainDumpPage     from "./pages/BrainDumpPage";
import MockInterviewPage from "./pages/MockInterviewPage";
import SettingsPage      from "./pages/SettingsPage";

import { authAPI, applicationsAPI, remindersAPI, brainDumpAPI } from "./services/api";
import "./styles/global.css";

// ─── Helper: backend sends applied_date / follow_up_date (snake_case),
//     but the UI (table + form) reads appliedDate / followUpDate (camelCase).
//     Without this mapping, dates vanish from the table after save/reload. ──
function mapApplicationFromApi(app) {
  return {
    ...app,
    appliedDate: app.applied_date || "",
    followUpDate: app.follow_up_date || "",
  };
}

// ─── Layout shell (always shown when logged in) ──────────────────────────────
function AppLayout({ children, user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar
        user={user}
        onLogout={onLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}
      <div className="main-content">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        {children}
      </div>
    </div>
  );
}

// ─── Tracks real time spent in the app (heartbeat every 30s, paused when tab hidden) ──
const HEARTBEAT_INTERVAL_MS = 30000; // must match HEARTBEAT_INTERVAL_SECONDS in backend views.py

function UsageTracker() {
  useEffect(() => {
    const sendHeartbeat = () => {
      // Only count time while the tab is actually visible/active
      if (document.visibilityState === "visible") {
        authAPI.heartbeat().catch(() => {});
      }
    };

    const intervalId = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, []);
  return null;
}

// ─── Full-screen loading spinner ─────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", background:"var(--bg-primary)" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:40, height:40, border:"3px solid var(--border)", borderTopColor:"var(--accent)", borderRadius:"50%", animation:"spin 0.7s linear infinite", margin:"0 auto 16px" }} />
        <div style={{ color:"var(--text-muted)", fontSize:"0.9rem" }}>Loading Trackify…</div>
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser]                 = useState(null);
  const [activity, setActivity]         = useState(null);   // today's usage stats
  const [applications, setApplications] = useState([]);
  const [reminders, setReminders]       = useState([]);
  const [dumps, setDumps]               = useState([]);
  const [loading, setLoading]           = useState(true);

  // ── On mount: restore session from localStorage ──────────────────────────
  useEffect(() => {
    const savedUser  = localStorage.getItem("jts_user");
    const savedToken = localStorage.getItem("jts_access_token");
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      fetchAllData();
    } else {
      setLoading(false);
    }
  }, []);

  // ── Fetch all user data in parallel ──────────────────────────────────────
  async function fetchAllData() {
    try {
      const [apps, rems, dps, act] = await Promise.all([
        applicationsAPI.getAll(),
        remindersAPI.getAll(),
        brainDumpAPI.getAll(),
        authAPI.getActivity(),
      ]);
      setApplications(apps.map(mapApplicationFromApi));
      setReminders(rems);
      setDumps(dps);
      setActivity(act);
    } catch (err) {
      console.error("Failed to load data:", err);
    }
    setLoading(false);
  }

  // ── Auth handlers ─────────────────────────────────────────────────────────
  async function handleLogin(type, credentials) {
    let response;
    if (type === "google") {
      response = await authAPI.googleLogin(credentials);
    } else {
      response = await authAPI.login(credentials.email, credentials.password);
    }
    localStorage.setItem("jts_access_token",  response.access);
    localStorage.setItem("jts_refresh_token", response.refresh);
    localStorage.setItem("jts_user",          JSON.stringify(response.user));
    setUser(response.user);
    await fetchAllData();
  }

  async function handleRegister(email, name, password) {
    const response = await authAPI.register(email, name, password);
    localStorage.setItem("jts_access_token",  response.access);
    localStorage.setItem("jts_refresh_token", response.refresh);
    localStorage.setItem("jts_user",          JSON.stringify(response.user));
    setUser(response.user);
    await fetchAllData();
  }

  function handleLogout() {
    localStorage.removeItem("jts_access_token");
    localStorage.removeItem("jts_refresh_token");
    localStorage.removeItem("jts_user");
    setUser(null);
    setApplications([]);
    setReminders([]);
    setDumps([]);
    setActivity(null);
  }
  function handleUserUpdate(updatedFields) {
    const updated = { ...user, ...updatedFields };
    localStorage.setItem("jts_user", JSON.stringify(updated));
    setUser(updated);
  }

  // ── Application CRUD ──────────────────────────────────────────────────────
  async function handleAddApplication(form) {
    try {
      const newApp = await applicationsAPI.create({
        company: form.company, role: form.role, location: form.location,
        salary: form.salary, status: form.status,
        applied_date: form.appliedDate || null,
        follow_up_date: form.followUpDate || null,
        notes: form.notes, link: form.link,
      });
      setApplications(prev => [mapApplicationFromApi(newApp), ...prev]);
    } catch (err) { alert("Failed to add: " + err.message); }
  }

  async function handleEditApplication(updated) {
    try {
      const prevApp = applications.find(a => a.id === updated.id);
      const statusChanged = prevApp && prevApp.status !== updated.status;

      const saved = await applicationsAPI.update(updated.id, {
        company: updated.company, role: updated.role, location: updated.location,
        salary: updated.salary, status: updated.status,
        applied_date: updated.appliedDate || null,
        follow_up_date: updated.followUpDate || null,
        notes: updated.notes, link: updated.link,
      });
      const mapped = mapApplicationFromApi(saved);
      setApplications(prev => prev.map(a => a.id === mapped.id ? mapped : a));

      if (statusChanged) {
        try {
          const newEntry = await applicationsAPI.addTimeline(updated.id, {
            stage: updated.status,
            date: new Date().toISOString().slice(0, 10),
          });
          setApplications(prev => prev.map(a =>
            a.id === updated.id ? { ...a, timeline: [...(a.timeline || []), newEntry] } : a
          ));
        } catch (e) { /* non-critical, ignore */ }
      }
    } catch (err) { alert("Failed to update: " + err.message); }
  }

  async function handleDeleteApplication(id) {
    if (!window.confirm("Delete this application?")) return;
    try {
      await applicationsAPI.delete(id);
      setApplications(prev => prev.filter(a => a.id !== id));
    } catch (err) { alert("Failed to delete: " + err.message); }
  }
  async function handleAddTimelineStage(appId, data) {
    try {
      const newEntry = await applicationsAPI.addTimeline(appId, data);
      setApplications(prev => prev.map(a =>
        a.id === appId ? { ...a, timeline: [...(a.timeline || []), newEntry] } : a
      ));
    } catch (err) { alert("Failed to add stage: " + err.message); }
  }

  // ── Reminder CRUD (now includes remind_time) ──────────────────────────────
  async function handleAddReminder(r) {
    try {
      const saved = await remindersAPI.create({
        application:  r.applicationId || null,
        company:      r.company,
        message:      r.message,
        date:         r.date,
        remind_time:  r.remind_time || null,   // ← NEW: pass time field
        done:         false,
      });
      setReminders(prev => [saved, ...prev]);
    } catch (err) { alert("Failed to add reminder: " + err.message); }
  }

  async function handleToggleReminder(id) {
    try {
      const updated = await remindersAPI.toggle(id);
      setReminders(prev => prev.map(r => r.id === id ? updated : r));
    } catch (err) { alert("Failed to toggle: " + err.message); }
  }

  async function handleDeleteReminder(id) {
    try {
      await remindersAPI.delete(id);
      setReminders(prev => prev.filter(r => r.id !== id));
    } catch (err) { alert("Failed to delete: " + err.message); }
  }

  // ── Brain dump ────────────────────────────────────────────────────────────
  async function handleSaveDump(dump) {
    try {
      const saved = await brainDumpAPI.create({
        application: dump.applicationId || null,
        company: dump.company, role: dump.role,
        went_well: dump.wentWell, struggled: dump.struggled, next_time: dump.nextTime,
        ai_feedback: dump.aiFeedback || "",
      });
      setDumps(prev => [saved, ...prev]);
    } catch (err) { alert("Failed to save: " + err.message); }
  }

  async function handleDeleteDump(id) {
    try {
      await brainDumpAPI.delete(id);
      setDumps(prev => prev.filter(d => d.id !== id));
    } catch (err) { alert("Failed to delete: " + err.message); }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) return <ThemeProvider><LoadingScreen /></ThemeProvider>;

  if (!user) {
    return (
      <ThemeProvider>
        <LoginPage onLogin={handleLogin} onRegister={handleRegister} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <BrowserRouter>
        <UsageTracker />
        <AppLayout user={user} onLogout={handleLogout}>
          <Routes>
            <Route path="/"               element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard"      element={<DashboardPage applications={applications} activity={activity} />} />
            <Route path="/applications"   element={
              <ApplicationsPage
                applications={applications}
                onAdd={handleAddApplication}
                onEdit={handleEditApplication}
                onDelete={handleDeleteApplication}
              />
            } />
            <Route path="/timeline"       element={<TimelinePage applications={applications} onAddStage={handleAddTimelineStage} />} />
            <Route path="/reminders"      element={
              <RemindersPage
                reminders={reminders}
                applications={applications}
                onAdd={handleAddReminder}
                onToggle={handleToggleReminder}
                onDelete={handleDeleteReminder}
              />
            } />
            <Route path="/brain-dump"     element={<BrainDumpPage applications={applications} dumps={dumps} onSaveDump={handleSaveDump} onDeleteDump={handleDeleteDump} />} />
            <Route path="/mock-interview" element={<MockInterviewPage applications={applications} />} />
            <Route path="/settings"       element={<SettingsPage user={user} applications={applications} activity={activity} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />} />
            <Route path="*"               element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </ThemeProvider>
  );
}
