// src/pages/RemindersPage.jsx
// Reminders with date + time + email notification support.

import React, { useState } from "react";
import "../styles/reminders.css";

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14H6L5,6"/>
    <path d="M10,11v6"/><path d="M14,11v6"/><path d="M9,6V4h6v2"/>
  </svg>
);

const BellIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

function isOverdue(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date(new Date().toDateString());
}

export default function RemindersPage({ reminders, onAdd, onToggle, onDelete, applications }) {
  const [form, setForm]       = useState({ applicationId: "", message: "", date: "", time: "" });
  const [saved, setSaved]     = useState(false);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setSaved(false);
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleAdd() {
    if (!form.message.trim() || !form.date) {
      alert("Please fill in the reminder message and date.");
      return;
    }
    setLoading(true);
    const app = applications.find(a => a.id === Number(form.applicationId));
    await onAdd({
      company:       app?.company || "General",
      applicationId: Number(form.applicationId) || null,
      message:       form.message,
      date:          form.date,
      remind_time:   form.time || null,
      done:          false,
    });
    setForm({ applicationId: "", message: "", date: "", time: "" });
    setSaved(true);
    setTimeout(() => setSaved(false), 4000);
    setLoading(false);
  }

  const pending = reminders.filter(r => !r.done);
  const done    = reminders.filter(r =>  r.done);

  return (
    <div className="page-wrapper">
      <h1 className="page-title">Reminders</h1>
      <p className="page-subtitle">Stay on top of follow-ups and deadlines. Email alerts sent automatically.</p>

      <div className="reminders-layout">
        {/* ─── Add Reminder ─── */}
        <div className="card add-reminder-card">
          <h3>New Reminder</h3>

          {saved && (
            <div className="reminder-success-banner">
              <BellIcon /> Reminder set successfully! An email will be sent at the scheduled time.
            </div>
          )}

          <div className="form-group">
            <label>Linked Application (optional)</label>
            <select className="form-control" name="applicationId" value={form.applicationId} onChange={handleChange}>
              <option value="">Not linked to any application</option>
              {applications.map(a => (
                <option key={a.id} value={a.id}>{a.company} — {a.role}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Reminder Message *</label>
            <input className="form-control" name="message" value={form.message}
              onChange={handleChange} placeholder="e.g. Follow up on interview result" />
          </div>

          <div className="form-group">
            <label>Date *</label>
            <input className="form-control" type="date" name="date"
              value={form.date} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Time (optional — for exact email alert)</label>
            <input className="form-control" type="time" name="time"
              value={form.time} onChange={handleChange} />
            <div className="form-hint">Leave blank to trigger at midnight on the date.</div>
          </div>

          <div className="reminder-email-notice">
            <BellIcon />
            An email notification will be sent to your registered address at the scheduled time.
          </div>

          <button className="btn btn-primary" style={{ width: "100%" }}
            onClick={handleAdd} disabled={loading}>
            {loading ? "Saving…" : "Set Reminder"}
          </button>
        </div>

        {/* ─── Reminders List ─── */}
        <div>
          {/* Pending */}
          <div className="card reminders-list-card" style={{ marginBottom: 20 }}>
            <h3>Pending ({pending.length})</h3>
            {pending.length === 0 ? (
              <div className="no-reminders">No pending reminders. You are all caught up! 🎉</div>
            ) : pending.map(r => (
              <div className="reminder-item" key={r.id}>
                <button
                  className={`reminder-check ${r.done ? "done" : ""}`}
                  onClick={() => onToggle(r.id)}
                  title="Mark as done"
                />
                <div className="reminder-content">
                  <div className="reminder-company">{r.company}</div>
                  <div className="reminder-message">{r.message}</div>
                  <div className={`reminder-date ${isOverdue(r.date) ? "overdue" : ""}`}>
                    {isOverdue(r.date) ? "Overdue — " : ""}{r.date}
                    {r.remind_time ? ` at ${r.remind_time.slice(0, 5)}` : ""}
                  </div>
                  {r.email_sent && (
                    <div className="reminder-email-sent-badge">✉ Email sent</div>
                  )}
                </div>
                <button className="reminder-delete" onClick={() => onDelete(r.id)} title="Delete">
                  <TrashIcon />
                </button>
              </div>
            ))}
          </div>

          {/* Completed */}
          {done.length > 0 && (
            <div className="card reminders-list-card">
              <h3>Completed ({done.length})</h3>
              {done.map(r => (
                <div className="reminder-item" key={r.id} style={{ opacity: 0.55 }}>
                  <button className="reminder-check done" onClick={() => onToggle(r.id)} title="Mark pending" />
                  <div className="reminder-content">
                    <div className="reminder-company">{r.company}</div>
                    <div className="reminder-message done">{r.message}</div>
                    <div className="reminder-date">{r.date}{r.remind_time ? ` at ${r.remind_time.slice(0,5)}` : ""}</div>
                  </div>
                  <button className="reminder-delete" onClick={() => onDelete(r.id)}><TrashIcon /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
