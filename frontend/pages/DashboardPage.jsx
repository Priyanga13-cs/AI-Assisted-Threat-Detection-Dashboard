import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, ShieldAlert, AlertTriangle, Bug, Siren, Cpu,
  LayoutDashboard, Map, Database, Shield, Settings,
  LogOut, Play, Square, Download, Search, RefreshCw,
  Terminal, ShieldCheck, Sun, Moon, Info, Sliders,
  UserCheck, ShieldQuestion, Menu, Github, ExternalLink, Mail
} from 'lucide-react';
import { getEvents, getStats } from '../services/api';
import DashboardCharts from '../charts/DashboardCharts';
import EventDetails from './EventDetails';
import '../styles/DashboardPage.css';

export default function DashboardPage({ onNavigate, theme, toggleTheme }) {
  // Navigation State
  const [activePanel, setActivePanel] = useState('Overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Core Data
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    anomaliesDetected: 0,
    normalEvents: 0,
    highRiskEvents: 0,
    criticalThreats: 0
  });
  const [investigatingEventId, setInvestigatingEventId] = useState(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [eventTypeFilter, setEventTypeFilter] = useState('ALL');
  const [ipFilter, setIpFilter] = useState('ALL');
  
  // Simulator Controls
  const [isSimulating, setIsSimulating] = useState(true);
  const [simInterval, setSimInterval] = useState(12); // Speed in seconds
  const [severityAlertFilter, setSeverityAlertFilter] = useState('ALL'); // Simulator threshold

  // Vulnerability Shield Scanner State
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanTarget, setScanTarget] = useState('System Secure');
  const [scanLog, setScanLog] = useState([
    'All shield buffers loaded.',
    'Gateway proxy active.'
  ]);
  const [scanSummary, setScanSummary] = useState({ audited: 1482, vulnerabilities: 0 });
  const [vocalAlerts, setVocalAlerts] = useState(false);
  const vocalAlertsRef = useRef(vocalAlerts);
  vocalAlertsRef.current = vocalAlerts;

  const [chimeVolume, setChimeVolume] = useState(80);
  const chimeVolumeRef = useRef(chimeVolume);
  chimeVolumeRef.current = chimeVolume;

  const [selectedHeatmapDate, setSelectedHeatmapDate] = useState(null);

  // Terminal Logs State
  const [terminalLogs, setTerminalLogs] = useState([
    { id: 1, time: new Date().toLocaleTimeString(), message: 'Initialized threat diagnostics framework...', type: 'info' },
    { id: 2, time: new Date().toLocaleTimeString(), message: 'Firewall rules compiled. Shield active.', type: 'success' }
  ]);
  const [toasts, setToasts] = useState([]);
  const [toastsEnabled, setToastsEnabled] = useState(true);
  const toastsEnabledRef = useRef(toastsEnabled);
  toastsEnabledRef.current = toastsEnabled;

  const [currentUser, setCurrentUser] = useState({ username: 'Admin Operator', email: '' });
  const [liveTime, setLiveTime] = useState('--:--:--');

  const simulationIntervalRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const terminalBottomRef = useRef(null);

  // Load user details and clock
  useEffect(() => {
    const sessionUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (sessionUser.username) {
      setCurrentUser(sessionUser);
    }

    const timer = setInterval(() => {
      const now = new Date();
      setLiveTime(now.toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch initial events
  useEffect(() => {
    async function loadData() {
      const allEvents = await getEvents();
      const initialStats = await getStats();
      setEvents(allEvents);
      setStats(initialStats);
    }
    loadData();
  }, []);

  // Auto scroll terminal logs to bottom
  useEffect(() => {
    if (terminalBottomRef.current) {
      terminalBottomRef.current.scrollTop = terminalBottomRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  // Toast Alerts Trigger
  const triggerToast = (message, type = 'info', forceShow = false) => {
    if (!toastsEnabledRef.current && !forceShow) return;
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  // Log to terminal console
  const logTerminal = (message, type = 'info') => {
    setTerminalLogs((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        time: new Date().toLocaleTimeString('en-US', { hour12: false }),
        message,
        type
      }
    ].slice(-30));
  };

  // Threat templates for live simulation generator
  const threatTemplates = [
    { name: "Unauthorized SSH Attempt", source: "172.56.230.12", target: "Production-DB-Proxy", severity: "CRITICAL", event_type: "Brute Force" },
    { name: "Anomalous Traffic Spike Detected", source: "185.220.101.4", target: "Asset-Storage-S3", severity: "WARNING", event_type: "Reconnaissance" },
    { name: "SQL Injection Probe Blocked", source: "109.112.5.88", target: "Payment-Backend-API", severity: "CRITICAL", event_type: "Malware" },
    { name: "DNS Query Leak Vulnerability Check", source: "192.168.12.94", target: "Gateway-Router-03", severity: "WARNING", event_type: "Phishing" }
  ];

  // Threat Simulator Generator Hook
  useEffect(() => {
    if (isSimulating) {
      const delayMs = simInterval * 1000;
      simulationIntervalRef.current = setInterval(() => {
        // Pick a template
        let template = threatTemplates[Math.floor(Math.random() * threatTemplates.length)];
        
        // Respect simulator severity settings
        if (severityAlertFilter === 'CRITICAL' && template.severity !== 'CRITICAL') {
          template = threatTemplates.find(t => t.severity === 'CRITICAL') || template;
        } else if (severityAlertFilter === 'WARNING' && template.severity !== 'WARNING') {
          template = threatTemplates.find(t => t.severity === 'WARNING') || template;
        }

        const time = new Date().toLocaleTimeString('en-US', { hour12: false });
        const prediction = template.severity === 'CRITICAL' ? 'Critical' : 'Suspicious';
        const confidence = template.severity === 'CRITICAL' ? 95 : 78;
        const reasons = [
          `${template.name} triggered anomaly alert`,
          `Targeting enterprise asset ${template.target}`,
          `High risk activity signature matched`
        ];

        const newIncident = {
          id: `EVT-${Date.now().toString().slice(-4)}`,
          event_id: `EVT-${Date.now().toString().slice(-4)}`,
          time: time,
          timestamp: time,
          name: template.name,
          event_type: template.event_type,
          source: template.source,
          source_ip: template.source,
          target: template.target,
          destination_ip: template.target,
          severity: template.severity,
          status: 'UNRESOLVED',
          is_high_risk: template.severity === 'CRITICAL',
          prediction: prediction,
          confidence: confidence,
          reasons: reasons,
          failed_login_attempts: template.event_type === 'Brute Force' ? 12 : 0,
          cvss_score: template.severity === 'CRITICAL' ? 9.8 : 6.5,
          risk_score: template.severity === 'CRITICAL' ? 95 : 78
        };

        setEvents((prev) => [newIncident, ...prev]);

        // Dynamic high-tech sound synthesiser alarm and vocal readouts
        if (vocalAlertsRef.current) {
          try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(template.severity === 'CRITICAL' ? 880 : 440, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.08 * (chimeVolumeRef.current / 100), audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.35);
          } catch (e) {
            console.error(e);
          }

          try {
            const msg = new SpeechSynthesisUtterance();
            msg.text = `Warning. ${template.severity.toLowerCase()} threat ${template.event_type.toLowerCase()} detected.`;
            msg.volume = 0.65 * (chimeVolumeRef.current / 100);
            msg.rate = 1.05;
            window.speechSynthesis.speak(msg);
          } catch (e) {
            console.error(e);
          }
        }

        const alertType = template.severity === 'CRITICAL' ? 'critical' : 'warning';
        logTerminal(`Intrusion anomaly detected: ${template.name} targeting host ${template.target}.`, alertType);
        triggerToast(`${template.name} from ${template.source} targeting ${template.target}`, alertType);

        setStats((prev) => {
          const isCrit = template.severity === 'CRITICAL';
          return {
            ...prev,
            totalEvents: prev.totalEvents + 1,
            anomaliesDetected: prev.anomaliesDetected + 1,
            criticalThreats: isCrit ? prev.criticalThreats + 1 : prev.criticalThreats,
            highRiskEvents: !isCrit ? prev.highRiskEvents + 1 : prev.highRiskEvents,
            normalEvents: prev.normalEvents // remains same
          };
        });
      }, delayMs);
    } else {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    }

    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    };
  }, [isSimulating, simInterval, severityAlertFilter]);

  // Handler functions
  const handleInvestigate = (id) => {
    setInvestigatingEventId(id);
    setActivePanel('Event Investigation');
    setEvents((prev) => 
      prev.map((evt) => {
        if ((evt.id || evt.event_id) === id) {
          logTerminal(`Threat Vector #${id} is now flagged as [UNDER INVESTIGATION] by ${currentUser.username}.`, 'info');
          triggerToast(`Investigating: ${evt.name || evt.event_type}`, 'info');
          return { ...evt, status: 'UNDER_INVESTIGATION' };
        }
        return evt;
      })
    );
  };

  const handleResolve = (id) => {
    setEvents((prev) => 
      prev.map((evt) => {
        if ((evt.id || evt.event_id) === id) {
          logTerminal(`Threat Vector #${id} (${evt.name || evt.event_type}) successfully mitigated and resolved.`, 'success');
          triggerToast(`Resolved: ${evt.name || evt.event_type}`, 'info');
          
          setStats((prevStats) => ({
            ...prevStats,
            activeIncidents: Math.max(0, prevStats.activeIncidents - 1)
          }));

          return { ...evt, status: 'RESOLVED' };
        }
        return evt;
      })
    );
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    logTerminal('Terminating analyst session...', 'warning');
    setTimeout(() => {
      onNavigate('landing');
    }, 800);
  };

  // Diagnostic scanner simulation hook
  const startDiagnosticsScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanProgress(0);
    setScanLog(['Starting diagnostics scanner...', 'Acquiring security locks...']);
    
    let currentPct = 0;
    const scanSteps = [
      { progress: 10, target: 'Gateway Router SSL certificate', log: 'SSL credentials verified. No expiration flags.' },
      { progress: 30, target: 'Network port configuration', log: 'Scanning ports... 22, 80, 443 are audited. Shields locked.' },
      { progress: 50, target: 'Database clustering permission locks', log: 'Permissions check completed. Row limits audited.' },
      { progress: 75, target: 'Public S3 Buckets access keys', log: 'Audit complete. ACL parameters verify private access.' },
      { progress: 90, target: 'Threat database correlation logs', log: 'Analyzing log ratios... Outdated log entries found.' },
      { progress: 100, target: 'Active Clearance profiles', log: 'System audit done. clearance Operator logs sanitized.' }
    ];

    scanIntervalRef.current = setInterval(() => {
      currentPct += 5;
      setScanProgress(currentPct);

      const step = scanSteps.find(s => s.progress === currentPct);
      if (step) {
        setScanTarget(step.target);
        setScanLog(prev => [...prev, `[AUDITING] ${step.target}`, `[SUCCESS] ${step.log}`]);
      }

      if (currentPct >= 100) {
        clearInterval(scanIntervalRef.current);
        setIsScanning(false);
        setScanSummary({ audited: 1482, vulnerabilities: 1 });
        logTerminal('Diagnostics audit completed. 0 critical vulnerabilities found.', 'success');
        triggerToast('System Diagnostics Audit Completed!', 'success');
      }
    }, 200);
  };

  // Filter calculations
  const uniqueEventTypes = ['ALL', ...new Set(events.map(e => e.name || e.event_type).filter(Boolean))];
  const uniqueSourceIps = ['ALL', ...new Set(events.map(e => e.source || e.source_ip).filter(Boolean))];

  const filteredEvents = events.filter((evt) => {
    const nameStr = (evt.name || evt.event_type || '').toLowerCase();
    const sourceStr = (evt.source || evt.source_ip || '').toLowerCase();
    const targetStr = (evt.target || evt.destination_ip || '').toLowerCase();
    const searchLower = searchQuery.toLowerCase();

    const matchesSearch = nameStr.includes(searchLower) || 
                          sourceStr.includes(searchLower) || 
                          targetStr.includes(searchLower);

    let matchesSeverity = true;
    if (severityFilter !== 'ALL') {
      if (severityFilter === 'CRITICAL') matchesSeverity = evt.severity === 'CRITICAL';
      else if (severityFilter === 'WARNING') matchesSeverity = evt.severity === 'HIGH' || evt.severity === 'WARNING';
      else if (severityFilter === 'RESOLVED') matchesSeverity = evt.status === 'RESOLVED';
    }

    const matchesEventType = eventTypeFilter === 'ALL' || (evt.name || evt.event_type) === eventTypeFilter;
    const matchesIp = ipFilter === 'ALL' || (evt.source || evt.source_ip) === ipFilter;

    let matchesHeatmapDate = true;
    if (selectedHeatmapDate) {
      let evtDate;
      if (evt.timestamp && evt.timestamp.includes('T')) {
        evtDate = new Date(evt.timestamp);
      } else {
        evtDate = new Date();
        if (evt.time) {
          const parts = evt.time.split(':');
          if (parts.length >= 2) {
            evtDate.setHours(parseInt(parts[0]), parseInt(parts[1]), parts[2] ? parseInt(parts[2]) : 0, 0);
          }
        }
      }
      const evtMidnight = new Date(evtDate.getFullYear(), evtDate.getMonth(), evtDate.getDate());
      const selectedMidnight = new Date(selectedHeatmapDate);
      matchesHeatmapDate = evtMidnight.getTime() === selectedMidnight.getTime();
    }

    return matchesSearch && matchesSeverity && matchesEventType && matchesIp && matchesHeatmapDate;
  });

  const handleExportCSV = () => {
    // If we are on Event Investigation tab and an event is active, export that event's full detail report
    const activeEvent = activePanel === 'Event Investigation' 
      ? events.find(e => (e.id || e.event_id) === investigatingEventId) 
      : null;

    if (activeEvent) {
      const headers = ['FIELD', 'VALUE'];
      const rows = [
        ['Event ID', activeEvent.id || activeEvent.event_id || ''],
        ['Timestamp', activeEvent.timestamp || activeEvent.time || ''],
        ['Threat Type', activeEvent.name || activeEvent.event_type || ''],
        ['Severity', activeEvent.severity || ''],
        ['Source IP', activeEvent.source || activeEvent.source_ip || ''],
        ['Destination IP', activeEvent.target || activeEvent.destination_ip || ''],
        ['Username', activeEvent.username || ''],
        ['Asset Name', activeEvent.asset_name || activeEvent.target || ''],
        ['Event Status', activeEvent.status || ''],
        ['Risk Score', activeEvent.risk_score || ''],
        ['AI Verdict', activeEvent.prediction || ''],
        ['Confidence Level', `${activeEvent.confidence || 0}%`],
        ['XAI Findings', (activeEvent.reasons || []).join('; ')]
      ];

      const csvContent = [
        headers.join(','), 
        ...rows.map(r => r.map(val => {
          let str = String(val);
          if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
            str = str.replace(/"/g, '""');
            return `"${str}"`;
          }
          return `"${str}"`;
        }).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `incident_report_${activeEvent.id || activeEvent.event_id || 'unspecified'}_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      logTerminal(`Exported incident report for ${activeEvent.id || activeEvent.event_id} to CSV successfully.`, 'success');
      triggerToast(`Exported report to CSV`, 'success');
      return;
    }

    // Default: export filtered logs list
    if (filteredEvents.length === 0) {
      triggerToast('No logs available to export.', 'warning');
      return;
    }

    const headers = ['Event ID', 'Timestamp', 'Threat Type', 'Severity', 'Source IP', 'Destination IP', 'Username', 'Status', 'Risk Score'];
    const rows = filteredEvents.map(evt => [
      evt.id || evt.event_id || '',
      evt.timestamp || evt.time || '',
      evt.name || evt.event_type || '',
      evt.severity || '',
      evt.source || evt.source_ip || '',
      evt.target || evt.destination_ip || '',
      evt.username || '',
      evt.status || '',
      evt.risk_score || ''
    ]);

    const csvContent = [
      headers.join(','), 
      ...rows.map(r => r.map(val => {
        let str = String(val);
        if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
          str = str.replace(/"/g, '""');
          return `"${str}"`;
        }
        return `"${str}"`;
      }).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `security_threat_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    logTerminal(`Exported ${filteredEvents.length} logs to CSV file successfully.`, 'success');
    triggerToast(`Exported logs to CSV`, 'info');
  };

  const handleExportPDF = () => {
    const activeEvent = events.find(e => (e.id || e.event_id) === investigatingEventId);
    if (!activeEvent) {
      triggerToast('No active event loaded to export PDF.', 'warning');
      return;
    }

    const reportWindow = window.open('', '_blank', 'width=900,height=900');
    if (!reportWindow) {
      triggerToast('Popup blocker blocked report generation window.', 'warning');
      return;
    }

    const dateStr = new Date(activeEvent.timestamp || activeEvent.time || Date.now()).toLocaleString();
    const reasonsHTML = (activeEvent.reasons || []).map(r => `<li>${r}</li>`).join('');

    reportWindow.document.write(`
      <html>
        <head>
          <title>Security Incident Report - ${activeEvent.id || activeEvent.event_id}</title>
          <style>
            body {
              font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
              color: #0f172a;
              padding: 40px;
              line-height: 1.5;
            }
            .header {
              border-bottom: 2px solid #0f172a;
              padding-bottom: 20px;
              margin-bottom: 30px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .logo {
              font-size: 20px;
              font-weight: 800;
              letter-spacing: -0.02em;
              color: #0d9488;
            }
            .report-title {
              font-size: 24px;
              font-weight: 800;
              margin: 0;
            }
            .verdict-badge {
              display: inline-block;
              padding: 6px 14px;
              border-radius: 6px;
              font-weight: bold;
              font-size: 14px;
              text-transform: uppercase;
              margin-top: 10px;
            }
            .badge-critical { background-color: #fef2f2; color: #ef4444; border: 1px solid #fee2e2; }
            .badge-warning { background-color: #fffbeb; color: #d97706; border: 1px solid #fef3c7; }
            .badge-low { background-color: #f0fdf4; color: #16a34a; border: 1px solid #dcfce7; }
            
            .metadata-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 40px;
            }
            .metadata-item {
              border-bottom: 1px solid #e2e8f0;
              padding: 10px 0;
            }
            .label {
              font-size: 11px;
              text-transform: uppercase;
              color: #64748b;
              font-weight: 600;
            }
            .value {
              font-size: 15px;
              font-weight: 600;
              color: #0f172a;
            }
            .section-title {
              font-size: 18px;
              font-weight: 700;
              border-bottom: 1px solid #cbd5e1;
              padding-bottom: 8px;
              margin-bottom: 15px;
              margin-top: 30px;
            }
            .findings-list {
              padding-left: 20px;
            }
            .findings-list li {
              margin-bottom: 8px;
            }
            .footer {
              margin-top: 60px;
              border-top: 1px solid #e2e8f0;
              padding-top: 20px;
              font-size: 11px;
              color: #64748b;
              text-align: center;
            }
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">INFOSYS INTEGRATED THREAT DETECTION</div>
              <h1 class="report-title">Incident Analysis Report</h1>
            </div>
            <div style="text-align: right;">
              <span class="label">Incident ID</span>
              <div style="font-size: 20px; font-weight: bold; font-family: monospace;">${activeEvent.id || activeEvent.event_id}</div>
            </div>
          </div>

          <div>
            <span class="label">Incident Classification (ML Verdict)</span>
            <div>
              <span class="verdict-badge badge-${(activeEvent.prediction || 'NORMAL').toLowerCase() === 'critical' ? 'critical' : (activeEvent.prediction || 'NORMAL').toLowerCase() === 'suspicious' ? 'warning' : 'low'}">
                ${activeEvent.prediction || 'NORMAL'} (${activeEvent.confidence || 75}% Confidence)
              </span>
            </div>
          </div>

          <h2 class="section-title">Telemetry Metadata</h2>
          <div class="metadata-grid">
            <div class="metadata-item">
              <span class="label">Threat Type / Event Type</span>
              <div class="value">${activeEvent.name || activeEvent.event_type}</div>
            </div>
            <div class="metadata-item">
              <span class="label">Timestamp</span>
              <div class="value">${dateStr}</div>
            </div>
            <div class="metadata-item">
              <span class="label">Source IP Address</span>
              <div class="value">${activeEvent.source || activeEvent.source_ip}</div>
            </div>
            <div class="metadata-item">
              <span class="label">Target Asset</span>
              <div class="value">${activeEvent.target || activeEvent.destination_ip}</div>
            </div>
            <div class="metadata-item">
              <span class="label">Risk Severity Level</span>
              <div class="value" style="text-transform: uppercase;">${activeEvent.severity}</div>
            </div>
            <div class="metadata-item">
              <span class="label">Vulnerability Reference (CVE)</span>
              <div class="value">${activeEvent.vulnerability_id || 'N/A'}</div>
            </div>
          </div>

          <h2 class="section-title">Explainable AI (XAI) Analysis</h2>
          <span class="label">Identified Contributory Factors</span>
          <ul class="findings-list">
            ${reasonsHTML || '<li>No significant anomaly factors triggered flag limits.</li>'}
          </ul>

          <h2 class="section-title">System Verdict Notes</h2>
          <p style="font-size: 13px; color: #475569;">
            This document serves as an official incident record validated by the Infosys neural network threat detection model. Recommended course of action includes immediate firewall routing restrictions on the source IP address if severity is flagged as critical.
          </p>

          <div class="footer">
            Generated on ${new Date().toLocaleString()} by SOC Operator ${currentUser.username}.
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    reportWindow.document.close();
    logTerminal(`Generated printable PDF incident report for ${activeEvent.id || activeEvent.event_id}.`, 'success');
  };

  // --- SUB-RENDER 1: OVERVIEW PANEL ---
  const renderOverview = () => (
    <>
      {/* KPI Cards Grid */}
      <section className="kpi-grid">
        <div className="kpi-card kpi-blue">
          <div className="kpi-card-header">
            <span className="kpi-title">Total Events</span>
            <div className="kpi-icon-circle"><Activity size={18} /></div>
          </div>
          <h2 className="kpi-value">{(stats.totalEvents || 0).toLocaleString()}</h2>
          <span className="kpi-display">Total logged security network events</span>
        </div>

        <div className="kpi-card kpi-red">
          <div className="kpi-card-header">
            <span className="kpi-title">Anomalies Detected</span>
            <div className="kpi-icon-circle"><ShieldAlert size={18} /></div>
          </div>
          <h2 className="kpi-value">{(stats.anomaliesDetected || 0).toLocaleString()}</h2>
          <span className="kpi-display">Total AI-flagged anomaly logs</span>
        </div>

        <div className="kpi-card kpi-green">
          <div className="kpi-card-header">
            <span className="kpi-title">Normal Events</span>
            <div className="kpi-icon-circle"><ShieldCheck size={18} /></div>
          </div>
          <h2 className="kpi-value">{(stats.normalEvents || 0).toLocaleString()}</h2>
          <span className="kpi-display">Baseline non-threat events</span>
        </div>

        <div className="kpi-card kpi-orange">
          <div className="kpi-card-header">
            <span className="kpi-title">High-Risk Events</span>
            <div className="kpi-icon-circle"><AlertTriangle size={18} /></div>
          </div>
          <h2 className="kpi-value">{(stats.highRiskEvents || 0).toLocaleString()}</h2>
          <span className="kpi-display">High-risk warning level classification</span>
        </div>

        <div className="kpi-card kpi-purple">
          <div className="kpi-card-header">
            <span className="kpi-title">Critical Threats</span>
            <div className="kpi-icon-circle"><Siren size={18} /></div>
          </div>
          <h2 className="kpi-value">{(stats.criticalThreats || 0).toLocaleString()}</h2>
          <span className="kpi-display">Severe priority exploits flagged</span>
        </div>
      </section>


      {/* Simulator control and mini terminal logs */}
      <section className="terminal-simulation-grid mb-4">
        <div className="row g-4">
          <div className="col-lg-8 col-12">
            <div className="terminal-card h-100 d-flex flex-column">
              <div className="terminal-card-header">
                <div className="d-flex align-items-center gap-2 text-white">
                  <Terminal size={16} className="text-success" />
                  <span className="fw-semibold font-mono">Intrusion Feed Terminal (Live Log stream)</span>
                </div>
                <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-0.5 rounded-pill small fw-medium">
                  ● ACTIVE
                </span>
              </div>
              <div className="terminal-feed flex-grow-1" ref={terminalBottomRef}>
                {terminalLogs.map((log) => (
                  <div key={log.id} className={`terminal-line ${log.type === 'critical' ? 'critical' : log.type === 'warning' ? 'warning' : log.type === 'success' ? 'text-success' : ''}`}>
                    [{log.time}] {log.message}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-lg-4 col-12 d-flex flex-column gap-3">
            {/* Simulator control and options */}
            <div className="control-card">
              <h4 className="text-white mb-2 fw-semibold d-flex align-items-center gap-2">
                <Sliders size={18} className="text-success" />
                <span>Simulation Toolkit</span>
              </h4>
              <p className="text-secondary small mb-3">
                Operate dynamic generation settings to trigger simulated cyber intrusions.
              </p>
              <div className="d-flex flex-column gap-2">
                <button 
                  onClick={() => {
                    setIsSimulating(!isSimulating);
                    logTerminal(isSimulating ? 'Threat simulator PAUSED.' : 'Threat simulator INITIATED.', 'warning');
                  }}
                  className={`btn-control-toggle ${isSimulating ? 'active-sim' : 'inactive-sim'}`}
                >
                  {isSimulating ? (
                    <>
                      <Square size={16} />
                      <span>Stop Attack Simulator</span>
                    </>
                  ) : (
                    <>
                      <Play size={16} />
                      <span>Start Attack Simulator</span>
                    </>
                  )}
                </button>
                <button 
                  onClick={async () => {
                    const allEvents = await getEvents();
                    const initialStats = await getStats();
                    setEvents(allEvents);
                    setStats(initialStats);
                    logTerminal('Database logs synchronized.', 'success');
                    triggerToast('Database re-synchronized!', 'success');
                  }}
                  className="btn-control-sync"
                >
                  <RefreshCw size={16} />
                  <span>Sync with Database</span>
                </button>
              </div>
            </div>

            {/* AI Model Core Telemetry */}
            <div className="control-card">
              <h4 className="text-white mb-2 fw-semibold d-flex align-items-center gap-2">
                <Cpu size={18} className="text-success" />
                <span>Cyber AI Core Telemetry</span>
              </h4>
              <p className="text-secondary small mb-3">
                Performance indicators of the neural networks anomaly prediction model.
              </p>
              <div className="d-flex flex-column gap-2 small">
                <div className="d-flex justify-content-between text-secondary">
                  <span>AI Engine State:</span>
                  <span className="text-success fw-bold">ONLINE (v2.4)</span>
                </div>
                <div className="d-flex justify-content-between text-secondary">
                  <span>Model Accuracy:</span>
                  <span className="text-white font-mono">98.4%</span>
                </div>
                <div className="d-flex justify-content-between text-secondary">
                  <span>Inference Latency:</span>
                  <span className="text-white font-mono">12ms</span>
                </div>
                <div className="d-flex justify-content-between text-secondary">
                  <span>MongoDB Connection:</span>
                  <span className="text-success font-mono">ESTABLISHED</span>
                </div>
                <hr className="my-2 border-secondary-subtle" style={{ opacity: 0.15 }} />
                <label className="d-flex align-items-center gap-2 text-secondary cursor-pointer" style={{ userSelect: 'none' }}>
                  <input 
                    type="checkbox" 
                    checked={vocalAlerts}
                    onChange={(e) => {
                      setVocalAlerts(e.target.checked);
                      if (e.target.checked) {
                        triggerToast('Synthesized Vocal Alerts Activated!', 'success');
                      }
                    }}
                    className="form-check-input"
                  />
                  <span>Voice Warn Alerts</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real-time event log table */}
      <section className="logs-section">
        <div className="logs-header">
          <h3 className="logs-title text-white">Threat Detection Table</h3>
          
          <div className="logs-toolbar d-flex flex-wrap align-items-center gap-3">
            <div className="search-bar">
              <Search size={16} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vector, host, IP..." 
              />
            </div>

            {selectedHeatmapDate && (
              <div 
                className="d-flex align-items-center gap-2 px-3 py-1 rounded-pill text-success"
                style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  letterSpacing: '0.02em',
                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                }}
              >
                <span>DATE: {new Date(selectedHeatmapDate + 'T00:00:00').toLocaleDateString()}</span>
                <button 
                  onClick={() => {
                    setSelectedHeatmapDate(null);
                    logTerminal('Date filter cleared.', 'info');
                  }} 
                  className="btn-close btn-close-white p-0 ms-1" 
                  style={{ fontSize: '8px', cursor: 'pointer', filter: 'invert(1) grayscale(1) brightness(1.5)', width: '8px', height: '8px' }} 
                  title="Clear date filter"
                />
              </div>
            )}

            <div className="dropdown-filters d-flex gap-2">
              <select 
                value={eventTypeFilter}
                onChange={(e) => setEventTypeFilter(e.target.value)}
                className="filter-select"
                title="Event Type"
              >
                <option value="ALL">All Event Types</option>
                {uniqueEventTypes.filter(t => t !== 'ALL').map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              <select 
                value={ipFilter}
                onChange={(e) => setIpFilter(e.target.value)}
                className="filter-select"
                title="Source IP"
              >
                <option value="ALL">All Source IPs</option>
                {uniqueSourceIps.filter(ip => ip !== 'ALL').map(ip => (
                  <option key={ip} value={ip}>{ip}</option>
                ))}
              </select>
            </div>

            <div className="table-controls">
              <button 
                className={`log-filter-btn ${severityFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setSeverityFilter('ALL')}
              >
                All
              </button>
              <button 
                className={`log-filter-btn ${severityFilter === 'CRITICAL' ? 'active' : ''}`}
                onClick={() => setSeverityFilter('CRITICAL')}
              >
                Critical
              </button>
              <button 
                className={`log-filter-btn ${severityFilter === 'WARNING' ? 'active' : ''}`}
                onClick={() => setSeverityFilter('WARNING')}
              >
                Warning
              </button>
              <button 
                className={`log-filter-btn ${severityFilter === 'RESOLVED' ? 'active' : ''}`}
                onClick={() => setSeverityFilter('RESOLVED')}
              >
                Resolved
              </button>
            </div>

            <button onClick={handleExportCSV} className="btn-export-csv" title="Export CSV">
              <Download size={16} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Event ID</th>
                <th>Event Type</th>
                <th>AI Prediction</th>
                <th>Confidence</th>
                <th>Severity</th>
                <th>Timestamp</th>
                <th>Operator Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center text-secondary py-5">
                    No matching security records found.
                  </td>
                </tr>
              ) : (
                filteredEvents.slice(0, 15).map((log) => {
                  let predictionLabel = log.prediction || 'Normal';
                  let predClass = 'badge-low';
                  if (predictionLabel === 'Critical') {
                    predClass = 'badge-critical';
                  } else if (predictionLabel === 'Suspicious') {
                    predClass = 'badge-warning';
                  }

                  let severityRowClass = `severity-row-${(log.severity || 'LOW').toLowerCase()}`;

                  return (
                    <tr key={log.id} className={severityRowClass}>
                      <td className="font-mono text-info small">
                        <button 
                          className="btn btn-link p-0 text-decoration-none font-mono fw-bold text-success" 
                          onClick={() => handleInvestigate(log.id || log.event_id)}
                          style={{ fontSize: '13px' }}
                        >
                          {log.id || log.event_id}
                        </button>
                      </td>
                      <td className="fw-semibold text-white">{log.name || log.event_type}</td>
                      <td>
                        <span className={`badge ${predClass} small`}>
                          {predictionLabel}
                        </span>
                      </td>
                      <td className="font-mono text-white fw-bold">{log.confidence}%</td>
                      <td>
                        <span className={`badge badge-${(log.severity || 'LOW').toLowerCase()}`}>
                          {log.severity}
                        </span>
                      </td>
                      <td className="font-mono text-secondary small">{log.time || log.timestamp}</td>
                      <td>
                        {log.status !== 'RESOLVED' ? (
                          <>
                            <button 
                              className="btn-table-action btn-investigate" 
                              onClick={() => handleInvestigate(log.id || log.event_id)}
                            >
                              Investigate
                            </button>
                            <button 
                              className="btn-table-action btn-dismiss" 
                              onClick={() => handleResolve(log.id || log.event_id)}
                            >
                              Resolve
                            </button>
                          </>
                        ) : (
                          <span className="badge-resolved-status">
                            <ShieldCheck size={12} className="me-1" />
                            Archived
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );  // --- SUB-RENDER 2: INTERACTIVE CALENDAR ACTIVITY HEATMAP ---
  const renderThreatMap = () => {
    const daysOfWeek = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    const months = [
      'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
    ];
    
    const totalCols = 30; // Fits perfectly next to the live threat list
    const gridData = [];
    const currentYear = new Date().getFullYear();
    const prevYear = currentYear - 1;

    // Seed realistic baseline background noise
    for (let r = 0; r < 7; r++) {
      gridData[r] = [];
      for (let c = 0; c < totalCols; c++) {
        const noiseSeed = (r * 3 + c * 7) % 11;
        gridData[r][c] = (noiseSeed === 0) ? 2 : 0;
      }
    }

    // Populate with actual events from dataset & live simulator
    const today = new Date();
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    events.forEach((evt) => {
      if (!evt.timestamp && !evt.time) return;
      let evtDate;
      if (evt.timestamp && evt.timestamp.includes('T')) {
        evtDate = new Date(evt.timestamp);
      } else {
        // Simulator local time string format "HH:MM:SS" (today)
        evtDate = new Date();
        if (evt.time) {
          const parts = evt.time.split(':');
          if (parts.length >= 2) {
            evtDate.setHours(parseInt(parts[0]), parseInt(parts[1]), parts[2] ? parseInt(parts[2]) : 0, 0);
          }
        }
      }

      if (isNaN(evtDate.getTime())) return;

      const evtMidnight = new Date(evtDate.getFullYear(), evtDate.getMonth(), evtDate.getDate());
      const diffTime = todayMidnight - evtMidnight;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= 0 && diffDays < 210) {
        const r = evtDate.getDay() === 0 ? 6 : evtDate.getDay() - 1; // Mon=0, Sun=6
        const c = 29 - Math.floor(diffDays / 7);
        if (c >= 0 && c < 30) {
          // Weight the cell color density by risk_score so critical alerts trigger bright glows
          const weight = evt.risk_score ? parseFloat(evt.risk_score) : (evt.severity === 'CRITICAL' ? 95 : evt.severity === 'HIGH' ? 75 : 30);
          gridData[r][c] += Math.round(weight);
        }
      }
    });

    // Extract unresolved live threat vectors
    const activeThreats = events.filter(e => e.status !== 'RESOLVED').slice(0, 5);

    return (
      <section className="threat-map-section card-view">
        <div className="panel-header mb-4">
          <h3 className="text-white d-flex align-items-center gap-2">
            <Map className="text-success" />
            <span>Interactive Threat Activity Heatmap</span>
          </h3>
          <p className="text-secondary small">Chronological density distribution of security incidents and active attack vectors</p>
        </div>

        <div className="row g-4 align-items-stretch">
          {/* Left Column: Calendar Heatmap Card */}
          <div className="col-lg-8 col-12">
            <div className="threat-map-container p-4 rounded-4 h-100" style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.08)'
            }}>
              {/* Heatmap Year & Subtitle Header */}
              <div className="d-flex justify-content-between mb-4 px-2" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <div>
                  <h2 className="fw-extrabold m-0 text-white font-mono" style={{ fontSize: '22px', letterSpacing: '-0.03em' }}>{prevYear}</h2>
                  <span className="text-secondary small font-mono" style={{ fontSize: '11px' }}>Baseline Incident Density</span>
                </div>
                <div className="text-end">
                  <h2 className="fw-extrabold m-0 text-white font-mono" style={{ fontSize: '22px', letterSpacing: '-0.03em' }}>{currentYear}</h2>
                  <span className="text-secondary small font-mono" style={{ fontSize: '11px' }}>Active Threat Telemetry</span>
                </div>
              </div>

              <div className="d-flex align-items-start gap-2 overflow-auto py-2">
                <div className="flex-grow-1" style={{ minWidth: '400px' }}>
                  <div className="d-flex flex-column gap-1">
                    {daysOfWeek.map((dayName, rIdx) => (
                      <div key={dayName} className="d-flex align-items-center gap-1">
                        <div className="d-flex gap-1 flex-grow-1">
                          {Array.from({ length: totalCols }).map((_, cIdx) => {
                            const count = gridData[rIdx][cIdx];
                            let cellBg = theme === 'light' ? '#f1f5f9' : '#0c1214'; 
                            let fontColor = 'transparent';
                            let borderStyle = '1px solid var(--border-color)';
                            let cellShadow = 'none';

                            if (count > 0) {
                              if (count >= 120) {
                                // Critical density — deep glowing green
                                cellBg = '#064e3b';
                                fontColor = '#6ee7b7';
                                borderStyle = '2px solid #10b981';
                                cellShadow = '0 0 8px rgba(16, 185, 129, 0.5)';
                              } else if (count >= 60) {
                                // High density — strong mint
                                cellBg = '#10b981';
                                fontColor = '#ffffff';
                                borderStyle = '1px solid #0d9488';
                              } else if (count >= 15) {
                                // Medium density — mid teal
                                cellBg = '#34d399';
                                fontColor = '#022c22';
                                borderStyle = '1px solid #10b981';
                              } else {
                                // Low density — light teal wash
                                cellBg = theme === 'light' ? '#d1fae5' : '#042f2e';
                                fontColor = theme === 'light' ? '#065f46' : '#6ee7b7';
                                borderStyle = '1px solid rgba(16,185,129,0.35)';
                              }
                            }


                            // Calculate cell specific date
                            const today = new Date();
                            const todayDay = today.getDay() === 0 ? 7 : today.getDay();
                            const daysToMonday = todayDay - 1;
                            const mondayOfThisWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - daysToMonday);
                            const cellDate = new Date(mondayOfThisWeek.getTime());
                            cellDate.setDate(mondayOfThisWeek.getDate() - (29 - cIdx) * 7 + rIdx);
                            const cellDateStr = cellDate.toISOString().split('T')[0];

                            return (
                              <div 
                                key={cIdx} 
                                className={`heatmap-cell d-flex align-items-center justify-content-center rounded-1`}
                                style={{
                                  width: '20px',
                                  height: '20px',
                                  backgroundColor: cellBg,
                                  border: selectedHeatmapDate === cellDateStr ? '2px solid #10b981' : borderStyle,
                                  boxShadow: selectedHeatmapDate === cellDateStr ? '0 0 10px #10b981' : cellShadow,
                                  fontSize: '7.5px',
                                  fontWeight: '800',
                                  color: fontColor,
                                  transition: 'all 0.2s ease',
                                  cursor: 'pointer',
                                  userSelect: 'none'
                                }}
                                title={`Date: ${cellDate.toLocaleDateString()} | Weight: ${count}`}
                                onClick={() => {
                                  // Find if there are actually events on this day
                                  const dayEvents = events.filter(evt => {
                                    let evtDate;
                                    if (evt.timestamp && evt.timestamp.includes('T')) {
                                      evtDate = new Date(evt.timestamp);
                                    } else {
                                      evtDate = new Date();
                                      if (evt.time) {
                                        const parts = evt.time.split(':');
                                        if (parts.length >= 2) {
                                          evtDate.setHours(parseInt(parts[0]), parseInt(parts[1]), parts[2] ? parseInt(parts[2]) : 0, 0);
                                        }
                                      }
                                    }
                                    const evtMidnight = new Date(evtDate.getFullYear(), evtDate.getMonth(), evtDate.getDate());
                                    const cellMidnight = new Date(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate());
                                    return evtMidnight.getTime() === cellMidnight.getTime();
                                  });

                                  if (dayEvents.length > 0) {
                                    setSelectedHeatmapDate(cellDateStr);
                                    logTerminal(`Filtering threat log to show ${dayEvents.length} incidents from ${cellDate.toLocaleDateString()}.`, 'info');
                                    triggerToast(`Filtering logs: ${cellDate.toLocaleDateString()}`, 'info');
                                  } else {
                                    triggerToast(`No logged incidents on ${cellDate.toLocaleDateString()}`, 'info');
                                  }
                                }}
                              >
                                {count > 50 ? count : ''}
                              </div>
                            );
                          })}
                        </div>
                        <div className="font-mono text-secondary text-end px-2 fw-semibold" style={{ width: '40px', fontSize: '10px', color: 'var(--text-secondary)' }}>
                          {dayName}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="d-flex justify-content-between mt-3 px-1 font-mono text-secondary small fw-semibold" style={{ width: '92%', fontSize: '10px', color: 'var(--text-secondary)' }}>
                    {months.map((m, idx) => (
                      <span key={idx}>{m}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Incident Streams */}
          <div className="col-lg-4 col-12">
            <div className="active-threats-card p-4 rounded-4 h-100" style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.08)'
            }}>
              <h5 className="text-white mb-3 fw-semibold d-flex align-items-center gap-2 pb-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
                <Siren size={18} className="text-danger" />
                <span>Live Threat Streams</span>
              </h5>
              <div className="d-flex flex-column gap-2 overflow-auto" style={{ maxHeight: '280px' }}>
                {activeThreats.length === 0 ? (
                  <div className="text-center text-secondary py-5 small">
                    No active threats targeting Mainframe Gateway.
                  </div>
                ) : (
                  activeThreats.map(threat => (
                    <div 
                      key={threat.id} 
                      className="active-threat-item p-3 rounded"
                      style={{ 
                        cursor: 'pointer',
                        backgroundColor: 'rgba(0,0,0,0.015)',
                        border: '1px solid var(--border-color)',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => handleInvestigate(threat.id || threat.event_id)}
                    >
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="small font-mono text-danger fw-bold">{threat.source || threat.source_ip}</span>
                        <span className={`badge badge-${(threat.severity || 'LOW').toLowerCase()} xsmall`}>
                          {threat.severity}
                        </span>
                      </div>
                      <div className="text-white small fw-medium" style={{ fontSize: '12.5px' }}>{threat.name || threat.event_type}</div>
                      <div className="text-secondary xsmall mt-1" style={{ fontSize: '10.5px' }}>Targeting: {threat.target || threat.destination_ip}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  // --- SUB-RENDER 3: THREAT TIMELINE PANEL ---
  const renderIncidents = () => {
    return (
      <section className="timeline-section card-view">
        <div className="panel-header mb-4">
          <h3 className="text-white d-flex align-items-center gap-2">
            <Database className="text-success" />
            <span>Threat Incident Timeline</span>
          </h3>
          <p className="text-secondary small">Chronological listing of security events and analyst responses</p>
        </div>

        <div className="timeline-wrapper">
          {events.length === 0 ? (
            <div className="text-center text-secondary py-5">
              No incidents recorded.
            </div>
          ) : (
            <div className="timeline-track">
              {events.slice(0, 15).map((evt) => {
                const isCritical = evt.severity === 'CRITICAL';
                const isResolved = evt.status === 'RESOLVED';
                
                let dotColor = '#10b981'; // resolved
                if (!isResolved) {
                  dotColor = isCritical ? '#ef4444' : '#f59e0b';
                }

                return (
                  <div key={evt.id} className="timeline-item">
                    <div className="timeline-node" style={{ backgroundColor: dotColor }}>
                      {!isResolved && <span className="timeline-node-glow" style={{ boxShadow: `0 0 8px ${dotColor}` }} />}
                    </div>
                    
                    <div className="timeline-card-content">
                      <div className="timeline-card-header d-flex justify-content-between align-items-center mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <span className="font-mono text-secondary small">{evt.time || evt.timestamp}</span>
                          <span className={`badge badge-${(evt.severity || 'LOW').toLowerCase()} xsmall`}>
                            {evt.severity}
                          </span>
                        </div>
                        <span className="xsmall text-secondary">{evt.status === 'RESOLVED' ? 'Resolved' : 'Active'}</span>
                      </div>

                      <h5 className="text-white mb-1 fw-semibold">{evt.name || evt.event_type}</h5>
                      <div className="row g-2 mt-2">
                        <div className="col-6">
                          <div className="xsmall text-secondary">SOURCE ADDRESS</div>
                          <div className="small text-info font-mono">{evt.source || evt.source_ip}</div>
                        </div>
                        <div className="col-6">
                          <div className="xsmall text-secondary">TARGET SERVICE</div>
                          <div className="small text-white font-mono">{evt.target || evt.destination_ip}</div>
                        </div>
                      </div>

                      <div className="timeline-card-actions mt-3 pt-2 border-top border-secondary-subtle d-flex justify-content-end">
                        {evt.status !== 'RESOLVED' ? (
                          <div className="d-flex gap-2">
                            <button 
                              className="btn-table-action btn-investigate py-1"
                              onClick={() => handleInvestigate(evt.id || evt.event_id)}
                            >
                              Investigate
                            </button>
                            <button 
                              className="btn-table-action btn-dismiss py-1"
                              onClick={() => handleResolve(evt.id || evt.event_id)}
                            >
                              Resolve
                            </button>
                          </div>
                        ) : (
                          <span className="text-success small d-flex align-items-center gap-1">
                            <ShieldCheck size={12} /> Mitigated
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    );
  };

  // --- SUB-RENDER 4: RADAR SHIELD SCAN PANEL ---
  const renderShieldScans = () => {
    return (
      <section className="scan-section card-view">
        <div className="panel-header mb-4">
          <h3 className="text-white d-flex align-items-center gap-2">
            <Shield className="text-success" />
            <span>Vulnerability Shield Scanner</span>
          </h3>
          <p className="text-secondary small">Initiate threat assessments and diagnostic scans of network ports</p>
        </div>

        <div className="row g-4 align-items-center">
          {/* Radar Anim Widget */}
          <div className="col-md-6 col-12">
            <div className="radar-scanner-widget">
              <div className="radar-circle">
                <div className={`radar-sweep ${isScanning ? 'scanning' : ''}`} />
                <div className="radar-target-dots">
                  <div className="radar-dot dot-1 active-dot" />
                  <div className="radar-dot dot-2 active-dot" />
                  <div className="radar-dot dot-3" />
                </div>
              </div>
              <div className="text-center mt-3">
                <div className="text-white small fw-bold">Scan Scope: {scanTarget}</div>
                <div className="text-secondary xsmall mt-1">Status: {isScanning ? 'DIAGNOSTICS IN PROGRESS' : 'IDLE'}</div>
              </div>
            </div>
          </div>

          {/* Progress Logs & Summaries */}
          <div className="col-md-6 col-12">
            <div className="scan-audit-card p-4 rounded bg-dark border border-secondary-subtle">
              <h5 className="text-white mb-3 fw-semibold">Audit Scan Control Center</h5>
              
              {/* Progress Indicator */}
              <div className="mb-4">
                <div className="d-flex justify-content-between small text-secondary mb-1">
                  <span>Audit Progress</span>
                  <span className="text-white fw-bold">{scanProgress}%</span>
                </div>
                <div className="progress" style={{ height: '6px', backgroundColor: '#090f12' }}>
                  <div 
                    className="progress-bar bg-success" 
                    role="progressbar" 
                    style={{ width: `${scanProgress}%` }} 
                    aria-valuenow={scanProgress} 
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  />
                </div>
              </div>

              {/* Trigger audit */}
              <button 
                onClick={startDiagnosticsScan} 
                disabled={isScanning}
                className="btn-submit w-100 py-3 d-flex align-items-center justify-content-center gap-2 mb-4"
              >
                <ShieldCheck size={18} />
                <span>{isScanning ? 'Executing Diagnostics Audit...' : 'Initiate Security Audit'}</span>
              </button>

              {/* Real-time check outputs */}
              <div className="scan-logs-wrapper mt-3">
                <div className="xsmall text-secondary mb-1">AUDIT REAL-TIME OUTPUTS</div>
                <div className="scan-console-logs">
                  {scanLog.map((log, index) => (
                    <div key={index} className="scan-log-line font-mono xsmall text-secondary">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  // --- SUB-RENDER 5: CONTACT US TEAM PANEL ---
  const renderContactUs = () => {
    const teamMembers = [
      { name: 'Naveen S',            role: 'UI/UX Developer',       tag: 'Lead Designer',      email: 'naveen9819687@gmail.com',                  bio: 'Designed the overall UI. Built the auth portal, contact page, and dark mode. Unified and integrated all modular workspaces into the dashboard layout.',                                      avatar: 'NS', color: '#10b981', index: 0 },
      { name: 'Priyanga C S',        role: 'Frontend Developer',    tag: 'Events & Filters',   email: 'cspriyanga26@gmail.com',                    bio: 'Created the threat events logging table, search filters, and real-time incident status controls.',                                                                                            avatar: 'PC', color: '#3b82f6', index: 1 },
      { name: 'Devendhar Reddy',     role: 'Frontend Developer',    tag: 'Charts & Parsing',   email: 'ndreddy2005@gmail.com',                     bio: 'Contributed to frontend chart layouts, data parsing libraries, and interactive visualization controls.',                                                                                      avatar: 'DR', color: '#f59e0b', index: 2 },
      { name: 'Sahil Kedare',        role: 'Frontend Developer',    tag: 'Data Visualizations',email: 'kedaresahil70@gmail.com',                   bio: 'Created interactive charts: Pie chart of severity events, Bar chart of top attack types, and Timeline trend chart.',                                                                          avatar: 'SK', color: '#8b5cf6', index: 3 },
      { name: 'Vasavi',              role: 'Frontend Developer',    tag: 'Search & Filters',   email: 'vasavi.n2004@gmail.com',                    bio: 'Designed and implemented interactive search and dynamic dropdown filter controls for the analytics data visualization engine.',                                                                avatar: 'VA', color: '#ec4899', index: 4 },
      { name: 'Vaishnavi S',         role: 'Frontend Developer',    tag: 'KPI Metrics',        email: 'vaishnavis.dev@gmail.com',                  bio: 'Designed and integrated the main KPI metrics widgets (total events, critical threats, active incidents) on the dashboard overview panel.',                                                     avatar: 'VS', color: '#06b6d4', index: 5 },
      { name: 'LAXMI VYSHNAVVI',     role: 'Backend Developer',     tag: 'Data Engineering',   email: '324103210088.vyshnavvi@gvpcew.ac.in',       bio: 'Responsible for backend data cleaning, parsing incoming security logs, and formatting MongoDB documents for telemetry queries.',                                                              avatar: 'LV', color: '#10b981', index: 6 },
      { name: 'Prasanth Gannavarapu',role: 'Backend Developer',     tag: 'Database Architect', email: 'prasanthgannavarapu20@gmail.com',            bio: 'Responsible for database architecture, establishing MongoDB connections, and ensuring robust query handling.',                                                                               avatar: 'PG', color: '#f97316', index: 7 },
      { name: 'Suriyakumar P',       role: 'Fullstack Developer',   tag: 'API & Auth',         email: '953623244051@ritrjpm.ac.in',                bio: 'Worked on building REST API endpoints, handling authentication routes, and aligning frontend requests with server response bodies.',                                                          avatar: 'SP', color: '#a78bfa', index: 8 },
    ];


    const colorToRgb = (hex) => {
      const map = {
        '#10b981': '16,185,129', '#3b82f6': '59,130,246',
        '#f59e0b': '245,158,11', '#8b5cf6': '139,92,246',
        '#ec4899': '236,72,153', '#06b6d4': '6,182,212',
        '#f97316': '249,115,22', '#a78bfa': '167,139,250',
      };
      return map[hex] || '16,185,129';
    };

    return (
      <div style={{ overflowX: 'hidden' }}>
        <style>{`
          @keyframes fadeSlideUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
          @keyframes scaleIn     { from { opacity:0; transform:scale(0.88); }      to { opacity:1; transform:scale(1); } }
          @keyframes glowPulse   { 0%,100% { opacity:0.6; } 50% { opacity:1; } }
          .ct-hero  { animation: fadeSlideUp 0.7s cubic-bezier(0.16,1,0.3,1) both; }
          .ct-stat  { animation: scaleIn 0.5s cubic-bezier(0.16,1,0.3,1) both; }
          .ct-stat:nth-child(1){animation-delay:0.05s} .ct-stat:nth-child(2){animation-delay:0.12s}
          .ct-stat:nth-child(3){animation-delay:0.19s} .ct-stat:nth-child(4){animation-delay:0.26s}
          .tm-card  { animation: fadeSlideUp 0.6s cubic-bezier(0.16,1,0.3,1) both; transition: transform 0.3s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s ease, border-color 0.3s ease; }
          .tm-card:hover { transform: translateY(-6px) !important; }
          .tm-avatar { transition: transform 0.3s ease; }
          .tm-card:hover .tm-avatar { transform: scale(1.1); }
          .tm-email { transition: padding-left 0.2s ease; text-decoration:none; }
          .tm-email:hover { padding-left: 4px !important; }
        `}</style>

        {/* HERO BANNER */}
        <div className="ct-hero" style={{
          position:'relative', borderRadius:'20px', padding:'52px 44px', marginBottom:'28px', overflow:'hidden',
          background:'linear-gradient(135deg, var(--bg-surface) 0%, #0b2218 55%, var(--bg-surface) 100%)',
          border:'1px solid var(--border-color)',
        }}>
          <div style={{ position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(16,185,129,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(16,185,129,0.04) 1px,transparent 1px)',backgroundSize:'40px 40px',pointerEvents:'none' }} />
          <div style={{ position:'absolute',top:'-80px',right:'-80px',width:'360px',height:'360px',borderRadius:'50%',background:'radial-gradient(circle,rgba(16,185,129,0.14) 0%,transparent 65%)',filter:'blur(40px)',pointerEvents:'none' }} />
          <div style={{ position:'absolute',bottom:'-60px',left:'8%',width:'280px',height:'280px',borderRadius:'50%',background:'radial-gradient(circle,rgba(0,124,195,0.09) 0%,transparent 65%)',filter:'blur(40px)',pointerEvents:'none' }} />
          <div style={{ position:'relative', zIndex:1 }}>
            <div style={{ display:'inline-flex',alignItems:'center',gap:'8px',background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.22)',borderRadius:'50px',padding:'5px 14px',marginBottom:'22px',fontSize:'10.5px',fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:'#10b981' }}>
              <span style={{ width:'7px',height:'7px',borderRadius:'50%',background:'#10b981',boxShadow:'0 0 8px #10b981',display:'inline-block',animation:'glowPulse 2s ease-in-out infinite' }} />
              Team — A &nbsp;·&nbsp; Infosys Internship 2026
            </div>
            <h2 style={{ fontSize:'clamp(26px,4vw,46px)',fontWeight:700,letterSpacing:'-0.03em',lineHeight:1.08,color:'#f1f5f9',marginBottom:'14px' }}>
              Project Command&nbsp;
              <span style={{ background:'linear-gradient(135deg,#34d399,#10b981,#0d9488)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text' }}>Center</span>
            </h2>
            <p style={{ fontSize:'14.5px',color:'var(--text-secondary)',maxWidth:'520px',lineHeight:1.7,margin:0 }}>
              Meet the developer operations team behind the <strong style={{ color:'#f1f5f9' }}>Infosys Threat Detection Suite</strong> — 9 engineers, 3 milestone sprints, one unified platform.
            </p>
          </div>
        </div>

        {/* STATS STRIP */}
        <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'14px',marginBottom:'36px' }}>
          {[{v:'9',l:'Team Members'},{v:'3',l:'Milestones'},{v:'100%',l:'Frontend Coverage'},{v:'M2',l:'Current Sprint'}].map((s,i) => (
            <div key={i} className="ct-stat" style={{ background:'var(--bg-surface)',border:'1px solid var(--border-color)',borderRadius:'14px',padding:'22px',textAlign:'center' }}>
              <div style={{ fontSize:'30px',fontWeight:800,letterSpacing:'-0.04em',color:'#10b981',lineHeight:1 }}>{s.v}</div>
              <div style={{ fontSize:'10.5px',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.08em',color:'var(--text-muted)',marginTop:'8px' }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* SECTION DIVIDER */}
        <div style={{ display:'flex',alignItems:'center',gap:'14px',marginBottom:'22px' }}>
          <div style={{ flex:1,height:'1px',background:'var(--border-color)' }} />
          <span style={{ fontSize:'10px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.12em',color:'var(--text-muted)',whiteSpace:'nowrap' }}>Development Team</span>
          <div style={{ flex:1,height:'1px',background:'var(--border-color)' }} />
        </div>

        {/* TEAM CARDS */}
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))',gap:'18px',paddingBottom:'28px' }}>
          {teamMembers.map((m) => (
            <div key={m.email} className="tm-card" style={{
              background:`linear-gradient(145deg,var(--bg-surface) 0%,rgba(${colorToRgb(m.color)},0.04) 100%)`,
              border:`1px solid rgba(${colorToRgb(m.color)},0.13)`,
              borderRadius:'18px', padding:'26px',
              display:'flex', flexDirection:'column', gap:'18px',
              animationDelay:`${m.index*0.07}s`, position:'relative', overflow:'hidden',
            }}>
              <div style={{ position:'absolute',top:0,right:0,width:'110px',height:'110px',borderRadius:'50%',background:`radial-gradient(circle at top right,${m.color}18,transparent 65%)`,pointerEvents:'none' }} />

              {/* Header */}
              <div style={{ display:'flex',alignItems:'flex-start',gap:'14px' }}>
                <div className="tm-avatar" style={{ width:'50px',height:'50px',borderRadius:'13px',flexShrink:0,background:`linear-gradient(135deg,${m.color}28,${m.color}14)`,border:`2px solid ${m.color}35`,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:'14px',color:m.color }}>{m.avatar}</div>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ display:'flex',alignItems:'center',gap:'7px',flexWrap:'wrap',marginBottom:'3px' }}>
                    <h4 style={{ fontSize:'14.5px',fontWeight:700,color:'#f1f5f9',margin:0,letterSpacing:'-0.01em' }}>{m.name}</h4>
                    <span style={{ fontSize:'9px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',padding:'2px 7px',borderRadius:'50px',background:`${m.color}18`,color:m.color,border:`1px solid ${m.color}28`,whiteSpace:'nowrap' }}>{m.tag}</span>
                  </div>
                  <div style={{ fontSize:'11.5px',fontWeight:500,color:'var(--text-secondary)' }}>{m.role}</div>
                </div>
              </div>

              <div style={{ height:'1px',background:`linear-gradient(90deg,${m.color}22,transparent)` }} />

              <p style={{ fontSize:'12px',color:'var(--text-secondary)',lineHeight:1.68,margin:0,flexGrow:1 }}>{m.bio}</p>

              <a href={`mailto:${m.email}`} className="tm-email" style={{ display:'flex',alignItems:'center',gap:'7px',paddingTop:'14px',borderTop:'1px solid rgba(255,255,255,0.04)',color:m.color,fontSize:'11.5px',fontFamily:"'JetBrains Mono',monospace",fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>
                <Mail size={12} style={{ flexShrink:0 }} />
                <span style={{ overflow:'hidden',textOverflow:'ellipsis' }}>{m.email}</span>
                <ExternalLink size={10} style={{ marginLeft:'auto',flexShrink:0,opacity:0.45 }} />
              </a>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div style={{ border:'1px solid var(--border-color)',borderRadius:'14px',padding:'22px 28px',display:'flex',alignItems:'center',justifyContent:'space-between',background:'var(--bg-surface)',gap:'16px',flexWrap:'wrap' }}>
          <div>
            <div style={{ fontSize:'13px',fontWeight:600,color:'#f1f5f9',marginBottom:'3px' }}>Infosys Threat Detection Dashboard — Team A</div>
            <div style={{ fontSize:'11px',color:'var(--text-muted)' }}>Internship Project &nbsp;·&nbsp; August 2026 &nbsp;·&nbsp; Frontend + Backend Full Stack</div>
          </div>
          <div style={{ display:'flex',gap:'8px',alignItems:'center' }}>
            <span style={{ width:'8px',height:'8px',borderRadius:'50%',background:'#10b981',boxShadow:'0 0 8px #10b981',display:'inline-block',animation:'glowPulse 2s ease-in-out infinite' }} />
            <span style={{ fontSize:'11px',color:'#10b981',fontWeight:700,letterSpacing:'0.06em' }}>MILESTONE 2 COMPLETE</span>
          </div>
        </div>
      </div>
    );
  };


  // --- SUB-RENDER 5: GLOBAL SETTINGS PANEL ---
  const renderSettings = () => {
    return (
      <section className="settings-section card-view">
        <div className="panel-header mb-4">
          <h3 className="text-white d-flex align-items-center gap-2">
            <Settings className="text-success" />
            <span>Operational & User Settings</span>
          </h3>
          <p className="text-secondary small">Configure operator profiles, visual themes, neural thresholds, and system overrides</p>
        </div>

        <div className="row g-4">
          {/* Row 1: Basic settings (Profile, Theme, Notifications) */}
          <div className="col-12">
            <div className="card-view p-4 rounded-4" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
              <h5 className="text-white mb-3 d-flex align-items-center gap-2 pb-2" style={{ borderBottom: '1px solid var(--border-color)', fontSize: '15px' }}>
                <UserCheck size={16} className="text-success" />
                <span>General Profile & Theme (Basic Settings)</span>
              </h5>
              
              <div className="row g-3 align-items-start">
                {/* Operator Username Change */}
                <div className="col-md-4 col-12">
                  <label className="text-white small fw-medium mb-2 d-block">Operator Display Name</label>
                  <input 
                    type="text" 
                    className="w-100"
                    value={currentUser.username}
                    onChange={(e) => setCurrentUser(prev => ({ ...prev, username: e.target.value }))}
                    style={{ 
                      fontSize: '13px', 
                      backgroundColor: 'var(--bg-deep)', 
                      border: '1px solid var(--border-color)', 
                      color: 'var(--text-primary)', 
                      outline: 'none', 
                      padding: '0 12px',
                      height: '37px',
                      borderRadius: '8px',
                      boxSizing: 'border-box',
                    }}
                    placeholder="Enter analyst name..."
                  />
                  <span className="text-secondary xsmall mt-1 d-block" style={{ fontSize: '10px' }}>Updates your name shown at the bottom of the sidebar.</span>
                </div>

                {/* Color Theme Switcher — Sliding Pill Toggle */}
                <div className="col-md-4 col-12">
                  <label className="text-white small fw-medium mb-2 d-block">Interface Color Theme</label>

                  {/* Pill Track */}
                  <div
                    onClick={toggleTheme}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      position: 'relative',
                      cursor: 'pointer',
                      backgroundColor: theme === 'dark' ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
                      border: theme === 'dark'
                        ? '1px solid rgba(16,185,129,0.3)'
                        : '1px solid rgba(245,158,11,0.35)',
                      borderRadius: '50px',
                      padding: '3px',
                      width: '100%',
                      height: '37px',
                      boxSizing: 'border-box',
                      transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                      userSelect: 'none',
                    }}
                  >
                    {/* Gliding Highlight Pill */}
                    <div style={{
                      position: 'absolute',
                      top: '3px',
                      left: theme === 'dark' ? '3px' : 'calc(50% + 2px)',
                      width: 'calc(50% - 5px)',
                      height: 'calc(100% - 6px)',
                      borderRadius: '46px',
                      background: theme === 'dark'
                        ? 'linear-gradient(135deg, #0d9488, #10b981)'
                        : 'linear-gradient(135deg, #d97706, #f59e0b)',
                      boxShadow: theme === 'dark'
                        ? '0 0 12px rgba(16,185,129,0.4)'
                        : '0 0 12px rgba(245,158,11,0.4)',
                      transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                      zIndex: 0,
                    }} />

                    {/* Dark Option */}
                    <div style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '7px 10px',
                      borderRadius: '46px',
                      fontSize: '12px',
                      fontWeight: 600,
                      letterSpacing: '0.04em',
                      position: 'relative',
                      zIndex: 1,
                      color: theme === 'dark' ? '#000' : (theme === 'light' ? 'rgba(15, 23, 42, 0.45)' : 'rgba(255,255,255,0.4)'),
                      transition: 'color 0.3s ease',
                    }}>
                      <Moon size={13} />
                      Dark
                    </div>

                    {/* Light Option */}
                    <div style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '7px 10px',
                      borderRadius: '46px',
                      fontSize: '12px',
                      fontWeight: 600,
                      letterSpacing: '0.04em',
                      position: 'relative',
                      zIndex: 1,
                      color: theme === 'light' ? '#000' : (theme === 'light' ? 'rgba(15, 23, 42, 0.45)' : 'rgba(255,255,255,0.4)'),
                      transition: 'color 0.3s ease',
                    }}>
                      <Sun size={13} />
                      Light
                    </div>
                  </div>

                  <span className="text-secondary mt-1 d-block" style={{ fontSize: '10px' }}>
                    Adjusts contrast levels for visual tracking screens.
                  </span>
                </div>


                {/* HUD notifications toggle */}
                <div className="col-md-4 col-12">
                  <label className="text-white small fw-medium mb-2 d-block" htmlFor="showToastsToggle">Incident Pop-ups</label>
                  <div className="d-flex align-items-center justify-content-between"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '0 14px',
                      height: '37px',
                      boxSizing: 'border-box',
                    }}
                  >
                    <span className="text-secondary" style={{ fontSize: '12px' }}>Enable overlay alerts</span>
                    <input
                      className="form-check-input ms-0"
                      type="checkbox"
                      role="switch"
                      checked={toastsEnabled}
                      onChange={(e) => {
                        setToastsEnabled(e.target.checked);
                        logTerminal(`Incident pop-up alerts ${e.target.checked ? 'ENABLED' : 'DISABLED'} by operator.`, 'info');
                        triggerToast(`Pop-ups ${e.target.checked ? 'Enabled' : 'Disabled'}`, 'info', true);
                      }}
                      id="showToastsToggle"
                      style={{ width: '2.2em', height: '1.1em', cursor: 'pointer', accentColor: 'var(--accent-mint)', flexShrink: 0, marginBottom: 0 }}
                    />
                  </div>
                  <span className="text-secondary mt-1 d-block" style={{ fontSize: '10px' }}>Show overlay alert toasts on new logs.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 1: Advanced Engine Settings */}
          <div className="col-lg-6 col-12">
            <div className="card-view p-4 rounded-4" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', height: '100%' }}>
              <h5 className="text-white mb-3 d-flex align-items-center gap-2 pb-2" style={{ borderBottom: '1px solid var(--border-color)', fontSize: '15px' }}>
                <Cpu size={16} className="text-success" />
                <span>AI Simulation Settings (Advanced)</span>
              </h5>
              
              <div className="mb-4">
                <label className="text-white small fw-medium d-flex justify-content-between mb-2">
                  <span>Intrusion Stream Frequency</span>
                  <span className="font-mono text-success fw-bold">{simInterval}s</span>
                </label>
                <input 
                  type="range" 
                  min="3" 
                  max="30" 
                  value={simInterval} 
                  onChange={(e) => setSimInterval(Number(e.target.value))} 
                  className="w-100 accent-success"
                  style={{ accentColor: 'var(--accent-mint)' }}
                />
                <span className="text-secondary xsmall mt-1 d-block" style={{ fontSize: '10px' }}>Adjust how often a new threat or baseline event is simulated.</span>
              </div>

              <div className="mb-4">
                <label className="text-white small fw-medium d-flex justify-content-between mb-2">
                  <span>Minimum AI Confidence Trigger</span>
                  <span className="font-mono text-success fw-bold">85%</span>
                </label>
                <input 
                  type="range" 
                  min="50" 
                  max="99" 
                  defaultValue="85"
                  className="w-100"
                  style={{ accentColor: 'var(--accent-mint)' }}
                />
                <span className="text-secondary xsmall mt-1 d-block" style={{ fontSize: '10px' }}>Filter simulated alarms below this threshold level.</span>
              </div>

              <div className="mb-3">
                <label className="text-white small fw-medium mb-2 d-block">Simulator Severity Target</label>
                <div className="d-flex gap-2">
                  {['ALL', 'CRITICAL', 'WARNING'].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setSeverityAlertFilter(lvl)}
                      className={`btn btn-sm ${severityAlertFilter === lvl ? 'btn-success' : 'btn-outline-secondary'}`}
                      style={{ fontSize: '12px' }}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
                <span className="text-secondary xsmall mt-2 d-block" style={{ fontSize: '10px' }}>Target simulator outputs to specific severity classes.</span>
              </div>
            </div>
          </div>

          {/* Column 2: Advanced Audio & Accessibility */}
          <div className="col-lg-6 col-12">
            <div className="card-view p-4 rounded-4" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', height: '100%' }}>
              <h5 className="text-white mb-3 d-flex align-items-center gap-2 pb-2" style={{ borderBottom: '1px solid var(--border-color)', fontSize: '15px' }}>
                <Sliders size={16} className="text-success" />
                <span>Multi-Sensory Warnings (Advanced)</span>
              </h5>

              <div className="form-check form-switch mb-4 d-flex align-items-center justify-content-between p-0">
                <div>
                  <label className="text-white small fw-semibold d-block" htmlFor="vocalAlertsToggle">Synthesized Vocal Alerts</label>
                  <span className="text-secondary xsmall" style={{ fontSize: '10px' }}>Announce incoming critical threats out loud in real-time.</span>
                </div>
                <input 
                  className="form-check-input ms-0" 
                  type="checkbox" 
                  role="switch" 
                  id="vocalAlertsToggle"
                  checked={vocalAlerts}
                  onChange={(e) => setVocalAlerts(e.target.checked)}
                  style={{ width: '2.5em', height: '1.25em', cursor: 'pointer', backgroundColor: vocalAlerts ? 'var(--accent-mint)' : '' }}
                />
              </div>

              <div className="mb-4">
                <label className="text-white small fw-medium d-flex justify-content-between mb-2">
                  <span>Warning Chime Tone Volume</span>
                  <span className="font-mono text-secondary">{chimeVolume}%</span>
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={chimeVolume} 
                  className="w-100"
                  style={{ accentColor: 'var(--accent-mint)' }}
                  onChange={(e) => {
                    const vol = parseInt(e.target.value);
                    setChimeVolume(vol);
                    try {
                      const ctx = new (window.AudioContext || window.webkitAudioContext)();
                      const osc = ctx.createOscillator();
                      const gain = ctx.createGain();
                      osc.connect(gain);
                      gain.connect(ctx.destination);
                      osc.frequency.setValueAtTime(800, ctx.currentTime);
                      gain.gain.setValueAtTime(0.08 * (vol / 100), ctx.currentTime);
                      osc.start();
                      osc.stop(ctx.currentTime + 0.08);
                    } catch(e) {}
                  }}
                />
                <span className="text-secondary xsmall mt-1 d-block" style={{ fontSize: '10px' }}>Adjust gain limit for system threat oscillators.</span>
              </div>

              <div className="pt-2">
                <h6 className="text-white small fw-bold mb-2">System Cache & Factory Overrides</h6>
                <div className="d-flex gap-2">
                  <button 
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => {
                      setEvents([]);
                      setStats({
                        totalEvents: 0,
                        anomaliesDetected: 0,
                        normalEvents: 0,
                        highRiskEvents: 0,
                        criticalThreats: 0
                      });
                      logTerminal('Threat logs database wiped clean by Administrator override.', 'warning');
                      triggerToast('Database status wiped!', 'warning');
                    }}
                  >
                    Wipe Logs Cache
                  </button>
                  <button 
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => {
                      logTerminal('Security tunnel config profiles reset to factory values.', 'info');
                      triggerToast('Configs reset successfully', 'info');
                    }}
                  >
                    Reset Tunnels
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };



  return (
    <div className={`dashboard-body ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Background ambient glow */}
      <div className="dashboard-glow glow-top-right"></div>

      {/* Toast alert system HUD */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type === 'critical' ? 'critical' : 'info'} show`}>
            <div className="toast-icon">
              {toast.type === 'critical' ? <ShieldAlert size={18} /> : <AlertTriangle size={18} />}
            </div>
            <div className="toast-content-wrapper">
              <div className="toast-header-text">
                {toast.type === 'critical' ? 'Alert Flagged' : 'System Notice'}
              </div>
              <div className="toast-message-text">{toast.message}</div>
            </div>
            <button 
              className="toast-close" 
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Sidebar navigation */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <span className="brand-logo"></span>
          <h1 className="brand-name">
            <span className="brand-infosys">Infosys</span> Security
          </h1>
        </div>

        <ul className="sidebar-menu">
          <li className={`menu-item ${activePanel === 'Overview' ? 'active' : ''}`} onClick={() => { setActivePanel('Overview'); setInvestigatingEventId(null); }}>
            <a href="#overview" onClick={(e) => e.preventDefault()}>
              <LayoutDashboard size={18} />
              <span>Overview</span>
            </a>
          </li>
          <li className={`menu-item ${activePanel === 'Security Events' ? 'active' : ''}`} onClick={() => { setActivePanel('Security Events'); setInvestigatingEventId(null); }}>
            <a href="#events" onClick={(e) => e.preventDefault()}>
              <Database size={18} />
              <span>Security Events</span>
            </a>
          </li>
          <li className={`menu-item ${activePanel === 'Threat Intelligence' ? 'active' : ''}`} onClick={() => { setActivePanel('Threat Intelligence'); setInvestigatingEventId(null); }}>
            <a href="#intelligence" onClick={(e) => e.preventDefault()}>
              <Map size={18} />
              <span>Threat Intelligence</span>
            </a>
          </li>
          <li className={`menu-item ${activePanel === 'Event Investigation' ? 'active' : ''}`} onClick={() => { setActivePanel('Event Investigation'); }}>
            <a href="#investigate" onClick={(e) => e.preventDefault()}>
              <Search size={18} />
              <span>Event Investigation</span>
            </a>
          </li>
          <li className={`menu-item ${activePanel === 'Vulnerabilities' ? 'active' : ''}`} onClick={() => { setActivePanel('Vulnerabilities'); setInvestigatingEventId(null); }}>
            <a href="#vulnerabilities" onClick={(e) => e.preventDefault()}>
              <Shield size={18} />
              <span>Vulnerabilities</span>
            </a>
          </li>
          <li className={`menu-item ${activePanel === 'Analytics' ? 'active' : ''}`} onClick={() => { setActivePanel('Analytics'); setInvestigatingEventId(null); }}>
            <a href="#analytics" onClick={(e) => e.preventDefault()}>
              <Activity size={18} />
              <span>Analytics</span>
            </a>
          </li>
          <li className={`menu-item ${activePanel === 'Contact Us' ? 'active' : ''}`} onClick={() => { setActivePanel('Contact Us'); setInvestigatingEventId(null); }}>
            <a href="#contact" onClick={(e) => e.preventDefault()}>
              <UserCheck size={18} />
              <span>Contact Us</span>
            </a>
          </li>
          <li className={`menu-item ${activePanel === 'Settings' ? 'active' : ''}`} onClick={() => { setActivePanel('Settings'); setInvestigatingEventId(null); }}>
            <a href="#settings" onClick={(e) => e.preventDefault()}>
              <Settings size={18} />
              <span>Settings</span>
            </a>
          </li>
        </ul>

        {/* User profile session card */}
        <div className="sidebar-profile">
          <div className="profile-card">
            <div className="profile-avatar">
              {currentUser.username.charAt(0).toUpperCase()}
            </div>
            <div className="profile-info">
              <div className="profile-name">{currentUser.username}</div>
              <div className="profile-role">Security Operator</div>
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            <LogOut size={14} strokeWidth={2.5} />
            <span>Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* Main workspace */}
      <main className="dashboard-workspace">
        {/* Header */}
        <header className="workspace-header">
          <div className="header-title-section d-flex align-items-center gap-3">
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
              className="btn-sidebar-toggle"
              title="Toggle Sidebar"
              style={{
                background: 'none',
                border: '1px solid var(--border-color)',
                color: 'var(--accent-mint)',
                borderRadius: '6px',
                padding: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
            >
              <Menu size={18} />
            </button>
             <div>
              <h2 style={{ margin: 0 }} className="d-flex align-items-center gap-2">
                {activePanel === 'Event Investigation' && <Search size={22} className="text-success" />}
                {activePanel === 'Overview' && 'Cyber Threat Center'}
                {activePanel === 'Security Events' && 'Security Events Log'}
                {activePanel === 'Threat Intelligence' && 'Threat Intelligence'}
                {activePanel === 'Event Investigation' && 'Event Investigation'}
                {activePanel === 'Vulnerabilities' && 'Vulnerabilities'}
                {activePanel === 'Analytics' && 'Interactive Engine Analytics'}
                {activePanel === 'Contact Us' && 'Project Command Center'}
                {activePanel === 'Settings' && 'Operational & User Settings'}
              </h2>
              <p style={{ margin: 0 }} className="small">
                {activePanel === 'Overview' && 'Real-time threat monitoring and network visualization terminal'}
                {activePanel === 'Security Events' && 'Database of incoming network logs and alerts'}
                {activePanel === 'Threat Intelligence' && 'Global visualization of attack patterns'}
                {activePanel === 'Event Investigation' && 'Real-time threat telemetry and security risk analytics monitoring'}
                {activePanel === 'Vulnerabilities' && 'Network port audit and risk analysis metrics'}
                {activePanel === 'Analytics' && 'Visual charting of attack trends'}
                {activePanel === 'Contact Us' && 'Meet the developer operations team'}
                {activePanel === 'Settings' && 'Configure profiles, themes, and thresholds'}
              </p>
            </div>
          </div>

          <div className="system-status d-flex align-items-center gap-2">
            {activePanel === 'Event Investigation' && (
              <div className="d-flex gap-2">
                <button 
                  onClick={() => {
                    logTerminal('Triggered telemetric lookup database validation. Diagnostic tables refreshed.', 'info');
                    triggerToast('Refreshed telemetric dataset', 'info');
                  }} 
                  className="btn btn-sm d-flex align-items-center gap-1.5 text-white border"
                  style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    height: '34px',
                    padding: '0 12px',
                    whiteSpace: 'nowrap',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    borderRadius: '6px'
                  }}
                >
                  <RefreshCw size={12} />
                  <span>Refresh Telemetry</span>
                </button>
                <button 
                  onClick={handleExportCSV} 
                  className="btn btn-success btn-sm d-flex align-items-center gap-1.5 text-white"
                  style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    height: '34px',
                    padding: '0 12px',
                    whiteSpace: 'nowrap',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    border: 'none',
                    borderRadius: '6px'
                  }}
                  title="Export Details to CSV"
                >
                  <Download size={12} />
                  <span>Export CSV</span>
                </button>
                <button 
                  onClick={handleExportPDF} 
                  className="btn btn-sm d-flex align-items-center gap-1.5 text-white"
                  style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    height: '34px',
                    padding: '0 12px',
                    whiteSpace: 'nowrap',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    backgroundColor: 'rgba(16, 185, 129, 0.05)',
                    color: 'var(--accent-mint)',
                    borderRadius: '6px'
                  }}
                  title="Export Details to PDF"
                >
                  <Download size={12} />
                  <span>Export PDF</span>
                </button>
              </div>
            )}

            {/* Theme Toggle option */}
            <button 
              type="button" 
              onClick={toggleTheme} 
              className="btn-theme-toggle-dashboard" 
              title="Toggle Theme Mode"
              style={{
                background: 'none',
                border: '1px solid var(--border-color)',
                color: 'var(--accent-mint)',
                borderRadius: '6px',
                height: '34px',
                padding: '0 14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontSize: '11px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
            >
              {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
            <div className="live-clock">{liveTime}</div>
            <div className="status-badge">
              <span className="status-badge-dot"></span>
              <span>System Secure</span>
            </div>
          </div>
        </header>

        {/* Conditional rendering of panels based on sidebar selection or drilldown */}
        {activePanel === 'Event Investigation' ? (
          <EventDetails 
            event={events.find(e => (e.id || e.event_id) === investigatingEventId)} 
            events={events}
            onSelectEvent={(id) => handleInvestigate(id)}
            theme={theme}
          />
        ) : (
          <>
            {activePanel === 'Overview' && renderOverview()}
            {activePanel === 'Security Events' && renderIncidents()}
            {activePanel === 'Threat Intelligence' && renderThreatMap()}
            {activePanel === 'Vulnerabilities' && renderShieldScans()}
            {activePanel === 'Contact Us' && renderContactUs()}
            {activePanel === 'Settings' && renderSettings()}
            {activePanel === 'Analytics' && (
              <>
                {/* KPI Cards Grid */}
                <section className="kpi-grid mb-4">
                  <div className="kpi-card kpi-blue">
                    <div className="kpi-card-header">
                      <span className="kpi-title">Total Events</span>
                      <div className="kpi-icon-circle"><Activity size={18} /></div>
                    </div>
                    <h2 className="kpi-value">{(stats.totalEvents || 0).toLocaleString()}</h2>
                    <span className="kpi-display">Total logged security network events</span>
                  </div>

                  <div className="kpi-card kpi-red">
                    <div className="kpi-card-header">
                      <span className="kpi-title">Anomalies Detected</span>
                      <div className="kpi-icon-circle"><ShieldAlert size={18} /></div>
                    </div>
                    <h2 className="kpi-value">{(stats.anomaliesDetected || 0).toLocaleString()}</h2>
                    <span className="kpi-display">Total AI-flagged anomaly logs</span>
                  </div>

                  <div className="kpi-card kpi-green">
                    <div className="kpi-card-header">
                      <span className="kpi-title">Normal Events</span>
                      <div className="kpi-icon-circle"><ShieldCheck size={18} /></div>
                    </div>
                    <h2 className="kpi-value">{(stats.normalEvents || 0).toLocaleString()}</h2>
                    <span className="kpi-display">Baseline non-threat events</span>
                  </div>

                  <div className="kpi-card kpi-orange">
                    <div className="kpi-card-header">
                      <span className="kpi-title">High-Risk Events</span>
                      <div className="kpi-icon-circle"><AlertTriangle size={18} /></div>
                    </div>
                    <h2 className="kpi-value">{(stats.highRiskEvents || 0).toLocaleString()}</h2>
                    <span className="kpi-display">High-risk warning level classification</span>
                  </div>

                  <div className="kpi-card kpi-purple">
                    <div className="kpi-card-header">
                      <span className="kpi-title">Critical Threats</span>
                      <div className="kpi-icon-circle"><Siren size={18} /></div>
                    </div>
                    <h2 className="kpi-value">{(stats.criticalThreats || 0).toLocaleString()}</h2>
                    <span className="kpi-display">Severe priority exploits flagged</span>
                  </div>
                </section>

                {/* Shared Search and Filters toolbar for Analytics engine */}
                <div className="logs-header mb-4 p-3 rounded" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div className="d-flex align-items-center gap-3">
                      <h3 className="logs-title text-white m-0" style={{ fontSize: '16px' }}>Interactive Engine Filters</h3>
                      <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-0.5 rounded-pill small fw-medium">
                        {filteredEvents.length} Logs Active
                      </span>
                    </div>
                    
                    <div className="logs-toolbar d-flex flex-wrap align-items-center gap-3 m-0">
                      <div className="search-bar">
                        <Search size={16} />
                        <input 
                          type="text" 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search vector, host, IP..." 
                        />
                      </div>

                      <div className="dropdown-filters d-flex gap-2">
                        <select 
                          value={eventTypeFilter}
                          onChange={(e) => setEventTypeFilter(e.target.value)}
                          className="filter-select"
                          title="Event Type"
                        >
                          <option value="ALL">All Event Types</option>
                          {uniqueEventTypes.filter(t => t !== 'ALL').map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>

                        <select 
                          value={ipFilter}
                          onChange={(e) => setIpFilter(e.target.value)}
                          className="filter-select"
                          title="Source IP"
                        >
                          <option value="ALL">All Source IPs</option>
                          {uniqueSourceIps.filter(ip => ip !== 'ALL').map(ip => (
                            <option key={ip} value={ip}>{ip}</option>
                          ))}
                        </select>
                      </div>

                      <div className="table-controls">
                        <button 
                          className={`log-filter-btn ${severityFilter === 'ALL' ? 'active' : ''}`}
                          onClick={() => setSeverityFilter('ALL')}
                        >
                          All
                        </button>
                        <button 
                          className={`log-filter-btn ${severityFilter === 'CRITICAL' ? 'active' : ''}`}
                          onClick={() => setSeverityFilter('CRITICAL')}
                        >
                          Critical
                        </button>
                        <button 
                          className={`log-filter-btn ${severityFilter === 'WARNING' ? 'active' : ''}`}
                          onClick={() => setSeverityFilter('WARNING')}
                        >
                          Warning
                        </button>
                        <button 
                          className={`log-filter-btn ${severityFilter === 'RESOLVED' ? 'active' : ''}`}
                          onClick={() => setSeverityFilter('RESOLVED')}
                        >
                          Resolved
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <section className="dashboard-charts-wrapper">
                  <DashboardCharts 
                    events={filteredEvents} 
                    theme={theme} 
                    searchQuery={searchQuery}
                    eventTypeFilter={eventTypeFilter}
                    ipFilter={ipFilter}
                    severityFilter={severityFilter}
                  />
                </section>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
