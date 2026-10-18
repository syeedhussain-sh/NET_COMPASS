import React, { useState, useEffect, useCallback } from 'react';
import {
  getCurrentTelemetry,
  getTelemetryHistory,
  getCoveragePoints,
  checkBackendHealth,
} from './services/api';
import NetworkOverview from './components/dashboard/NetworkOverview';
import CoverageMap from './components/CoverageMap';
import TelemetryHistory from './components/TelemetryHistory';
import './App.css';

function App() {
  const [telemetry, setTelemetry] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [coverageData, setCoverageData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [telemetryError, setTelemetryError] = useState(null);
  const [historyError, setHistoryError] = useState(null);
  const [coverageError, setCoverageError] = useState(null);

  const [backendHealth, setBackendHealth] = useState({ checked: false, connected: false });

  // Fetch telemetry history
  const fetchHistory = useCallback(async () => {
    try {
      setHistoryError(null);
      const data = await getTelemetryHistory(60);
      setHistoryData(data);
    } catch (err) {
      console.error('Failed to fetch telemetry history:', err);
      setHistoryError('Network history unavailable.');
    }
  }, []);

  // Fetch coverage points
  const fetchCoverage = useCallback(async () => {
    try {
      setCoverageError(null);
      const data = await getCoveragePoints();
      setCoverageData(data);
    } catch (err) {
      console.error('Failed to fetch coverage points:', err);
      setCoverageError('Coverage data unavailable.');
    }
  }, []);

  // Fetch current telemetry from backend
  const fetchTelemetry = useCallback(async (isInitial = false) => {
    if (isInitial) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    setTelemetryError(null);

    try {
      const data = await getCurrentTelemetry();
      setTelemetry(data);
      setBackendHealth({ checked: true, connected: true });
      // When refreshed, also update history buffer
      fetchHistory();
    } catch (err) {
      console.error('Failed to fetch telemetry:', err);
      setTelemetryError(err.message || 'Unable to retrieve network telemetry.');
      setBackendHealth({ checked: true, connected: false });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchHistory]);

  // Initial load
  useEffect(() => {
    // Quick backend sanity check
    checkBackendHealth()
      .then(() => setBackendHealth({ checked: true, connected: true }))
      .catch(() => setBackendHealth({ checked: true, connected: false }));

    // Fetch initial datasets concurrently
    fetchTelemetry(true);
    fetchCoverage();
  }, [fetchTelemetry, fetchCoverage]);

  return (
    <div className="app-container">
      {/* Ambient background glow accents */}
      <div className="glow-circle glow-circle-1" aria-hidden="true" />
      <div className="glow-circle glow-circle-2" aria-hidden="true" />

      {/* Main Dashboard Navigation Header */}
      <header className="dashboard-header">
        <div className="header-brand">
          <div className="header-compass-icon" aria-hidden="true">
            <div className="header-radar-sweep" />
            <svg
              className="compass-svg-mini"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" opacity="0.4" />
              <circle cx="32" cy="32" r="20" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
              <circle cx="32" cy="32" r="3" fill="currentColor" />
              <path d="M32 10L36 28L32 32L28 28L32 10Z" fill="#06b6d4" />
              <path d="M32 54L28 36L32 32L36 36L32 54Z" fill="#3b82f6" opacity="0.8" />
            </svg>
          </div>
          <div className="header-title-group">
            <div className="header-top-row">
              <h1 className="header-app-title">NETWORK COMPASS</h1>
              <span className="simulation-pill">SIMULATION</span>
            </div>
            <p className="header-app-subtitle">
              Network Connectivity Monitoring &amp; Visualization
            </p>
          </div>
        </div>

        {/* Monitoring Service Connectivity Status */}
        <div className="header-status-pill">
          <span
            className={`status-pill-dot ${backendHealth.connected ? 'connected' : 'disconnected'}`}
            aria-hidden="true"
          />
          <span className="status-pill-label">
            {backendHealth.connected ? 'Monitoring Active' : 'Service Disconnected'}
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="dashboard-main">
        {loading && !telemetry ? (
          <div className="dashboard-loading-state">
            <div className="loading-radar-spinner" aria-hidden="true" />
            <h2>Connecting to Telemetry Stream...</h2>
            <p>Establishing link with network monitoring service</p>
          </div>
        ) : (
          <div className="dashboard-content-stack">
            {/* 1. Existing Network Overview */}
            <NetworkOverview
              telemetry={telemetry}
              loading={refreshing}
              error={telemetryError}
              onRefresh={() => fetchTelemetry(false)}
            />

            {/* 2. Coverage Intelligence & Heatmap */}
            <section className="dashboard-section" aria-labelledby="coverage-section-heading">
              <div className="section-header">
                <h2 id="coverage-section-heading" className="section-title">Coverage Intelligence</h2>
                <span className="section-subtitle">Geographic RF distribution &amp; signal propagation density</span>
              </div>
              <CoverageMap
                coverageData={coverageData}
                loading={loading}
                error={coverageError}
                onRetry={fetchCoverage}
              />
            </section>

            {/* 3. Telemetry Performance History */}
            <section className="dashboard-section" aria-labelledby="history-section-heading">
              <div className="section-header">
                <h2 id="history-section-heading" className="section-title">Network History</h2>
                <span className="section-subtitle">Longitudinal telemetry performance and link stability</span>
              </div>
              <TelemetryHistory
                historyData={historyData}
                loading={loading}
                error={historyError}
                onRetry={fetchHistory}
              />
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>
          Network Compass • Telemetry Monitoring System • ECE Department
        </p>
      </footer>
    </div>
  );
}

export default App;
