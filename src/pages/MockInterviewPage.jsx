// src/pages/MockInterviewPage.jsx
// AI-powered Mock Interview Simulator.
// All Anthropic API calls go through /api/ai/chat/ (Django proxy) — key stays server-side.

import React, { useState } from "react";
import { aiAPI } from "../services/api";
import "../styles/braindump.css";

const QUESTION_TYPES = [
  "Technical (DSA / Coding)",
  "System Design",
  "Behavioural (HR)",
  "Role-specific Knowledge",
  "Mixed",
];
const TOTAL_QUESTIONS = 5;

export default function MockInterviewPage({ applications }) {
  const [selectedAppId, setSelectedAppId] = useState("");
  const [questionType, setQuestionType]   = useState("Mixed");
  const [session, setSession]             = useState(null);
  const [currentQ, setCurrentQ]           = useState(0);
  const [answer, setAnswer]               = useState("");
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState("");
  const [finished, setFinished]           = useState(false);

  const selectedApp = applications.find(a => a.id === Number(selectedAppId));

  // ── Step 1: Generate all questions via backend AI proxy ───────────────────
  async function startSession() {
    if (!selectedAppId) { setError("Please select an application to start."); return; }
    setLoading(true); setError("");

    const prompt =
      `You are a strict but fair interviewer at ${selectedApp.company} hiring for: ${selectedApp.role}.\n\n` +
      `Generate exactly ${TOTAL_QUESTIONS} interview questions of type: ${questionType}.\n\n` +
      `Rules:\n` +
      `- Questions must be specific to the role "${selectedApp.role}" at "${selectedApp.company}".\n` +
      `- Number them 1 to ${TOTAL_QUESTIONS}, one per line.\n` +
      `- Output ONLY the numbered questions — no preamble, no answers, no commentary.\n\n` +
      `Example:\n1. First question here\n2. Second question here`;

    try {
      const text = await aiAPI.chat({
        messages: [{ role: "user", content: prompt }],
      });

      const questions = text
        .split("\n")
        .filter(line => /^\d+\./.test(line.trim()))
        .map(line => line.replace(/^\d+\.\s*/, "").trim())
        .filter(Boolean)
        .slice(0, TOTAL_QUESTIONS);

      if (questions.length === 0) {
        setError("Failed to generate questions. Please try again.");
        setLoading(false);
        return;
      }

      setSession({ company: selectedApp.company, role: selectedApp.role, questions, answers: [], feedbacks: [] });
      setCurrentQ(0);
      setAnswer("");
      setFinished(false);
    } catch (err) {
      setError(err.message || "Failed to connect to AI. Please try again.");
    }
    setLoading(false);
  }

  // ── Step 2: Submit answer, get AI feedback ────────────────────────────────
  async function submitAnswer() {
    if (!answer.trim()) { setError("Please type your answer before submitting."); return; }
    setLoading(true); setError("");

    const question = session.questions[currentQ];
    const prompt =
      `You are an expert interviewer at ${session.company} for the role of ${session.role}.\n\n` +
      `The candidate was asked:\n"${question}"\n\n` +
      `The candidate answered:\n"${answer}"\n\n` +
      `Respond in exactly this format (use these exact labels):\n\n` +
      `Strengths: [what the candidate did well — 1-2 sentences]\n` +
      `Weaknesses: [what was missing or could be improved — 1-2 sentences]\n` +
      `Better Answer: [a concise example of a stronger answer — 2-3 sentences]`;

    try {
      const feedback = await aiAPI.chat({
        messages: [{ role: "user", content: prompt }],
      });

      const updatedAnswers   = [...session.answers, answer];
      const updatedFeedbacks = [...session.feedbacks, feedback];
      setSession(prev => ({ ...prev, answers: updatedAnswers, feedbacks: updatedFeedbacks }));
      setAnswer("");

      if (currentQ + 1 >= session.questions.length) setFinished(true);
      else setCurrentQ(prev => prev + 1);
    } catch (err) {
      setError(err.message || "Failed to get AI feedback. Please try again.");
    }
    setLoading(false);
  }

  function resetSession() { setSession(null); setFinished(false); setCurrentQ(0); setAnswer(""); setError(""); }

  function parseFeedback(text) {
    const sections = { Strengths: "", Weaknesses: "", "Better Answer": "" };
    Object.keys(sections).forEach(key => {
      const regex = new RegExp(`${key}:\\s*([\\s\\S]*?)(?=(Strengths:|Weaknesses:|Better Answer:|$))`, "i");
      const match = text.match(regex);
      if (match) sections[key] = match[1].trim();
    });
    return sections;
  }

  const FB_COLORS = {
    "Strengths":     { bg: "var(--success-light)", border: "var(--success)", label: "var(--success)" },
    "Weaknesses":    { bg: "var(--danger-light)",  border: "var(--danger)",  label: "var(--danger)"  },
    "Better Answer": { bg: "var(--info-light)",    border: "var(--info)",    label: "var(--info)"    },
  };

  return (
    <div className="page-wrapper">
      <h1 className="page-title">Mock Interview Simulator</h1>
      <p className="page-subtitle">
        AI-generated questions specific to your role — with structured feedback on every answer.
      </p>

      <div className="mock-layout">
        {/* ─── Setup panel ─── */}
        <div className="card mock-setup-card">
          <h3>Session Setup</h3>
          <p className="form-desc">Select a job and question type. You'll get {TOTAL_QUESTIONS} questions with AI feedback on each answer.</p>

          <div className="form-group">
            <label>Application</label>
            <select className="form-control" value={selectedAppId}
              onChange={e => setSelectedAppId(e.target.value)} disabled={!!session}>
              <option value="">Select a role to practice for</option>
              {applications.map(a => (
                <option key={a.id} value={a.id}>{a.company} — {a.role}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Question Type</label>
            <select className="form-control" value={questionType}
              onChange={e => setQuestionType(e.target.value)} disabled={!!session}>
              {QUESTION_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          <div style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 14px", fontSize: "0.83rem", color: "var(--text-secondary)", marginBottom: 18 }}>
            {TOTAL_QUESTIONS} questions per session. Answer each one, get AI feedback, then move on.
          </div>

          {error && (
            <div style={{ background: "var(--danger-light)", color: "var(--danger)", border: "1px solid var(--danger)", borderRadius: 8, padding: "10px 14px", fontSize: "0.85rem", marginBottom: 14 }}>
              {error}
            </div>
          )}

          {!session ? (
            <button className="btn btn-primary" style={{ width: "100%" }} onClick={startSession} disabled={loading}>
              {loading ? "Generating Questions…" : "Start Mock Interview"}
            </button>
          ) : (
            <button className="btn btn-ghost" style={{ width: "100%" }} onClick={resetSession}>
              End Session
            </button>
          )}
        </div>

        {/* ─── Session panel ─── */}
        <div className="card mock-session-card">
          {!session ? (
            <div className="mock-idle">
              <h3>No active session</h3>
              <p>Configure your session on the left and click Start Mock Interview to begin.</p>
            </div>

          ) : finished ? (
            /* ── Summary screen ── */
            <div>
              <div className="mock-summary">
                <h3>Session Complete 🎉</h3>
                <p>You answered all {TOTAL_QUESTIONS} questions for <strong>{session.company} — {session.role}</strong>. Review your feedback below.</p>
                <button className="btn btn-primary" onClick={resetSession}>Start New Session</button>
              </div>

              {session.questions.map((q, i) => {
                const fb = parseFeedback(session.feedbacks[i] || "");
                return (
                  <div key={i} style={{ marginBottom: 28, borderTop: "1px solid var(--border)", paddingTop: 20 }}>
                    <div className="mock-q-label">Question {i + 1}</div>
                    <div className="mock-question-text" style={{ marginBottom: 10 }}>{q}</div>
                    <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Your Answer</div>
                    <div style={{ fontSize: "0.88rem", color: "var(--text-secondary)", background: "var(--bg-primary)", borderRadius: 8, padding: "10px 14px", marginBottom: 14, border: "1px solid var(--border)" }}>
                      {session.answers[i]}
                    </div>
                    {Object.entries(FB_COLORS).map(([key, c]) => fb[key] ? (
                      <div key={key} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 8, padding: "12px 14px", marginBottom: 10 }}>
                        <div style={{ fontSize: "0.75rem", fontWeight: 700, color: c.label, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{key}</div>
                        <div style={{ fontSize: "0.88rem", color: "var(--text-primary)", lineHeight: 1.65 }}>{fb[key]}</div>
                      </div>
                    ) : null)}
                  </div>
                );
              })}
            </div>

          ) : (
            /* ── Active question ── */
            <div>
              <div className="mock-header">
                <div className="mock-meta">{session.company} — {session.role}</div>
                <div className="mock-progress">Question {currentQ + 1} of {session.questions.length}</div>
              </div>

              {/* Progress bar */}
              <div style={{ height: 4, background: "var(--border)", borderRadius: 2, marginBottom: 22 }}>
                <div style={{ height: "100%", background: "var(--accent)", borderRadius: 2, width: `${((currentQ) / session.questions.length) * 100}%`, transition: "width 0.3s ease" }} />
              </div>

              <div className="mock-question-block">
                <div className="mock-q-label">Question {currentQ + 1}</div>
                <div className="mock-question-text">{session.questions[currentQ]}</div>
              </div>

              {/* Feedback from previous question */}
              {currentQ > 0 && session.feedbacks[currentQ - 1] && (() => {
                const fb = parseFeedback(session.feedbacks[currentQ - 1]);
                return (
                  <div style={{ marginBottom: 18, padding: 14, background: "var(--accent-light)", border: "1px solid var(--accent)", borderRadius: 10 }}>
                    <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
                      Feedback on Previous Answer
                    </div>
                    {Object.entries(FB_COLORS).map(([key, c]) => fb[key] ? (
                      <div key={key} style={{ marginBottom: 8 }}>
                        <span style={{ fontWeight: 600, fontSize: "0.83rem", color: c.label }}>{key}: </span>
                        <span style={{ fontSize: "0.87rem", color: "var(--text-primary)" }}>{fb[key]}</span>
                      </div>
                    ) : null)}
                  </div>
                );
              })()}

              {error && (
                <div style={{ background: "var(--danger-light)", color: "var(--danger)", border: "1px solid var(--danger)", borderRadius: 8, padding: "10px 14px", fontSize: "0.85rem", marginBottom: 14 }}>
                  {error}
                </div>
              )}

              <div className="mock-answer-block">
                <label>Your Answer</label>
                <textarea value={answer} onChange={e => setAnswer(e.target.value)}
                  placeholder="Type your answer here. Be as detailed as you would in a real interview…"
                  disabled={loading} />
              </div>

              {loading && (
                <div className="mock-loading">
                  <div className="spinner" />
                  Analysing your answer…
                </div>
              )}

              <div className="mock-actions">
                <button className="btn btn-primary" onClick={submitAnswer} disabled={loading}>
                  {loading ? "Getting feedback…" : currentQ + 1 === session.questions.length ? "Submit Final Answer" : "Submit & Next →"}
                </button>
                <button className="btn btn-ghost" onClick={resetSession} disabled={loading}>End Session</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
