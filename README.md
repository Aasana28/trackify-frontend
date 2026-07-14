# JTS — Job Tracking System

A productivity-focused web application to help job seekers organise and monitor their entire job-hunting process in one place.

---

## How to Run

```bash
cd jts
npm install
npm start
```

The app opens at `http://localhost:3000`.

---

## Project Structure

```
jts/
├── public/
│   └── index.html
├── src/
│   ├── pages/
│   │   ├── LoginPage.jsx           — Login with Google (simulated) or email/password
│   │   ├── DashboardPage.jsx       — Stats, charts, health score, recent applications
│   │   ├── ApplicationsPage.jsx    — Full CRUD with search, filter, PDF export
│   │   ├── TimelinePage.jsx        — Per-application timeline + individual PDF export
│   │   ├── RemindersPage.jsx       — In-app reminder system
│   │   ├── BrainDumpPage.jsx       — [UNIQUE] Post-interview reflection log
│   │   └── MockInterviewPage.jsx   — [UNIQUE] AI-powered mock interview simulator
│   ├── components/
│   │   ├── Sidebar.jsx             — Navigation sidebar
│   │   ├── Navbar.jsx              — Top bar with theme toggle and date
│   │   ├── AddApplicationModal.jsx — Add/Edit application form modal
│   │   ├── StatusBadge.jsx         — Colored status pill
│   │   └── HealthScore.jsx         — Circular score indicator
│   ├── styles/
│   │   ├── global.css              — CSS variables, themes, layout, utilities
│   │   ├── sidebar.css
│   │   ├── navbar.css
│   │   ├── dashboard.css
│   │   ├── applications.css
│   │   ├── modal.css
│   │   ├── timeline.css
│   │   ├── reminders.css
│   │   ├── login.css
│   │   └── braindump.css           — Styles for both Brain Dump and Mock Interview
│   ├── data/
│   │   └── mockData.js             — Sample data (replace with API calls post-backend)
│   ├── context/
│   │   └── ThemeContext.jsx        — Light/Dark theme provider
│   ├── App.jsx                     — Root component with routing and global state
│   └── index.js                    — React DOM entry point
└── package.json
```

---

## Features

### Core
- Job application logging with company, role, location, salary, notes, links
- Status tracking: Applied, Interview Scheduled, Offer Received, Rejected
- Follow-up reminders (in-app)
- Dashboard with bar chart, pie chart, and Job Hunt Health Score
- Search and filter on the applications page
- PDF export: full list + individual application with timeline
- Timeline view per application
- Light and Dark theme
- Login page with Google button and email/password (simulated)

### Unique Features
1. **Post-Interview Brain Dump** — Answer 3 structured questions right after an interview: what went well, what you struggled with, and what you will do differently. Builds a personal improvement log over time.
2. **Mock Interview Simulator** — Select any tracked application and a question type. AI generates 5 role-specific questions. You answer each one and receive structured AI feedback: Strengths, Weaknesses, and a Better Answer example.

---

## Backend Integration Notes

When Django + PostgreSQL backend is ready:
- Replace mock data in `src/data/mockData.js` with `fetch()` calls to your API endpoints
- Replace simulated login in `LoginPage.jsx` with real Google OAuth flow
- The `ThemeContext` and all UI logic require no changes
- All state in `App.jsx` maps directly to CRUD API operations
