// src/pages/BrainDumpPage.jsx

import React, { useState } from "react";
import { aiAPI } from "../services/api";
import "../styles/braindump.css";

const EMPTY_FORM = { applicationId: "", wentWell: "", struggled: "", nextTime: "" };

function Spinner() {
  return (
    <span style={{
      display: "inline-block", width: 14, height: 14,
      border: "2px solid var(--border)", borderTopColor: "var(--accent)",
      borderRadius: "50%", animation: "spin 0.7s linear infinite", verticalAlign: "middle",
    }} />
  );
}

function CoachingPanel({ coaching, onDismiss }) {
  if (!coaching) return null;

  const sections = [
    { key: "Key Strength",        icon: "💪", color: "var(--success)",  bg: "var(--success-light)" },
    { key: "Main Improvement",    icon: "🎯", color: "var(--warning)",  bg: "var(--warning-light)" },
    { key: "Action for Tomorrow", icon: "📅", color: "var(--accent)",   bg: "var(--accent-light)"  },
    { key: "Encouragement",       icon: "✨", color: "var(--info)",     bg: "var(--info-light)"    },
  ];

  function extract(text, label) {
    const regex = new RegExp(`${label}:\\s*([\\s\\S]*?)(?=(Key Strength:|Main Improvement:|Action for Tomorrow:|Encouragement:|$))`, "i");
    const match = text.match(regex);
    return match ? match[1].trim() : "";
  }

  return (
    <div style={{ marginTop: 20, border: "1px solid var(--accent)", borderRadius: 10, overflow: "hidden" }}>
      <div style={{ background: "var(--accent)", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ color: "#fff", fontWeight: 600, fontSize: "0.9rem" }}>🤖 AI Coaching Analysis</div>
        <button onClick={onDismiss} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", cursor: "pointer", fontSize: "1.1rem" }}>×</button>
      </div>
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12, background: "var(--bg-card)" }}>
        {sections.map(({ key, icon, color, bg }) => {
          const content = extract(coaching, key);
          if (!content) return null;
          return (
            <div key={key} style={{ background: bg, border: `1px solid ${color}`, borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                {icon} {key}
              </div>
              <div style={{ fontSize: "0.88rem", color: "var(--text-primary)", lineHeight: 1.65 }}>{content}</div>
            </div>
          );
        })}
        {sections.every(({ key }) => !extract(coaching, key)) && (
          <div style={{ fontSize: "0.88rem", color: "var(--text-primary)", lineHeight: 1.7 }}>{coaching}</div>
        )}
      </div>
    </div>
  );
}

