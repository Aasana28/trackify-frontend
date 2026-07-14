// src/pages/DashboardPage.jsx
// Main dashboard with stats, charts, health score, recent apps, and activity tracking.

import React from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import StatusBadge from "../components/StatusBadge";
import HealthScore from "../components/HealthScore";
import "../styles/dashboard.css";

const PIE_COLORS = {
  "Applied":             "#4da6e8",
  "Interview Scheduled": "#e8a020",
  "Offer Received":      "#4dab6e",
  "Rejected":            "#e05c4b",
};

// ─── Formats seconds as "1h 24m" / "24m" / "< 1m" ────────────────────────────
function formatDuration(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const hrs  = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (totalSeconds < 60) return "< 1m";
  if (hrs > 0) return `${hrs}h ${remMins}m`;
  return `${mins}m`;
}

// ─── Small activity card shown at the top of the dashboard ──────────────────
function ActivityBanner({ activity }) {
  if (!activity) return null;
  const { today } = activity;
  const durationLabel = formatDuration(today.duration_seconds || 0);
  return (
    <div className="activity-banner">
      <div className="activity-banner-item">
        <span className="activity-banner-icon">🔑</span>
        <div>
          <div className="activity-banner-value">{today.login_count}</div>
          <div className="activity-banner-label">
            {today.login_count === 1 ? "Login today" : "Logins today"}
          </div>
        </div>
      </div>
      <div className="activity-banner-divider" />
      <div className="activity-banner-item">
        <span className="activity-banner-icon">⏱️</span>
        <div>
          <div className="activity-banner-value">{durationLabel}</div>
          <div className="activity-banner-label">Time spent today</div>
        </div>
      </div>
      <div className="activity-banner-divider" />
      <div className="activity-banner-msg">
        {`You've spent ${durationLabel} in Trackify today — keep it up!`}
      </div>
    </div>
  );
}

export default function DashboardPage({ applications, activity }) {
  const navigate = useNavigate();

  const total      = applications.length;
  const interviews = applications.filter(a => a.status === "Interview Scheduled").length;
  const offers     = applications.filter(a => a.status === "Offer Received").length;
  const rejected   = applications.filter(a => a.status === "Rejected").length;

  const statusCounts = ["Applied", "Interview Scheduled", "Offer Received", "Rejected"].map(s => ({
    name: s,
    value: applications.filter(a => a.status === s).length
  })).filter(d => d.value > 0);

  const monthMap = {};
  applications.forEach(app => {
    if (!app.appliedDate) return;
    const month = new Date(app.appliedDate).toLocaleString("en-IN", { month: "short", year: "2-digit" });
    monthMap[month] = (monthMap[month] || 0) + 1;
  });
  const barData = Object.entries(monthMap).map(([month, count]) => ({ month, count }));

  const recent = [...applications]
    .sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate))
    .slice(0, 5);

  return (
    <div className="page-wrapper">
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">Here is a snapshot of your job hunt.</p>

      {/* ─── Activity banner ─── */}
      <ActivityBanner activity={activity} />

      {/* ─── Stat cards ─── */}
      <div className="dashboard-stats">
        <div className="stat-card accent">
          <div className="stat-label">Total Applications</div>
          <div className="stat-value">{total}</div>
          <div className="stat-sub">across all statuses</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-label">Interviews</div>
          <div className="stat-value">{interviews}</div>
          <div className="stat-sub">scheduled or upcoming</div>
        </div>
        <div className="stat-card accent">
          <div className="stat-label">Offers Received</div>
          <div className="stat-value">{offers}</div>
          <div className="stat-sub">{total > 0 ? Math.round((offers / total) * 100) : 0}% conversion rate</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-label">Rejections</div>
          <div className="stat-value">{rejected}</div>
          <div className="stat-sub">every rejection is a lesson</div>
        </div>
      </div>

      {/* ─── Charts ─── */}
      <div className="dashboard-charts">
        <div className="card chart-card">
          <div className="chart-title">Applications Over Time</div>
          {barData.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>No application data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} barSize={28}>
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13 }} cursor={{ fill: "var(--bg-hover)" }} />
                <Bar dataKey="count" fill="var(--accent)" radius={[4, 4, 0, 0]} name="Applications" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card chart-card">
          <div className="chart-title">Status Breakdown</div>
          {statusCounts.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusCounts} dataKey="value" cx="50%" cy="50%" outerRadius={70} innerRadius={36}>
                  {statusCounts.map((entry, i) => (
                    <Cell key={i} fill={PIE_COLORS[entry.name] || "#999"} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13 }} />
                <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ─── Health Score ─── */}
      <div className="health-score-section">
        <HealthScore applications={applications} />
      </div>

      {/* ─── Recent applications ─── */}
      <div className="card recent-applications">
        <div style={{ padding: "18px 20px 0" }}>
          <div className="section-header">
            <div className="section-title">Recent Applications</div>
            <button className="btn btn-ghost" style={{ fontSize: "0.85rem" }} onClick={() => navigate("/applications")}>
              View All
            </button>
          </div>
        </div>
        <table className="recent-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Role</th>
              <th>Status</th>
              <th>Applied</th>
            </tr>
          </thead>
          <tbody>
            {recent.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: "center", color: "var(--text-muted)", padding: 32 }}>
                No applications yet. Add your first one.
              </td></tr>
            ) : recent.map(app => (
              <tr key={app.id} onClick={() => navigate("/applications")} style={{ cursor: "pointer" }}>
                <td className="company-cell">{app.company}</td>
                <td className="role-cell">{app.role}</td>
                <td><StatusBadge status={app.status} /></td>
                <td className="date-cell">{app.appliedDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
