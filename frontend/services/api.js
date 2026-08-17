/**
 * API Service Layer for SOC Threat Detection Dashboard
 * Uses Axios to fetch prediction metrics from FastAPI/MongoDB backend.
 * Falls back gracefully to parsing local CSV logs and generating AI insights locally if backend is offline.
 */
// Fetch-based Axios mock wrapper to avoid package dependency errors in sandbox
const axios = {
  get: async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return { status: response.status, data };
  }
};

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Helper to determine AI Prediction from record characteristics
function calculateAIPrediction(record) {
  const isHighRisk = record.is_high_risk === true || record.is_high_risk === 'true' || record.is_high_risk === '1';
  const threatMatch = record.threat_match === true || record.threat_match === 'true' || record.threat_match === 'True';
  const severity = (record.severity || 'LOW').toUpperCase();
  const risk = parseFloat(record.risk_score || 0);

  if (severity === 'CRITICAL' || risk >= 90 || threatMatch) {
    return 'Critical';
  } else if (severity === 'HIGH' || risk >= 60 || isHighRisk) {
    return 'Suspicious';
  } else {
    return 'Normal';
  }
}

// Helper to determine AI Confidence score
function calculateAIConfidence(record, prediction) {
  const risk = parseFloat(record.risk_score || 0);
  if (prediction === 'Critical') {
    // High risk, high confidence of threat
    return risk > 0 ? Math.round(risk) : 95;
  } else if (prediction === 'Suspicious') {
    // Medium risk
    return risk > 0 ? Math.round(risk) : 78;
  } else {
    // Normal prediction, confidence is high that it's normal (inverse of risk)
    return risk > 0 ? Math.round(100 - risk) : 92;
  }
}

// Helper to generate Explainable AI (XAI) reasons based on event rules
function calculateXAIReasons(record) {
  const reasons = [];
  const failedLogins = parseInt(record.failed_login_attempts || 0, 10);
  const isMalware = record.malware_detected === true || record.malware_detected === 'true' || record.malware_detected === 'True';
  const hasVuln = record.vulnerability_id && record.vulnerability_id !== 'null' && record.vulnerability_id !== '';
  const sourceCountry = record.source_country || '';
  const destCountry = record.destination_country || '';
  const risk = parseFloat(record.risk_score || 0);

  // Rule 1: Failed login attempts threshold
  if (failedLogins > 0) {
    reasons.push(`${failedLogins} failed login attempts`);
  }

  // Rule 2: Unusual login time / activity hours (Mocked for demo from timestamp)
  if (record.timestamp) {
    const timeStr = record.timestamp.includes('T') ? record.timestamp.split('T')[1] : record.timestamp;
    const hour = parseInt(timeStr.split(':')[0], 10);
    if (!isNaN(hour) && (hour < 6 || hour > 20)) {
      reasons.push('After-hours activity (unusual login time)');
    }
  }

  // Rule 3: Known malware signature match
  if (isMalware) {
    reasons.push('Known malware signature detected');
  }

  // Rule 4: Exploit of known vulnerability
  if (hasVuln) {
    reasons.push(`Exploit probe targeting vulnerability ${record.vulnerability_id}`);
  }

  // Rule 5: Impossible travel / Geolocation discrepancies
  if (sourceCountry !== destCountry && (sourceCountry === 'CN' || sourceCountry === 'RU' || sourceCountry === 'KP')) {
    reasons.push(`Geographical threat match (source: ${sourceCountry} to dest: ${destCountry})`);
  }

  // Rule 6: Generic threshold
  if (risk > 80 && reasons.length === 0) {
    reasons.push('Anomalous packet sizes and high event frequency');
  }

  // Default baseline reason
  if (reasons.length === 0) {
    reasons.push('Normal baseline traffic frequency');
  }

  return reasons;
}

