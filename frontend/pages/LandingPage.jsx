import React, { useEffect } from 'react';
import { Sun, Moon, ArrowRight, Shield, Zap, Globe } from 'lucide-react';
import '../styles/LandingPage.css';

export default function LandingPage({ onNavigate, theme, toggleTheme }) {
  useEffect(() => {
    // Robust removal of Spline logo watermark from shadow DOM
    let intervalId;
    const hideSplineLogo = () => {
      const viewer = document.querySelector('spline-viewer');
      if (viewer && viewer.shadowRoot) {
        const logo = viewer.shadowRoot.querySelector('#logo');
        if (logo) {
          logo.style.display = 'none';
          logo.remove();
          return true;
        }
      }
      return false;
    };

    intervalId = setInterval(() => {
      if (hideSplineLogo()) clearInterval(intervalId);
    }, 50);

    hideSplineLogo();

    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
    }, 15000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="landing-body">
      {/* Theme Toggle */}
      <button onClick={toggleTheme} className="btn-theme-toggle" title="Toggle Theme Mode">
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* Ambient light blobs */}
      <div className="ambient-blob blob-1" />
      <div className="ambient-blob blob-2" />

      {/* Spline 3D Globe Background */}
      <div className="spline-container">
        <spline-viewer url="https://prod.spline.design/U0tqb4deFtcdXE9U/scene.splinecode"></spline-viewer>
      </div>

      {/* Hero Content Overlay */}
      <main className="hero-container">
        <section className="hero-content">

          {/* Pre-title Badge */}
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Infosys Security Operations Center
          </div>

          {/* Headline */}
          <h1 className="hero-title">
            <span className="infosys-blue">Infosys</span><br />
            Threat Detection<br />
            <span className="gradient-text">Dashboard</span>
          </h1>

          {/* Sub-description */}
          <p className="hero-desc">
            Safeguard your enterprise operations in real-time. Monitor, analyze, and neutralize zero-day vulnerabilities with AI-powered threat intelligence.
          </p>

          {/* CTA Buttons */}
          <div className="hero-actions">
            <button onClick={() => onNavigate('login')} className="btn-join">
              Get Started
              <ArrowRight size={16} strokeWidth={2.5} />
            </button>
          </div>

          {/* Stats Strip */}
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-value">99.9%</span>
              <span className="stat-label">Uptime SLA</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">2.4ms</span>
              <span className="stat-label">Avg Response</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">10K+</span>
              <span className="stat-label">Threats Blocked</span>
            </div>
          </div>

        </section>
      </main>
    </div>
  );
}
