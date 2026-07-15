// src/components/Navbar.jsx
// Top bar showing page title, date, and theme toggle

import React from "react";
import { useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import "../styles/navbar.css";

const PAGE_TITLES = {
  "/dashboard":     { title: "Dashboard",            sub: "Overview of your job hunt" },
  "/applications":  { title: "Applications",         sub: "Manage all your job applications" },
  "/timeline":      { title: "Timeline",             sub: "Track each application's progress" },
  "/reminders":     { title: "Reminders",            sub: "Stay on top of follow-ups" },
  "/brain-dump":    { title: "Interview Brain Dump", sub: "Reflect after every interview" },
  "/mock-interview":{ title: "Mock Interview",       sub: "AI-powered interview practice" },
  "/settings":      { title: "Settings",             sub: "Manage your preferences" },
};

const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

export default function Navbar({ onMenuClick }) {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const page = PAGE_TITLES[location.pathname] || { title: "JTS", sub: "" };

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "short", year: "numeric"
  });

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="menu-toggle-btn" onClick={onMenuClick} aria-label="Open menu">
          <MenuIcon />
        </button>
        <div className="navbar-titles">
          <span className="navbar-page-title">{page.title}</span>
          <span className="navbar-breadcrumb">{page.sub}</span>
        </div>
      </div>
      <div className="navbar-right">
        <span className="navbar-date">{today}</span>
        <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle theme">
          {theme === "light" ? <MoonIcon /> : <SunIcon />}
        </button>
      </div>
    </header>
  );
}
