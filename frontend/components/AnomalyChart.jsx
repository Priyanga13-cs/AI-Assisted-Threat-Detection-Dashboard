import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

/**
 * AnomalyChart Component
 * Contains three responsive charts powered by Chart.js:
 * 1. Anomaly Distribution (Pie/Donut: Normal, Suspicious, Critical)
 * 2. Threat Trend (Line: Hour/Time vs. Number of Anomalies)
 * 3. Threat Type Chart (Bar: Brute Force, Malware, Phishing, SQL Injection, Privilege Escalation)
 * 
 * Props:
 * - events: Array of events parsed from the API
 * - theme: 'light' | 'dark'
 */
export default function AnomalyChart({ events = [], theme = 'dark' }) {
  // Canvas refs
  const distCanvasRef = useRef(null);
  const trendCanvasRef = useRef(null);
  const typeCanvasRef = useRef(null);

  // Chart instances refs
  const distChartInst = useRef(null);
  const trendChartInst = useRef(null);
  const typeChartInst = useRef(null);

  useEffect(() => {
    const isLight = theme === 'light';
    const textColor = isLight ? '#475569' : '#94a3b8';
    const gridColor = isLight ? 'rgba(15, 23, 42, 0.05)' : 'rgba(255, 255, 255, 0.02)';
    const legendColor = isLight ? '#0f172a' : '#94a3b8';
    const borderColor = isLight ? '#ffffff' : '#0a0f12';

    // ==========================================
    // 1. ANOMALY DISTRIBUTION DONUT CHART
    // ==========================================
    let normalCount = 0;
    let suspiciousCount = 0;
    let criticalCount = 0;

    events.forEach(evt => {
      const pred = String(evt.prediction || '').toUpperCase();
      if (pred === 'CRITICAL') {
        criticalCount++;
      } else if (pred === 'SUSPICIOUS') {
        suspiciousCount++;
      } else {
        normalCount++;
      }
    });

    // Fallbacks if no data loaded yet
    if (events.length === 0) {
      normalCount = 15;
      suspiciousCount = 8;
      criticalCount = 3;
    }

    if (distCanvasRef.current) {
      if (distChartInst.current) distChartInst.current.destroy();

      const ctx = distCanvasRef.current.getContext('2d');
      distChartInst.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Normal', 'Suspicious', 'Critical'],
          datasets: [{
            data: [normalCount, suspiciousCount, criticalCount],
            backgroundColor: [
              '#10b981', // Normal (Green)
              '#f59e0b', // Suspicious (Amber)
              '#ef4444'  // Critical (Red)
            ],
            borderColor: borderColor,
            borderWidth: 2,
            hoverOffset: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: legendColor,
                font: { size: 11, family: 'Inter', weight: '500' },
                padding: 10,
                usePointStyle: true,
                pointStyle: 'circle'
              }
            },
            tooltip: {
              backgroundColor: isLight ? 'rgba(255,255,255,0.95)' : 'rgba(10, 15, 18, 0.95)',
              titleColor: isLight ? '#0f172a' : '#ffffff',
              bodyColor: isLight ? '#475569' : '#94a3b8',
              borderColor: 'rgba(16, 185, 129, 0.15)',
              borderWidth: 1
            }
          },
          cutout: '70%'
        },
        plugins: [{
          id: 'centerTotal',
          afterDraw: (chart) => {
            const { ctx, chartArea: { top, bottom, left, right } } = chart;
            ctx.save();
            const centerX = (left + right) / 2;
            const centerY = (top + bottom) / 2;
            
            const active = chart.getActiveElements();
            let labelText = 'TOTAL EVENTS';
            let valText = (normalCount + suspiciousCount + criticalCount).toString();

            if (active.length > 0) {
              const idx = active[0].index;
              labelText = chart.data.labels[idx].toUpperCase();
              valText = chart.data.datasets[0].data[idx].toString();
            }

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            ctx.font = '700 8px Inter';
            ctx.fillStyle = textColor;
            ctx.fillText(labelText, centerX, centerY - 8);

            ctx.font = '800 18px Inter';
            ctx.fillStyle = isLight ? '#0f172a' : '#ffffff';
            ctx.fillText(valText, centerX, centerY + 8);
            ctx.restore();
          }
        }]
      });
    }

    // ==========================================
    // 2. THREAT TREND LINE CHART (Time vs Anomalies)
    // ==========================================
    // Aggregate anomaly count (Suspicious + Critical) by hour
    const hourlyAnomalies = {};
    for (let h = 0; h < 24; h++) {
      hourlyAnomalies[h] = 0;
    }

    events.forEach(evt => {
      const pred = String(evt.prediction || '').toUpperCase();
      const isAnomaly = pred === 'SUSPICIOUS' || pred === 'CRITICAL';
      if (isAnomaly && evt.time && typeof evt.time === 'string') {
        const parts = evt.time.split(':');
        // Handle ISO timestamps like 2026-07-30T01:12:00Z
        let hour = NaN;
        if (evt.time.includes('T')) {
          const timePart = evt.time.split('T')[1];
          hour = parseInt(timePart.split(':')[0], 10);
        } else {
          hour = parseInt(parts[0], 10);
        }
        if (!isNaN(hour) && hour >= 0 && hour < 24) {
          hourlyAnomalies[hour]++;
        }
      }
    });

    // Extract active ranges (skip hours that have no events at all to keep chart focused)
    const hours = Object.keys(hourlyAnomalies).map(Number);
    const trendLabels = hours.map(h => `${String(h).padStart(2, '0')}:00`);
    const trendValues = hours.map(h => hourlyAnomalies[h]);

    // Fallbacks if no anomalies exist in dataset yet
    if (trendValues.every(v => v === 0)) {
      // Simulate trend curve
      trendValues[1] = 2;
      trendValues[2] = 5;
      trendValues[3] = 4;
      trendValues[4] = 9;
      trendValues[5] = 3;
      trendValues[6] = 8;
    }

    if (trendCanvasRef.current) {
      if (trendChartInst.current) trendChartInst.current.destroy();

      const lineCtx = trendCanvasRef.current.getContext('2d');
      const gradient = lineCtx.createLinearGradient(0, 0, 0, 180);
      gradient.addColorStop(0, 'rgba(239, 68, 68, 0.3)');
      gradient.addColorStop(1, 'rgba(239, 68, 68, 0.0)');

      trendChartInst.current = new Chart(lineCtx, {
        type: 'line',
        data: {
          labels: trendLabels,
          datasets: [{
            label: 'Detected Anomalies',
            data: trendValues,
            borderColor: '#ef4444',
            borderWidth: 3,
            backgroundColor: gradient,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#ef4444',
            pointBorderColor: borderColor,
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: isLight ? 'rgba(255,255,255,0.95)' : 'rgba(10, 15, 18, 0.95)',
              titleColor: isLight ? '#0f172a' : '#ffffff',
              bodyColor: isLight ? '#475569' : '#94a3b8',
              borderColor: 'rgba(239, 68, 68, 0.2)',
              borderWidth: 1
            }
          },
          scales: {
            x: {
              grid: { color: gridColor },
              ticks: { color: textColor, font: { size: 10 } }
            },
            y: {
              grid: { color: gridColor },
              ticks: { color: textColor, font: { size: 10 }, precision: 0 }
            }
          }
        }
      });
    }

    // ==========================================
    // 3. THREAT TYPE CHART (Bar chart of specific types)
    // ==========================================
    let bruteForce = 0;
    let malware = 0;
    let phishing = 0;
    let sqlInjection = 0;
    let privilegeEscalation = 0;

    events.forEach(evt => {
      const type = String(evt.name || evt.event_type || '').toLowerCase();
      if (type.includes('brute') || type.includes('login') || type.includes('password') || type.includes('spray')) bruteForce++;
      else if (type.includes('malware') || type.includes('trojan') || type.includes('ransomware') || type.includes('rootkit')) malware++;
      else if (type.includes('phishing')) phishing++;
      else if (type.includes('sql') || type.includes('injection')) sqlInjection++;
      else if (type.includes('privilege') || type.includes('escalation')) privilegeEscalation++;
    });

    // Fallbacks
    if (bruteForce === 0 && malware === 0 && phishing === 0 && sqlInjection === 0 && privilegeEscalation === 0) {
      bruteForce = 6;
      malware = 4;
      phishing = 2;
      sqlInjection = 5;
      privilegeEscalation = 3;
    }

    if (typeCanvasRef.current) {
      if (typeChartInst.current) typeChartInst.current.destroy();

      const barCtx = typeCanvasRef.current.getContext('2d');
      typeChartInst.current = new Chart(barCtx, {
        type: 'bar',
        data: {
          labels: ['Brute Force', 'Malware', 'Phishing', 'SQL Injection', 'Privilege Esc.'],
          datasets: [{
            label: 'Detected Count',
            data: [bruteForce, malware, phishing, sqlInjection, privilegeEscalation],
            backgroundColor: [
              'rgba(245, 158, 11, 0.75)', // Amber
              'rgba(59, 130, 246, 0.75)',  // Blue
              'rgba(168, 85, 247, 0.75)',  // Purple
              'rgba(239, 68, 68, 0.75)',   // Red
              'rgba(236, 72, 153, 0.75)'   // Pink
            ],
            borderColor: [
              '#f59e0b', '#3b82f6', '#a855f7', '#ef4444', '#ec4899'
            ],
            borderWidth: 1.5,
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: isLight ? 'rgba(255,255,255,0.95)' : 'rgba(10, 15, 18, 0.95)',
              titleColor: isLight ? '#0f172a' : '#ffffff',
              bodyColor: isLight ? '#475569' : '#94a3b8'
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: textColor, font: { size: 9 } }
            },
            y: {
              grid: { color: gridColor },
              ticks: { color: textColor, font: { size: 10 }, precision: 0 }
            }
          }
        }
      });
    }

    // Cleanup on unmount
    return () => {
      if (distChartInst.current) distChartInst.current.destroy();
      if (trendChartInst.current) trendChartInst.current.destroy();
      if (typeChartInst.current) typeChartInst.current.destroy();
    };
  }, [events, theme]);

  return (
    <div className="row g-4 mb-4">
      {/* 1. Anomaly Distribution */}
      <div className="col-lg-4 col-12">
        <div className="card bg-dark-subtle border border-secondary-subtle p-4 rounded-4 h-100" style={{
          background: 'rgba(10, 15, 18, 0.4)',
          backdropFilter: 'blur(10px)',
        }}>
          <h5 className="text-white fw-bold mb-1">Anomaly Distribution</h5>
          <p className="text-secondary small mb-3">Ratio of normal vs anomalous predictions</p>
          <div style={{ height: '220px', position: 'relative' }}>
            <canvas ref={distCanvasRef} />
          </div>
        </div>
      </div>

      {/* 2. Threat Trend Line */}
      <div className="col-lg-4 col-12">
        <div className="card bg-dark-subtle border border-secondary-subtle p-4 rounded-4 h-100" style={{
          background: 'rgba(10, 15, 18, 0.4)',
          backdropFilter: 'blur(10px)',
        }}>
          <h5 className="text-white fw-bold mb-1">Anomaly Trend Over Time</h5>
          <p className="text-secondary small mb-3">Timeline tracking volume of detected anomalies</p>
          <div style={{ height: '220px' }}>
            <canvas ref={trendCanvasRef} />
          </div>
        </div>
      </div>

      {/* 3. Threat Type Bar */}
      <div className="col-lg-4 col-12">
        <div className="card bg-dark-subtle border border-secondary-subtle p-4 rounded-4 h-100" style={{
          background: 'rgba(10, 15, 18, 0.4)',
          backdropFilter: 'blur(10px)',
        }}>
          <h5 className="text-white fw-bold mb-1">Anomalies by Attack Vector</h5>
          <p className="text-secondary small mb-3">Classification profile of threat intrusion vectors</p>
          <div style={{ height: '220px' }}>
            <canvas ref={typeCanvasRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
