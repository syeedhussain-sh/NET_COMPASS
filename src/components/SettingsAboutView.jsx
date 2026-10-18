import React, { useState } from 'react';
import { checkBackendHealth } from '../services/api';

function SettingsAboutView({
  pollingInterval,
  onUpdatePollingInterval,
  backendConnected,
}) {
  const [healthStatus, setHealthStatus] = useState(null);
  const [checking, setChecking] = useState(false);
  const [cacheCleared, setCacheCleared] = useState(false);

  const handleTestBackend = async () => {
    setChecking(true);
    setHealthStatus(null);
    try {
      const result = await checkBackendHealth();
      setHealthStatus(result);
    } catch (err) {
      setHealthStatus({ success: false, message: err.message || 'Connection failed' });
    } finally {
      setChecking(false);
    }
  };

  const handleClearCache = () => {
    try {
      localStorage.removeItem('netcompass_last_telemetry');
      setCacheCleared(true);
      setTimeout(() => setCacheCleared(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="settings-about-view">
      <div className="section-header">
        <div>
          <h2 className="section-title">Settings &amp; Project Diagnostics</h2>
          <span className="section-subtitle">
            Application configuration, telemetry timeout diagnostics, and project documentation
          </span>
        </div>
        <div className="academic-tag">
          <span>ECE Hackathon Project</span>
        </div>
      </div>

      <div className="settings-grid">
        {/* Settings Card */}
        <div className="settings-card">
          <h3 className="card-heading">Application Settings</h3>

          <div className="setting-item">
            <div className="setting-info">
              <label htmlFor="polling-select" className="setting-label">
                Telemetry Polling Rate
              </label>
              <span className="setting-desc">
                Interval between automated background link status checks
              </span>
            </div>
            <select
              id="polling-select"
              className="setting-select"
              value={pollingInterval}
              onChange={(e) => onUpdatePollingInterval(Number(e.target.value))}
            >
              <option value={0}>Manual Refresh Only (No Auto-Poll)</option>
              <option value={3000}>Every 3 seconds (High Frequency)</option>
              <option value={5000}>Every 5 seconds (Recommended)</option>
              <option value={10000}>Every 10 seconds (Low Overhead)</option>
            </select>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Local Storage Cache</span>
              <span className="setting-desc">
                Purge locally preserved offline telemetry snapshots
              </span>
            </div>
            <button
              type="button"
              className="secondary-btn"
              onClick={handleClearCache}
            >
              {cacheCleared ? 'Cache Cleared ✓' : 'Clear Telemetry Cache'}
            </button>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Backend Link Health Check</span>
              <span className="setting-desc">
                Status: <strong>{backendConnected ? 'Active (Port 5000)' : 'Disconnected / Fallback Mode'}</strong>
              </span>
            </div>
            <button
              type="button"
              className="primary-action-btn"
              onClick={handleTestBackend}
              disabled={checking}
            >
              {checking ? 'Checking...' : 'Ping Backend API'}
            </button>
          </div>

          {healthStatus && (
            <div className={`health-result-box ${healthStatus.success ? 'health-ok' : 'health-warn'}`}>
              <strong>{healthStatus.success ? 'Backend Operational:' : 'Notice:'}</strong> {healthStatus.message}
              {healthStatus.uptime && (
                <div className="uptime-sub">Server Uptime: {Math.round(healthStatus.uptime)}s</div>
              )}
            </div>
          )}
        </div>

        {/* Telemetry Timeout Root Cause Analysis */}
        <div className="settings-card">
          <h3 className="card-heading">Telemetry Timeout Diagnostic Report</h3>
          <div className="diagnostic-content">
            <div className="diag-section">
              <strong className="diag-title">1. Application Telemetry Cause:</strong>
              <p className="diag-text">
                The frontend dashboard previously attempted to fetch <code>/api/telemetry/current</code> with a strict 6-second timeout while the backend server process on port 5000 was inactive (only Vite port 5173 was launched). Without a running backend or Vite proxy, the request aborted with:
                <br />
                <em>"Telemetry request timed out. Please check monitoring connection."</em>
              </p>
              <p className="diag-resolution">
                <strong>Fix Implemented:</strong> Added Vite reverse proxy in <code>vite.config.js</code>, concurrent <code>npm run server</code> scripts, resilient retry logic, and an offline mock fallback provider (<code>mockFallback.js</code>) so the dashboard never halts.
              </p>
            </div>

            <div className="diag-section">
              <strong className="diag-title">2. Antigravity IDE Telemetry:</strong>
              <p className="diag-text">
                Antigravity IDE is built on a VS Code-derived runtime. If your environment or firewall restricts external analytics pings, the IDE logs a background telemetry timeout.
              </p>
              <p className="diag-menu-path">
                <strong>IDE Setting Path:</strong> <code>File &gt; Preferences &gt; Settings &gt; Application &gt; Telemetry &gt; Telemetry Level</code> (set to <code>off</code> or <code>error</code> to suppress warnings).
              </p>
              <p className="diag-note">
                Network Compass is 100% independent of IDE telemetry and does not require IDE telemetry to operate.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Project Information & Team */}
      <div className="standards-reference-card">
        <h4 className="standards-title">About Network Compass — ECE Hackathon Prototype</h4>
        <div className="about-details-grid">
          <div>
            <strong>Project Title:</strong> Network Compass — Radio Access &amp; RF Propagation Intelligence
          </div>
          <div>
            <strong>Domain:</strong> Electronics &amp; Communication Engineering (ECE) / Telecommunications
          </div>
          <div>
            <strong>Stack:</strong> React 19, Vite, Recharts, Leaflet, Node.js, Express, CSS3 Custom Properties
          </div>
          <div>
            <strong>Academic Disclaimer:</strong> This application demonstrates cellular telemetry principles (RSRP, RSRQ, SINR, CQI, Carrier Aggregation). All measurements are generated using mathematical RF propagation models and do not claim to represent physical hardware changes or ISP speed guarantees.
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsAboutView;
