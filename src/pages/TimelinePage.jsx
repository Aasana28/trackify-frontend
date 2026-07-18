// src/pages/TimelinePage.jsx
// Shows a visual timeline for a selected application and allows individual PDF export

import React, { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import StatusBadge from "../components/StatusBadge";
import "../styles/timeline.css";

const PDFIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14,2 14,8 20,8"/>
    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);

export default function TimelinePage({ applications, onAddStage }) {
  const [selectedId, setSelectedId] = useState(applications[0]?.id || null);
  const app = applications.find(a => a.id === selectedId);
  const [showAddForm, setShowAddForm] = useState(false);
  const [stageName, setStageName] = useState("Interview Scheduled");
  const [stageDate, setStageDate] = useState(new Date().toISOString().slice(0, 10));
  const [stageNote, setStageNote] = useState("");

  function submitStage(e) {
    e.preventDefault();
    if (!app || !onAddStage) return;
    onAddStage(app.id, { stage: stageName, date: stageDate, note: stageNote });
    setStageNote("");
    setShowAddForm(false);
  }

  // ─── Export single application PDF ───
  function exportSinglePDF() {
    if (!app) return;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(`${app.company} — ${app.role}`, 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(`Exported from JTS on ${new Date().toLocaleDateString("en-IN")}`, 14, 28);

    // Details table
    autoTable(doc, {
      startY: 36,
      head: [["Field", "Value"]],
      body: [
        ["Company",      app.company],
        ["Role",         app.role],
        ["Location",     app.location || "-"],
        ["Salary",       app.salary || "-"],
        ["Status",       app.status],
        ["Applied Date", app.appliedDate || "-"],
        ["Follow-up",    app.followUpDate || "-"],
        ["Notes",        app.notes || "-"],
      ],
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [44, 95, 46] },
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 50 } }
    });

    // Timeline table
    if (app.timeline && app.timeline.length > 0) {
      doc.setFontSize(12);
      doc.setTextColor(30);
      doc.text("Application Timeline", 14, doc.lastAutoTable.finalY + 14);
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 20,
        head: [["Stage", "Date", "Note"]],
        body: app.timeline.map(t => [t.stage, t.date, t.note || "-"]),
        styles: { fontSize: 9, cellPadding: 4 },
        headStyles: { fillColor: [44, 95, 46] },
      });
    }

    doc.save(`JTS_${app.company}_${app.role}.pdf`);
  }

  return (
    <div className="page-wrapper timeline-page">
      <h1 className="page-title">Timeline</h1>
      <p className="page-subtitle">See the full journey of each application.</p>

      {/* ─── Application selector ─── */}
      <div className="application-selector">
        <div className="form-group">
          <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Select Application
          </label>
          <select
            className="form-control"
            value={selectedId || ""}
            onChange={e => setSelectedId(Number(e.target.value))}
          >
            {applications.length === 0 && <option>No applications yet</option>}
            {applications.map(a => (
              <option key={a.id} value={a.id}>{a.company} — {a.role}</option>
            ))}
          </select>
        </div>
      </div>

      {!app ? (
        <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
          Add an application to see its timeline here.
        </div>
      ) : (
        <div className="timeline-container">
          {/* Left: Timeline track */}
          <div className="card timeline-card">
            <div className="timeline-company">{app.company}</div>
            <div className="timeline-role">{app.role} &middot; {app.location || "Location not set"}</div>

            <div className="timeline-track">
              {(app.timeline || []).map((item, index) => (
                <div className="timeline-item" key={index}>
                  <div className={`timeline-dot ${index < (app.timeline.length - 1) ? "" : ""}`} />
                  <div className="timeline-stage">{item.stage}</div>
                  <div className="timeline-date">{item.date}</div>
                  {item.note && <div className="timeline-note">{item.note}</div>}
                </div>
              ))}
              {(!app.timeline || app.timeline.length === 0) && (
                <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>No timeline stages recorded yet.</p>
              )}
            </div>

            {/* Add Stage form */}
            <div style={{ marginTop: 20 }}>
              {!showAddForm ? (
                <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
                  + Add Stage
                </button>
              ) : (
                <form onSubmit={submitStage} className="card" style={{ padding: 16, background: "var(--bg-hover)", marginTop: 4 }}>
                  <div className="form-group">
                    <label>Stage</label>
                    <select className="form-control" value={stageName} onChange={e => setStageName(e.target.value)}>
                      <option>Applied</option>
                      <option>Interview Scheduled</option>
                      <option>Interview Completed</option>
                      <option>Offer Received</option>
                      <option>Rejected</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Date</label>
                    <input type="date" className="form-control" value={stageDate} onChange={e => setStageDate(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Note (optional)</label>
                    <input type="text" className="form-control" placeholder="e.g. HR round scheduled"
                      value={stageNote} onChange={e => setStageNote(e.target.value)} />
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button type="submit" className="btn btn-primary">Save Stage</button>
                    <button type="button" className="btn btn-ghost" onClick={() => setShowAddForm(false)}>Cancel</button>
                  </div>
                </form>
              )}
            </div>

            {/* PDF buttons */}
            <div className="pdf-btn-row" style={{ marginTop: 24 }}>
              <button className="btn btn-ghost" onClick={exportSinglePDF}>
                <PDFIcon /> Export This Application
              </button>
            </div>
          </div>

          {/* Right: Application details */}
          <div className="card detail-card">
            <h3>Application Details</h3>
            <div className="detail-row">
              <span className="detail-label">Status</span>
              <span className="detail-value"><StatusBadge status={app.status} full /></span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Salary</span>
              <span className="detail-value">{app.salary || "Not specified"}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Applied On</span>
              <span className="detail-value">{app.appliedDate || "-"}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Follow-up</span>
              <span className="detail-value" style={{ color: app.followUpDate ? "var(--warning)" : "inherit" }}>
                {app.followUpDate || "Not set"}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Job Link</span>
              <span className="detail-value">
                {app.link
                  ? <a href={app.link} target="_blank" rel="noreferrer" style={{ color: "var(--accent)" }}>View Posting</a>
                  : "Not added"}
              </span>
            </div>
            {app.notes && (
              <div>
                <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 16, marginBottom: 8 }}>
                  Notes
                </div>
                <div className="detail-notes">{app.notes}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
