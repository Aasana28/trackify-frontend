// src/pages/ApplicationsPage.jsx
// Full application list with search, filter, add, edit, delete, and PDF export

import React, { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import StatusBadge from "../components/StatusBadge";
import AddApplicationModal from "../components/AddApplicationModal";
import "../styles/applications.css";

const STATUSES = ["All", "Applied", "Interview Scheduled", "Offer Received", "Rejected"];

// ─── SVG Icons ───
const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const EditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14H6L5,6"/>
    <path d="M10,11v6"/><path d="M14,11v6"/>
    <path d="M9,6V4h6v2"/>
  </svg>
);
const PDFIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);
const LinkIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);

export default function ApplicationsPage({ applications, onAdd, onEdit, onDelete }) {
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatus] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  // ─── Filter logic ───
  const filtered = applications.filter(app => {
    const matchSearch =
      app.company.toLowerCase().includes(search.toLowerCase()) ||
      app.role.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || app.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // ─── PDF export: full list ───
  function exportFullListPDF() {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("JTS - Job Applications Report", 14, 18);
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(`Generated on ${new Date().toLocaleDateString("en-IN")}`, 14, 26);

    autoTable(doc, {
      startY: 32,
      head: [["Company", "Role", "Location", "Salary", "Status", "Applied Date"]],
      body: applications.map(a => [
        a.company, a.role, a.location || "-", a.salary || "-", a.status, a.appliedDate || "-"
      ]),
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [44, 95, 46] },
      alternateRowStyles: { fillColor: [245, 245, 242] },
    });

    doc.save("JTS_Applications.pdf");
  }

  // ─── Open modal for add ───
  function handleAdd() {
    setEditTarget(null);
    setShowModal(true);
  }

  // ─── Open modal for edit ───
  function handleEdit(app) {
    setEditTarget(app);
    setShowModal(true);
  }

  // ─── Save from modal ───
  function handleSave(form) {
    if (editTarget) {
      onEdit({ ...editTarget, ...form });
    } else {
      onAdd(form);
    }
    setShowModal(false);
  }

  return (
    <div className="page-wrapper">
      <h1 className="page-title">Applications</h1>
      <p className="page-subtitle">Manage and track all your job applications.</p>

      {/* ─── Toolbar ─── */}
      <div className="applications-toolbar">
        <div className="search-box">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search company or role..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={statusFilter}
          onChange={e => setStatus(e.target.value)}
        >
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <div className="toolbar-spacer" />

        <button className="btn btn-ghost" onClick={exportFullListPDF}>
          <PDFIcon /> Export PDF
        </button>
        <button className="btn btn-primary" onClick={handleAdd}>
          + Add Application
        </button>
      </div>

      {/* ─── Table ─── */}
      <div className="applications-table-wrapper">
        <table className="applications-table">
          <thead>
            <tr>
              <th>Company / Role</th>
              <th>Location</th>
              <th>Salary</th>
              <th>Status</th>
              <th>Applied Date</th>
              <th>Follow-up</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="empty-state">
                    <h3>No applications found</h3>
                    <p>{search || statusFilter !== "All" ? "Try adjusting your filters." : "Add your first application using the button above."}</p>
                  </div>
                </td>
              </tr>
            ) : filtered.map(app => (
              <tr key={app.id}>
                <td>
                  <div className="company-name">{app.company}</div>
                  <div className="role-name">{app.role}</div>
                </td>
                <td className="salary-cell">{app.location || "-"}</td>
                <td className="salary-cell">{app.salary || "-"}</td>
                <td><StatusBadge status={app.status} full /></td>
                <td className="date-cell">{app.appliedDate || "-"}</td>
                <td className="date-cell" style={{ color: app.followUpDate ? "var(--warning)" : "var(--text-muted)" }}>
                  {app.followUpDate || "-"}
                </td>
                <td>
                  <div className="actions-cell">
                    {app.link && (
                      <a href={app.link} target="_blank" rel="noreferrer">
                        <button className="icon-btn" title="Open job link"><LinkIcon /></button>
                      </a>
                    )}
                    <button className="icon-btn" title="Edit" onClick={() => handleEdit(app)}><EditIcon /></button>
                    <button className="icon-btn danger" title="Delete" onClick={() => onDelete(app.id)}><TrashIcon /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ─── Modal ─── */}
      {showModal && (
        <AddApplicationModal
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          initial={editTarget}
        />
      )}
    </div>
  );
}
