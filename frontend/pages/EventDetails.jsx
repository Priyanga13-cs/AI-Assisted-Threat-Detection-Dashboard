import React from 'react';
import { ShieldAlert, ArrowLeft, Network, Server, User, Calendar, Cpu, CheckCircle, Database } from 'lucide-react';
import ConfidenceCard from '../components/ConfidenceCard';

/**
 * EventDetails Component
 * Interactive Event Investigation Page for SOC Analyst diagnostics.
 * Includes:
 * 1. Event details (Source/Destination, User, Asset, CVSS, etc.)
 * 2. AI Analysis block (Prediction, Confidence, Reason)
 * 3. Explainable AI (XAI) feature contribution list
 * 
 * Props:
 * - event: Object representing the selected security event log
 * - onClose: Callback function to go back to the logs dashboard
 */
export default function EventDetails({ event, onClose }) {
  if (!event) {
    return (
      <div className="card border-secondary p-5 text-center rounded-4" style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-color)'
      }}>
        <ShieldAlert size={48} className="text-danger mx-auto mb-3" />
        <h5 style={{ color: 'var(--text-primary)' }}>No Event Selected</h5>
        <p style={{ color: 'var(--text-secondary)' }} className="small">Please select a threat event from the logs table to investigate.</p>
        <button onClick={onClose} className="btn btn-success btn-sm rounded-pill mt-3 px-4">
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Parse CVSS color rating
  const cvssScore = parseFloat(event.cvss_score || event.cvss || 0);
  let cvssClass = 'bg-success';
  if (cvssScore >= 7.0) cvssClass = 'bg-danger';
  else if (cvssScore >= 4.0) cvssClass = 'bg-warning text-dark';

  // Evaluate XAI Rule items to check them off dynamically based on data values
  const failedAttempts = parseInt(event.failed_login_attempts || 0, 10);
  const isMalware = event.malware_detected === true || event.malware_detected === 'true' || event.malware_detected === 'True';
  const risk = parseFloat(event.risk_score || 0);
  const hasVuln = event.vulnerability_id && event.vulnerability_id !== 'null' && event.vulnerability_id !== '';

  const rulesChecklist = [
    {
      id: 'failed_logins',
      label: 'Failed login attempts > threshold',
      checked: failedAttempts > 5,
      description: `Failed login attempts: ${failedAttempts} (Threshold: 5)`
    },
    {
      id: 'unusual_time',
      label: 'Unusual login time / activity window',
      checked: (() => {
        if (!event.timestamp && !event.time) return false;
        const timeVal = event.time || event.timestamp || '';
        const timeStr = timeVal.includes('T') ? timeVal.split('T')[1] : timeVal;
        const hour = parseInt(timeStr.split(':')[0], 10);
        return !isNaN(hour) && (hour < 6 || hour > 20);
      })(),
      description: 'Activity detected between 20:00 - 06:00 (After-hours)'
    },
    {
      id: 'impossible_travel',
      label: 'Impossible travel detected / Geolocation discrepancy',
      checked: event.source_country !== event.destination_country && (event.source_country === 'CN' || event.source_country === 'RU' || event.source_country === 'KP'),
      description: `Cross-border packet source country flag: ${event.source_country || 'N/A'}`
    },
    {
      id: 'high_frequency',
      label: 'High event frequency / Anomaly risk metric spike',
      checked: risk > 80 || isMalware || hasVuln,
      description: `Anomalous security signature match with high Risk Score: ${risk}`
    }
  ];

  return (
    <div className="event-details-view container-fluid py-2">
      {/* Back navigation header */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <button
          onClick={onClose}
          className="btn btn-dark border text-white rounded-circle p-2 d-flex align-items-center justify-content-center hover-mint"
          style={{ width: '40px', height: '40px', borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-surface)' }}
          title="Back to Dashboard"
        >
          <ArrowLeft size={18} style={{ color: 'var(--text-primary)' }} />
        </button>
        <div>
          <h3 className="fw-bold m-0 d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <span className="text-success">{event.id || event.event_id}</span>
            <span className="fs-5 fw-normal" style={{ color: 'var(--text-secondary)' }}>| Event Investigation Hub</span>
          </h3>
          <p style={{ color: 'var(--text-secondary)' }} className="small m-0 mt-0.5">Analyst triage and machine learning explanation metrics</p>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Side: Event Properties Sheet */}
        <div className="col-lg-6 col-12">
          <div className="card rounded-4 p-4 h-100" style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.08)'
          }}>
            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2 pb-3" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)' }}>
              <Database size={18} className="text-success" />
              <span>Event Details</span>
            </h5>

            <div className="row g-4">
              {/* Properties Grid */}
              <div className="col-6">
                <div className="d-flex align-items-start gap-2">
                  <Network size={16} className="mt-1" style={{ color: 'var(--text-secondary)' }} />
                  <div>
                    <label className="xsmall text-uppercase tracking-wider" style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>Source IP</label>
                    <div className="font-mono text-info fw-bold">{event.source || event.source_ip || '0.0.0.0'}</div>
                  </div>
                </div>
              </div>

              <div className="col-6">
                <div className="d-flex align-items-start gap-2">
                  <Network size={16} className="mt-1" style={{ color: 'var(--text-secondary)' }} />
                  <div>
                    <label className="xsmall text-uppercase tracking-wider" style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>Destination IP</label>
                    <div className="font-mono" style={{ color: 'var(--text-primary)' }}>{event.target || event.destination_ip || 'Internal Network'}</div>
                  </div>
                </div>
              </div>

              <div className="col-6">
                <div className="d-flex align-items-start gap-2">
                  <User size={16} className="mt-1" style={{ color: 'var(--text-secondary)' }} />
                  <div>
                    <label className="xsmall text-uppercase tracking-wider" style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>User Identity</label>
                    <div className="fw-semibold" style={{ color: 'var(--text-primary)' }}>{event.username || 'System Operator'}</div>
                  </div>
                </div>
              </div>

              <div className="col-6">
                <div className="d-flex align-items-start gap-2">
                  <Cpu size={16} className="mt-1" style={{ color: 'var(--text-secondary)' }} />
                  <div>
                    <label className="xsmall text-uppercase tracking-wider" style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>Event Type</label>
                    <div className="fw-semibold" style={{ color: 'var(--text-primary)' }}>{event.name || event.event_type || 'Generic Incident'}</div>
                  </div>
                </div>
              </div>

              <div className="col-6">
                <div className="d-flex align-items-start gap-2">
                  <Calendar size={16} className="mt-1" style={{ color: 'var(--text-secondary)' }} />
                  <div>
                    <label className="xsmall text-uppercase tracking-wider" style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>Timestamp</label>
                    <div className="font-mono small" style={{ color: 'var(--text-secondary)' }}>{event.time || event.timestamp}</div>
                  </div>
                </div>
              </div>

              <div className="col-6">
                <div className="d-flex align-items-start gap-2">
                  <Server size={16} className="mt-1" style={{ color: 'var(--text-secondary)' }} />
                  <div>
                    <label className="xsmall text-uppercase tracking-wider" style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>Targeted Asset</label>
                    <div style={{ color: 'var(--text-primary)' }}>{event.asset_name || event.device_name || 'Datacenter Mainframe'}</div>
                  </div>
                </div>
              </div>

              <div className="col-6">
                <div>
                  <label className="xsmall text-uppercase tracking-wider d-block mb-1" style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>Threat Severity</label>
                  <span className={`badge bg-${(event.severity || 'low').toLowerCase() === 'critical' ? 'danger' : (event.severity || 'low').toLowerCase() === 'high' ? 'warning text-dark' : 'success'} px-3 py-1.5 rounded-pill fw-bold text-uppercase`}>
                    {event.severity || 'LOW'}
                  </span>
                </div>
              </div>

              <div className="col-6">
                <div>
                  <label className="xsmall text-uppercase tracking-wider d-block mb-1" style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>Vulnerability CVSS Score</label>
                  <span className={`badge ${cvssClass} px-3 py-1.5 rounded-pill fw-bold`}>
                    {cvssScore > 0 ? cvssScore.toFixed(1) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: AI Analysis & Explainable AI */}
        <div className="col-lg-6 col-12">
          <div className="d-flex flex-column gap-4 h-100">
            {/* AI Summary and Dial */}
            <ConfidenceCard confidence={event.confidence} prediction={event.prediction} />

            {/* Explainable AI block */}
            <div className="card rounded-4 p-4 flex-grow-1" style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.08)'
            }}>
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2 pb-3" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)' }}>
                <CheckCircle size={18} className="text-success" />
                <span>Explainable AI (Rule Attribution)</span>
              </h5>
              
              <p style={{ color: 'var(--text-secondary)' }} className="small mb-4">
                The classification model flagged this event based on the following threshold logic and heuristics contributions:
              </p>

              <div className="d-flex flex-column gap-3">
                {rulesChecklist.map((rule) => (
                  <div key={rule.id} className="d-flex align-items-start gap-3 p-3 rounded-3 border" style={{
                    backgroundColor: rule.checked ? 'rgba(16, 185, 129, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                    borderColor: rule.checked ? 'var(--accent-mint)' : 'var(--border-color)',
                    transition: 'all 0.2s ease'
                  }}>
                    <input
                      type="checkbox"
                      checked={rule.checked}
                      readOnly
                      className="form-check-input mt-1"
                      style={{
                        backgroundColor: rule.checked ? '#10b981' : 'transparent',
                        borderColor: rule.checked ? '#10b981' : 'var(--border-color)',
                        pointerEvents: 'none'
                      }}
                      title={rule.label}
                    />
                    <div>
                      <div className={`fw-bold small ${rule.checked ? 'text-success' : 'text-secondary'}`}>
                        {rule.label}
                      </div>
                      <div style={{ color: 'var(--text-secondary)' }} className="xsmall mt-1">{rule.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
