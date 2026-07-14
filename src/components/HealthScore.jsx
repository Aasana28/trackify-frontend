// src/components/HealthScore.jsx
// Calculates and displays the Job Hunt Health Score (0-100)
// Score is based on: application frequency, response rate, interview conversion

import React from "react";

function calculateScore(applications) {
  if (!applications.length) return 0;

  const total = applications.length;
  const responded = applications.filter(a =>
    a.status === "Interview Scheduled" || a.status === "Offer Received"
  ).length;
  const offers = applications.filter(a => a.status === "Offer Received").length;

  // Response rate: how many got past "Applied" stage
  const responseRate = responded / total;

  // Offer rate: of those who responded, how many got offers
  const offerRate = responded > 0 ? offers / responded : 0;

  // Volume bonus: consistent applications
  const volumeScore = Math.min(total / 10, 1); // max at 10+ applications

  // Weighted score
  const raw = (responseRate * 50) + (offerRate * 30) + (volumeScore * 20);
  return Math.round(Math.min(raw, 100));
}

function getScoreLabel(score) {
  if (score >= 80) return { label: "Excellent", color: "var(--success)" };
  if (score >= 60) return { label: "Good",      color: "var(--accent)" };
  if (score >= 40) return { label: "Fair",      color: "var(--warning)" };
  return               { label: "Needs Work",   color: "var(--danger)" };
}

export default function HealthScore({ applications }) {
  const score = calculateScore(applications);
  const { label, color } = getScoreLabel(score);
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="card" style={{ padding: "22px 24px" }}>
      <div style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>
        Job Hunt Health Score
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        {/* Circular progress */}
        <div style={{ position: "relative", width: 96, height: 96, flexShrink: 0 }}>
          <svg width="96" height="96" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="40" fill="none" stroke="var(--border)" strokeWidth="8" />
            <circle
              cx="48" cy="48" r="40"
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform="rotate(-90 48 48)"
              style={{ transition: "stroke-dashoffset 0.6s ease" }}
            />
          </svg>
          <div style={{
            position: "absolute", inset: 0, display: "flex",
            flexDirection: "column", alignItems: "center", justifyContent: "center"
          }}>
            <span style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", fontFamily: "'Fraunces', serif", lineHeight: 1 }}>
              {score}
            </span>
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>/ 100</span>
          </div>
        </div>

        {/* Breakdown */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "1.1rem", fontWeight: 700, color, marginBottom: 6 }}>{label}</div>
          <p style={{ fontSize: "0.83rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
            Based on your response rate, interview conversion, and application volume.
            {score < 60 && " Keep applying consistently and follow up on pending applications."}
            {score >= 60 && score < 80 && " You are on the right track. Aim to increase follow-ups."}
            {score >= 80 && " Outstanding progress. Stay consistent and keep preparing."}
          </p>
        </div>
      </div>
    </div>
  );
}
