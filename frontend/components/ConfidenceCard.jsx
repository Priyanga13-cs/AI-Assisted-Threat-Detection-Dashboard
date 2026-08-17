import React from 'react';

/**
 * ConfidenceCard Component
 * Renders an interactive radial gauge/dial representing the AI model's prediction confidence score.
 * Features glassmorphism card styling with dynamic gradients.
 * 
 * Props:
 * - confidence: Number (0-100)
 * - prediction: String ('Normal', 'Suspicious', 'Critical')
 */
export default function ConfidenceCard({ confidence = 85, prediction = 'Normal' }) {
  // Determine color theme based on prediction type
  let colorClass = 'text-success';
  let strokeColor = '#10b981'; // Green for normal
  let trailColor = 'rgba(16, 185, 129, 0.1)';

  if (prediction === 'Critical') {
    colorClass = 'text-danger';
    strokeColor = '#ef4444'; // Red for critical
    trailColor = 'rgba(239, 68, 68, 0.1)';
  } else if (prediction === 'Suspicious') {
    colorClass = 'text-warning';
    strokeColor = '#f59e0b'; // Amber for suspicious
    trailColor = 'rgba(245, 158, 11, 0.1)';
  }

  // Calculate SVG circular stroke parameters
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (confidence / 100) * circumference;

  return (
    <div className="confidence-card p-4 rounded-4" style={{
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border-color)',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.08)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease'
    }}>
      <h6 className="text-secondary xsmall text-uppercase tracking-wider mb-3 fw-bold" style={{ color: 'var(--text-secondary)' }}>Prediction Confidence</h6>
      <div className="d-flex align-items-center gap-4">
        {/* Radial Progress Gauge */}
        <div className="position-relative" style={{ width: '120px', height: '120px' }}>
          <svg className="w-100 h-100" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
            {/* Background Trail Circle */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="transparent"
              stroke={trailColor}
              strokeWidth="10"
            />
            {/* Active Confidence Progress Circle */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="transparent"
              stroke={strokeColor}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{
                transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                filter: `drop-shadow(0 0 6px ${strokeColor})`
              }}
            />
          </svg>
          {/* Centered Percentage Display */}
          <div className="position-absolute top-50 start-50 translate-middle text-center">
            <span className="fs-3 fw-extrabold" style={{ color: 'var(--text-primary)' }}>{confidence}%</span>
          </div>
        </div>

        {/* Text descriptions */}
        <div className="flex-grow-1">
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="xsmall fw-semibold" style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>AI Classification:</span>
            <span className={`badge bg-dark border border-${strokeColor === '#10b981' ? 'success' : strokeColor === '#ef4444' ? 'danger' : 'warning'} ${colorClass} px-2 py-0.5 rounded`}>
              {prediction}
            </span>
          </div>
          <p className="small mb-0 mt-2" style={{ color: 'var(--text-secondary)' }}>
            The neural net classifier matches features against Mitre ATT&CK definitions with high likelihood.
          </p>
        </div>
      </div>
    </div>
  );
}