export default function BrainDumpPage({ applications, dumps, onSaveDump }) {
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saved, setSaved]         = useState(false);
  const [coaching, setCoaching]   = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError]     = useState("");

  function handleChange(e) {
    setSaved(false); setCoaching(""); setAiError("");
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSave() {
    if (!form.applicationId) { alert("Please select which application this brain dump is for."); return; }
    if (!form.wentWell.trim() && !form.struggled.trim() && !form.nextTime.trim()) {
      alert("Please fill in at least one reflection field."); return;
    }
    const app = applications.find(a => a.id === Number(form.applicationId));
    await onSaveDump({
      applicationId: Number(form.applicationId),
      company:   app?.company || "Unknown",
      role:      app?.role    || "",
      wentWell:  form.wentWell,
      struggled: form.struggled,
      nextTime:  form.nextTime,
    });
    setSaved(true);
    setForm(EMPTY_FORM);
    setCoaching("");
  }

  async function handleGetCoaching() {
    if (!form.wentWell.trim() && !form.struggled.trim() && !form.nextTime.trim()) {
      setAiError("Please fill in at least one reflection field before getting AI coaching."); return;
    }
    const app = applications.find(a => a.id === Number(form.applicationId));
    setAiLoading(true); setAiError(""); setCoaching("");

    const context = [
      form.wentWell  && `What went well: ${form.wentWell}`,
      form.struggled && `What I struggled with: ${form.struggled}`,
      form.nextTime  && `What I'll do differently: ${form.nextTime}`,
    ].filter(Boolean).join("\n\n");

    const prompt =
      `You are a professional interview coach reviewing a candidate's post-interview reflection` +
      (app ? ` for the role of ${app.role} at ${app.company}` : "") + `.\n\n` +
      `Here is their reflection:\n\n${context}\n\n` +
      `Provide actionable coaching in exactly this format:\n\n` +
      `Key Strength: [one specific thing they should double down on — 1 sentence]\n` +
      `Main Improvement: [the single most important area to improve — 1-2 sentences]\n` +
      `Action for Tomorrow: [one concrete, specific action to take in the next 24 hours — 1 sentence]\n` +
      `Encouragement: [a genuine, specific motivating remark — 1 sentence]`;

    try {
      const result = await aiAPI.chat({
        messages: [{ role: "user", content: prompt }],
        system: "You are a concise, honest, and encouraging interview coach. Never give generic advice.",
      });
      setCoaching(result);
    } catch (err) {
      setAiError(err.message || "Failed to get AI coaching. Please try again.");
    }
    setAiLoading(false);
  }

  return (
    <div className="page-wrapper">
      <h1 className="page-title">Interview Brain Dump</h1>
      <p className="page-subtitle">Reflect after every interview. Get AI coaching, then save to your log.</p>

      <div className="braindump-layout">
        {/* ─── Form ─── */}
        <div className="card braindump-form-card">
          <h3>New Reflection</h3>

          <div className="form-group">
            <label>Which interview was this?</label>
            <select className="form-control" name="applicationId"
              value={form.applicationId} onChange={handleChange}>
              <option value="">Select an application</option>
              {applications.map(a => (
                <option key={a.id} value={a.id}>{a.company} — {a.role}</option>
              ))}
            </select>
          </div>

          <div className="braindump-question">
            <label>What went well?</label>
            <textarea name="wentWell" value={form.wentWell} onChange={handleChange}
              placeholder="e.g. I explained the binary search approach clearly." />
          </div>

          <div className="braindump-question">
            <label>What did I struggle with?</label>
            <textarea name="struggled" value={form.struggled} onChange={handleChange}
              placeholder="e.g. I froze on the SQL joins question." />
          </div>

          <div className="braindump-question">
            <label>What will I do differently next time?</label>
            <textarea name="nextTime" value={form.nextTime} onChange={handleChange}
              placeholder="e.g. Practice SQL joins daily." />
          </div>

          {aiError && (
            <div style={{ background: "var(--danger-light)", color: "var(--danger)", border: "1px solid var(--danger)", borderRadius: 8, padding: "10px 14px", fontSize: "0.85rem", marginBottom: 14 }}>
              {aiError}
            </div>
          )}

          {saved && (
            <div style={{ background: "var(--success-light)", color: "var(--success)", border: "1px solid var(--success)", borderRadius: 8, padding: "10px 14px", fontSize: "0.85rem", marginBottom: 14 }}>
              ✓ Reflection saved successfully!
            </div>
          )}

          <CoachingPanel coaching={coaching} onDismiss={() => setCoaching("")} />

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button className="btn btn-ghost" style={{ flex: 1 }}
              onClick={handleGetCoaching} disabled={aiLoading}>
              {aiLoading ? <><Spinner /> &nbsp;Analysing…</> : "🤖 Get AI Coaching"}
            </button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave}>
              Save Reflection
            </button>
          </div>
        </div>

        {/* ─── Past Reflections ─── */}
        <div className="card braindump-logs-card">
          <h3>Past Reflections ({dumps.length})</h3>
          {dumps.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)", fontSize: "0.88rem" }}>
              No reflections yet. Save your first one!
            </div>
          ) : [...dumps].map((d, i) => (
            <div className="dump-entry" key={d.id || i}>
              <div className="dump-entry-header">
                <div>
                  <div className="dump-company">{d.company}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: 2 }}>{d.role}</div>
                </div>
                <div className="dump-date">{d.date}</div>
              </div>
              {/* Backend returns went_well, struggled, next_time */}
              {(d.went_well || d.wentWell) && (
                <div className="dump-section">
                  <div className="dump-section-label">Went Well</div>
                  <div className="dump-section-text">{d.went_well || d.wentWell}</div>
                </div>
              )}
              {(d.struggled) && (
                <div className="dump-section">
                  <div className="dump-section-label">Struggled With</div>
                  <div className="dump-section-text">{d.struggled}</div>
                </div>
              )}
              {(d.next_time || d.nextTime) && (
                <div className="dump-section">
                  <div className="dump-section-label">Next Time</div>
                  <div className="dump-section-text">{d.next_time || d.nextTime}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
