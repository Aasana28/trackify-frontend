// src/components/StatusBadge.jsx
// Renders a colored pill badge based on application status

import React from "react";

const STATUS_STYLES = {
  "Applied":              { bg: "var(--info-light)",    color: "var(--info)",    label: "Applied" },
  "Interview Scheduled":  { bg: "var(--warning-light)", color: "var(--warning)", label: "Interview" },
  "Offer Received":       { bg: "var(--success-light)", color: "var(--success)", label: "Offer" },
  "Rejected":             { bg: "var(--danger-light)",  color: "var(--danger)",  label: "Rejected" },
};

export default function StatusBadge({ status, full = false }) {
  const style = STATUS_STYLES[status] || { bg: "var(--bg-hover)", color: "var(--text-muted)", label: status };

  return (
    <span style={{
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: "20px",
      fontSize: "0.78rem",
      fontWeight: 600,
      background: style.bg,
      color: style.color,
      letterSpacing: "0.03em",
      whiteSpace: "nowrap"
    }}>
      {full ? status : style.label}
    </span>
  );
}
