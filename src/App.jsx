import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  getCurrentTelemetry,
  getTelemetryHistory,
  getCoveragePoints,
  checkBackendHealth,
} from './services/api';
import Navbar from './components/Navbar';
import MainDashboardView from './components/MainDashboardView';
import NetworkOverview from './components/dashboard/NetworkOverview';
import NetworkScanner from './components/NetworkScanner';
import SignalMonitor from './components/SignalMonitor';
import NetworkModeSelector from './components/NetworkModeSelector';
import SpeedTestView from './components/SpeedTestView';
import CoverageMap from './components/CoverageMap';
import TelemetryHistory from './components/TelemetryHistory';
import OfflineModeView from './components/OfflineModeView';
import SettingsAboutView from './components/SettingsAboutView';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [telemetry, setTelemetry] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [coverageData, setCoverageData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [telemetryError, setTelemetryError] = useState(null);
  const [historyError, setHistoryError] = useState(null);
  const [coverageError, setCoverageError] = useState(null);

  const [backendHealth, setBackendHealth] = useState({ checked: false, connected: false });
  const [isOfflineSimulated, setIsOfflineSimulated] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(5000); // 5 seconds default

  const isInitialMount = useRef(true);

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

  // Fetch current telemetry
  const fetchTelemetry = useCallback(async (isInitial = false) => {
    if (isOfflineSimulated) {
      // In offline simulation mode, preserve last telemetry state
      setRefreshing(false);
      return;
    }

    if (!isInitial) {
      setRefreshing(true);
    }
    setTelemetryError(null);

    try {
      const data = await getCurrentTelemetry();
      setTelemetry(data);
      if (!data.isOfflineFallback) {
        setBackendHealth({ checked: true, connected: true });
      } else {
        setBackendHealth({ checked: true, connected: false });
      }
      // Update history buffer
      fetchHistory();
    } catch (err) {
      console.warn('Telemetry fetch warning:', err);
      setTelemetryError(err.message || 'Unable to retrieve network telemetry.');
      setBackendHealth({ checked: true, connected: false });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchHistory, isOfflineSimulated]);

  // Initial load
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      checkBackendHealth()
        .then((res) => setBackendHealth({ checked: true, connected: !!res.success }))
        .catch(() => setBackendHealth({ checked: true, connected: false }));

      fetchTelemetry(true);
      fetchCoverage();
    }
  }, [fetchTelemetry, fetchCoverage]);

  // Automated polling effect
  useEffect(() => {
    if (pollingInterval <= 0 || isOfflineSimulated) return;

    const timer = setInterval(() => {
      fetchTelemetry(false);
    }, pollingInterval);

    return () => clearInterval(timer);
  }, [pollingInterval, isOfflineSimulated, fetchTelemetry]);

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
              <span className="simulation-pill">
                {isOfflineSimulated ? 'OFFLINE SIM' : telemetry?.networkType ? `${telemetry.networkType} SIM` : 'SIMULATION'}
              </span>
            </div>
            <p className="header-app-subtitle">
              Cellular RF Telemetry, Propagation Intelligence &amp; Link Benchmarking
            </p>
          </div>
        </div>

        {/* Monitoring Service Connectivity Status */}
        <div className="header-status-pill">
          <span
            className={`status-pill-dot ${isOfflineSimulated ? 'disconnected' : backendHealth.connected ? 'connected' : 'disconnected'}`}
            aria-hidden="true"
          />
          <span className="status-pill-label">
            {isOfflineSimulated
              ? 'Offline Mode Active'
              : backendHealth.connected
              ? 'Backend API Connected'
              : 'Offline Demo Cache'}
          </span>
        </div>
      </header>

      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isOfflineSimulated={isOfflineSimulated}
      />

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
            {/* 1. Dashboard View */}
            {activeTab === 'dashboard' && (
              <MainDashboardView
                telemetry={telemetry}
                historyData={historyData}
                loading={refreshing}
                error={telemetryError}
                onRefresh={() => fetchTelemetry(false)}
                onNavigate={setActiveTab}
              />
            )}

            {/* 2. Network Overview */}
            {activeTab === 'overview' && (
              <NetworkOverview
                telemetry={telemetry}
                loading={refreshing}
                error={telemetryError}
                onRefresh={() => fetchTelemetry(false)}
              />
            )}

            {/* 3. Network Scanner */}
            {activeTab === 'scanner' && <NetworkScanner />}

            {/* 4. Signal Monitoring */}
            {activeTab === 'signal' && <SignalMonitor telemetry={telemetry} />}

            {/* 5. 4G/5G Network Mode */}
            {activeTab === 'mode' && (
              <NetworkModeSelector
                currentTelemetry={telemetry}
                onProfileChanged={(updated) => setTelemetry(updated)}
              />
            )}

            {/* 6. Speed & Latency */}
            {activeTab === 'speedtest' && (
              <SpeedTestView currentTelemetry={telemetry} />
            )}

            {/* 7. Heat Map */}
            {activeTab === 'heatmap' && (
              <section className="dashboard-section" aria-labelledby="coverage-heading">
                <CoverageMap
                  coverageData={coverageData}
                  loading={loading}
                  error={coverageError}
                  onRetry={fetchCoverage}
                />
              </section>
            )}

            {/* 8. History & Analytics */}
            {activeTab === 'history' && (
              <section className="dashboard-section" aria-labelledby="history-heading">
                <TelemetryHistory
                  historyData={historyData}
                  loading={loading}
                  error={historyError}
                  onRetry={fetchHistory}
                />
              </section>
            )}

            {/* 9. Offline Mode */}
            {activeTab === 'offline' && (
              <OfflineModeView
                isOfflineSimulated={isOfflineSimulated}
                onToggleOffline={() => setIsOfflineSimulated(!isOfflineSimulated)}
                currentTelemetry={telemetry}
              />
            )}

            {/* 10. Settings & About */}
            {activeTab === 'settings' && (
              <SettingsAboutView
                pollingInterval={pollingInterval}
                onUpdatePollingInterval={setPollingInterval}
                backendConnected={backendHealth.connected}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>
          Network Compass • ECE Hackathon Telemetry System • React 19 + Node.js Express
        </p>
      </footer>
    </div>
  );
}

export default App;
