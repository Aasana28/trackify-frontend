// src/components/AddApplicationModal.jsx
// Modal form for adding or editing a job application

import React, { useState, useEffect } from "react";
import "../styles/modal.css";

const STATUSES = ["Applied", "Interview Scheduled", "Offer Received", "Rejected"];

const EMPTY_FORM = {
  company: "", role: "", location: "", salary: "",
  status: "Applied", appliedDate: "", followUpDate: "",
  notes: "", link: "", mood: "Neutral"
};

export default function AddApplicationModal({ onClose, onSave, initial }) {
  const [form, setForm] = useState(EMPTY_FORM);

  // If editing, pre-fill the form
  useEffect(() => {
    if (initial) setForm({ ...EMPTY_FORM, ...initial });
    else setForm(EMPTY_FORM);
  }, [initial]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function handleSubmit() {
    if (!form.company.trim() || !form.role.trim()) {
      alert("Company and Role are required.");
      return;
    }
    onSave(form);
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>{initial ? "Edit Application" : "Add Application"}</h2>
          <button className="modal-close" onClick={onClose}>&#x2715;</button>
        </div>

        <div className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label>Company *</label>
              <input className="form-control" name="company" value={form.company} onChange={handleChange} placeholder="e.g. Google" />
            </div>
            <div className="form-group">
              <label>Role *</label>
              <input className="form-control" name="role" value={form.role} onChange={handleChange} placeholder="e.g. Software Engineer" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Location</label>
              <input className="form-control" name="location" value={form.location} onChange={handleChange} placeholder="e.g. Bengaluru / Remote" />
            </div>
            <div className="form-group">
              <label>Salary (CTC)</label>
              <input className="form-control" name="salary" value={form.salary} onChange={handleChange} placeholder="e.g. 12 LPA" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Status</label>
              <select className="form-control" name="status" value={form.status} onChange={handleChange}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Applied Date</label>
              <input className="form-control" type="date" name="appliedDate" value={form.appliedDate} onChange={handleChange} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Follow-up Date</label>
              <input className="form-control" type="date" name="followUpDate" value={form.followUpDate} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Job Link</label>
              <input className="form-control" name="link" value={form.link} onChange={handleChange} placeholder="https://..." />
            </div>
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              className="form-control"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Anything useful — referral, recruiter name, tech stack..."
              style={{ resize: "vertical" }}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            {initial ? "Save Changes" : "Add Application"}
          </button>
        </div>
      </div>
    </div>
  );
}
