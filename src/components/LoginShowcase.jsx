// src/components/LoginShowcase.jsx
// Animated illustration carousel for the login page's left panel.
// Cross-fades between a few flat-style SVG illustrations, each paired
// with a short caption. Replaces the old static bullet-point list.

import React, { useState, useEffect } from "react";
import "../styles/loginShowcase.css";

const SLIDES = [
  { key: "apply",     caption: "Track every application in one place",   Illustration: ApplyIllustration },
  { key: "remind",    caption: "Never miss a follow-up with reminders",  Illustration: RemindIllustration },
  { key: "dashboard", caption: "Visualise your progress at a glance",    Illustration: DashboardIllustration },
  { key: "interview", caption: "Walk into interviews fully prepared",    Illustration: InterviewIllustration },
];

const SLIDE_DURATION_MS = 4000;

export default function LoginShowcase() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex(i => (i + 1) % SLIDES.length);
    }, SLIDE_DURATION_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="login-showcase">
      <div className="login-showcase-stage">
        {SLIDES.map((slide, i) => {
          const Illustration = slide.Illustration;
          return (
            <div
              key={slide.key}
              className={`login-showcase-slide ${i === index ? "is-active" : ""}`}
            >
              <Illustration />
            </div>
          );
        })}
      </div>

      <p className="login-showcase-caption">{SLIDES[index].caption}</p>

      <div className="login-showcase-dots">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.key}
            type="button"
            aria-label={`Show slide ${i + 1}`}
            className={`login-showcase-dot ${i === index ? "is-active" : ""}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Illustrations ──────────────────────────────────────────────────────────
// Flat-style, using whites/light-greens for contrast against the dark green
// panel background, with a warm gold accent for highlights.

function ApplyIllustration() {
  return (
    <svg viewBox="0 0 240 180" fill="none">
      <rect x="40" y="20" width="110" height="140" rx="10" fill="#ffffff" opacity="0.95"/>
      <rect x="58" y="42" width="74" height="8" rx="4" fill="#2c5f2e" opacity="0.55"/>
      <rect x="58" y="60" width="60" height="6" rx="3" fill="#2c5f2e" opacity="0.3"/>
      <rect x="58" y="74" width="60" height="6" rx="3" fill="#2c5f2e" opacity="0.3"/>
      <rect x="58" y="98" width="74" height="30" rx="6" fill="#e8f0e8"/>
      <rect x="68" y="108" width="54" height="6" rx="3" fill="#2c5f2e" opacity="0.4"/>
      <rect x="68" y="118" width="34" height="6" rx="3" fill="#2c5f2e" opacity="0.3"/>

      <rect x="120" y="50" width="90" height="110" rx="10" fill="#f2b134" opacity="0.15"/>
      <rect x="132" y="70" width="66" height="70" rx="8" fill="#ffffff"/>
      <circle cx="165" cy="95" r="14" fill="#2c5f2e" opacity="0.85"/>
      <path d="M158 95l5 5 10-11" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="145" y="118" width="40" height="6" rx="3" fill="#2c5f2e" opacity="0.35"/>
      <rect x="145" y="128" width="26" height="6" rx="3" fill="#2c5f2e" opacity="0.25"/>
    </svg>
  );
}

function RemindIllustration() {
  return (
    <svg viewBox="0 0 240 180" fill="none">
      <circle cx="120" cy="90" r="62" fill="#ffffff" opacity="0.08"/>
      <rect x="70" y="40" width="100" height="90" rx="12" fill="#ffffff"/>
      <rect x="70" y="40" width="100" height="24" rx="12" fill="#2c5f2e" opacity="0.85"/>
      <rect x="88" y="30" width="8" height="20" rx="4" fill="#2c5f2e"/>
      <rect x="144" y="30" width="8" height="20" rx="4" fill="#2c5f2e"/>
      <rect x="86" y="78" width="16" height="16" rx="3" fill="#e8f0e8"/>
      <rect x="112" y="78" width="16" height="16" rx="3" fill="#f2b134" opacity="0.9"/>
      <rect x="138" y="78" width="16" height="16" rx="3" fill="#e8f0e8"/>
      <rect x="86" y="102" width="16" height="16" rx="3" fill="#e8f0e8"/>
      <rect x="112" y="102" width="16" height="16" rx="3" fill="#e8f0e8"/>
      <rect x="138" y="102" width="16" height="16" rx="3" fill="#e8f0e8"/>

      <g transform="translate(150,105)">
        <circle cx="26" cy="26" r="26" fill="#f2b134"/>
        <path d="M26 14v13l9 6" stroke="#1f4620" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      </g>
    </svg>
  );
}

function DashboardIllustration() {
  return (
    <svg viewBox="0 0 240 180" fill="none">
      <rect x="42" y="30" width="156" height="120" rx="12" fill="#ffffff" opacity="0.95"/>
      <rect x="60" y="46" width="60" height="8" rx="4" fill="#2c5f2e" opacity="0.5"/>

      <rect x="60" y="70" width="20" height="60" rx="4" fill="#e8f0e8"/>
      <rect x="88" y="90" width="20" height="40" rx="4" fill="#2c5f2e" opacity="0.35"/>
      <rect x="116" y="60" width="20" height="70" rx="4" fill="#f2b134" opacity="0.85"/>
      <rect x="144" y="80" width="20" height="50" rx="4" fill="#2c5f2e" opacity="0.6"/>

      <circle cx="172" cy="46" r="4" fill="#2c5f2e" opacity="0.4"/>
      <circle cx="184" cy="46" r="4" fill="#2c5f2e" opacity="0.4"/>
    </svg>
  );
}

function InterviewIllustration() {
  return (
    <svg viewBox="0 0 240 180" fill="none">
      <rect x="46" y="46" width="80" height="60" rx="12" fill="#ffffff"/>
      <path d="M60 106l0 16 20-16z" fill="#ffffff"/>
      <circle cx="70" cy="70" r="9" fill="#2c5f2e" opacity="0.6"/>
      <rect x="88" y="64" width="24" height="6" rx="3" fill="#2c5f2e" opacity="0.35"/>
      <rect x="88" y="76" width="18" height="6" rx="3" fill="#2c5f2e" opacity="0.25"/>

      <rect x="122" y="86" width="80" height="60" rx="12" fill="#f2b134" opacity="0.9"/>
      <path d="M136 146l0 16 20-16z" fill="#f2b134" opacity="0.9"/>
      <circle cx="146" cy="110" r="9" fill="#1f4620"/>
      <rect x="164" y="104" width="24" height="6" rx="3" fill="#1f4620" opacity="0.7"/>
      <rect x="164" y="116" width="18" height="6" rx="3" fill="#1f4620" opacity="0.5"/>
    </svg>
  );
}