// Helper to parse CSV data into structured objects
function parseCSV(csvText) {
  if (!csvText || typeof csvText !== 'string') return [];
  
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length === 0) return [];

  // Extract header row and clean quote signs
  const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Standard CSV split with quotes handle
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let charIdx = 0; charIdx < line.length; charIdx++) {
      const char = line[charIdx];
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim().replace(/^["']|["']$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim().replace(/^["']|["']$/g, ''));

    const record = {};
    headers.forEach((header, index) => {
      let val = values[index] !== undefined ? values[index] : '';
      record[header] = val;
    });

    // Provide default mappings to match expected properties
    record.id = record.event_id || `EVT-${1000 + i}`;
    record.time = record.timestamp || record.time || '12:00:00';
    record.name = record.event_type || record.name || 'Unknown Incident';
    record.source = record.source_ip || record.source || '0.0.0.0';
    record.target = record.destination_ip || record.target || 'Internal Host';
    record.severity = (record.severity || 'LOW').toUpperCase();
    
    // Status mapping
    if (!record.status) {
      const isHighRisk = record.is_high_risk;
      const parsedHighRisk = (isHighRisk === true || isHighRisk === 'true' || isHighRisk === '1' || isHighRisk === 'yes');
      record.status = parsedHighRisk ? 'UNRESOLVED' : 'RESOLVED';
    } else {
      record.status = record.status.toUpperCase();
    }

    // AI Prediction fields
    record.prediction = calculateAIPrediction(record);
    record.confidence = calculateAIConfidence(record, record.prediction);
    record.reasons = calculateXAIReasons(record);

    rows.push(record);
  }

  return rows;
}

// Fetch local CSV dataset helper
async function fetchLocalCSVFallback() {
  try {
    const response = await fetch('/final_security_dataset.csv');
    if (response.ok) {
      const text = await response.text();
      return parseCSV(text);
    }
  } catch (e) {
    console.warn('Failed to fetch public CSV fallback, trying raw import...', e);
  }

  try {
    const module = await import('../data/final_security_dataset.csv?raw').catch(() => null);
    if (module && module.default) {
      return parseCSV(module.default);
    }
  } catch (e) {
    console.error('Failed to import raw CSV dataset...', e);
  }

  return [];
}

/**
 * Fetch all events (using Axios with CSV Fallback)
 */
export async function getEvents() {
  try {
    const response = await axios.get(`${API_BASE_URL}/events`);
    if (response.status === 200 && Array.isArray(response.data)) {
      // Augment events from backend with AI prediction details if missing
      return response.data.map((evt, idx) => ({
        ...evt,
        id: evt.event_id || evt.id || `EVT-${1000 + idx}`,
        prediction: evt.prediction || calculateAIPrediction(evt),
        confidence: evt.confidence || calculateAIConfidence(evt, evt.prediction || calculateAIPrediction(evt)),
        reasons: evt.reasons || calculateXAIReasons(evt)
      }));
    }
  } catch (e) {
    console.log('GET /events API failed, falling back to local dataset...', e.message);
  }
  return await fetchLocalCSVFallback();
}

/**
 * Fetch statistics summary
 */
export async function getStats() {
  try {
    const response = await axios.get(`${API_BASE_URL}/stats`);
    if (response.status === 200) {
      return response.data;
    }
  } catch (e) {
    console.log('GET /stats API failed, falling back to local calculation...', e.message);
  }

  const events = await fetchLocalCSVFallback();
  
  const totalEvents = events.length;
  const anomaliesDetected = events.filter(e => e.prediction !== 'Normal').length;
  const normalEvents = events.filter(e => e.prediction === 'Normal').length;
  const highRiskEvents = events.filter(e => e.prediction === 'Suspicious').length;
  const criticalThreats = events.filter(e => e.prediction === 'Critical').length;

  return {
    totalEvents,
    anomaliesDetected,
    normalEvents,
    highRiskEvents,
    criticalThreats
  };
}

/**
 * Fetch unresolved threats logs
 */
export async function getThreats() {
  try {
    const response = await axios.get(`${API_BASE_URL}/threats`);
    if (response.status === 200) {
      return response.data;
    }
  } catch (e) {
    console.log('GET /threats API failed, falling back to local parsing...', e.message);
  }

  const events = await getEvents();
  return events.filter(e => e.status !== 'RESOLVED');
}
