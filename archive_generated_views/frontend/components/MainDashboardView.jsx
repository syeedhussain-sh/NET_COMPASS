import React from 'react';
import ConnectionStatus from './dashboard/ConnectionStatus';
import NetworkType from './dashboard/NetworkType';
import SignalStrength from './dashboard/SignalStrength';
import MetricCard from './dashboard/MetricCard';

function MainDashboardView({
  telemetry,
  historyData = [],
  loading,
  error,
  onRefresh,
  onNavigate,
}) {
  const formatTime = (isoString) => {
    if (!isoString) return '--';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return isoString;
    }
  };

  const getQualityBadgeClass = (quality) => {
    switch (quality?.toLowerCase()) {
      case 'excellent':
        return 'quality-excellent';
      case 'good':
        return 'quality-good';
      case 'fair':
        return 'quality-fair';
      case 'poor':
        return 'quality-poor';
      default:
        return 'quality-good';
    }
  };

  const recentMeasurements = (historyData || []).slice(-5).reverse();

  return (
    <div className="main-dashboard-view">
      {/* Offline Fallback / Error Notification Banner */}
      {telemetry?.isOfflineFallback && (
        <div className="scanner-notice-banner" style={{ borderColor: 'rgba(245, 158, 11, 0.4)', background: 'rgba(245, 158, 11, 0.08)' }}>
          <span className="notice-icon">⚠️</span>
          <span>
            <strong>Working in Resilient Offline Demo Mode:</strong> Backend telemetry streaming is unavailable. The dashboard is automatically operating using locally simulated and cached link metrics.
          </span>
        </div>
      )}

      {error && !telemetry?.isOfflineFallback && (
        <div className="overview-error-banner" role="alert">
          <div className="error-content">
            <span className="error-icon" aria-hidden="true">⚠️</span>
            <div className="error-text">
              <strong>Connection Notice:</strong> {error}
            </div>
          </div>
          <button
            type="button"
            className="retry-btn"
            onClick={onRefresh}
            disabled={loading}
          >
            Retry
          </button>
        </div>
      )}

      {/* Primary Status Grid */}
      <section className="dashboard-section" aria-labelledby="dash-status-heading">
        <div className="section-header">
          <h2 id="dash-status-heading" className="section-title">Telemetry Status Overview</h2>
          <span className="section-subtitle">Real-time radio access link parameters &amp; connection telemetry</span>
        </div>

        <div className="telemetry-primary-grid">
          <div className="overview-card highlight-card">
            <div className="card-header-label">Connection Status</div>
            <ConnectionStatus status={telemetry?.connectionStatus || 'Connected'} />
          </div>

          <div className="overview-card highlight-card">
            <div className="card-header-label">Cellular Technology</div>
            <NetworkType
              networkType={telemetry?.networkType || '5G'}
              technology={telemetry?.technology || '5G Sub-6'}
            />
          </div>

          <div className="overview-card highlight-card">
            <div className="card-header-label">Signal Strength</div>
            <SignalStrength
              signalStrength={telemetry?.signalStrength ?? -75}
              signalBars={telemetry?.signalBars ?? 4}
            />
          </div>

          <div className="overview-card highlight-card">
            <div className="card-header-label">Network Quality</div>
            <div className="quality-container">
              <span className={`quality-badge ${getQualityBadgeClass(telemetry?.quality)}`}>
                {telemetry?.quality || 'Good'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Performance Metrics Cards */}
      <section className="dashboard-section" aria-labelledby="dash-perf-heading">
        <div className="section-header">
          <h2 id="dash-perf-heading" className="section-title">Link Performance Metrics</h2>
          <span className="section-subtitle">Throughput, transmission latency, and RF link integrity</span>
        </div>

        <div className="metrics-grid">
          <MetricCard
            title="Download Speed"
            value={telemetry?.downloadSpeed ?? '--'}
            unit="Mbps"
            colorVariant="cyan"
            icon="⬇️"
            subtext="Downlink throughput"
          />

          <MetricCard
            title="Upload Speed"
            value={telemetry?.uploadSpeed ?? '--'}
            unit="Mbps"
            colorVariant="blue"
            icon="⬆️"
            subtext="Uplink throughput"
          />

          <MetricCard
            title="Latency / Ping"
            value={telemetry?.latency ?? '--'}
            unit="ms"
            colorVariant="emerald"
            icon="⏱️"
            subtext="Round-trip transmission delay"
          />

          <MetricCard
            title="Jitter"
            value={telemetry?.jitter ?? '--'}
            unit="ms"
            colorVariant="indigo"
            icon="〰️"
            subtext="Packet delay variance"
          />

          <MetricCard
            title="Packet Loss"
            value={telemetry?.packetLoss ?? '--'}
            unit="%"
            colorVariant={telemetry?.packetLoss > 1.5 ? 'amber' : 'slate'}
            icon="📉"
            subtext="Frame drop rate"
          />

          <MetricCard
            title="SINR Ratio"
            value={telemetry?.sinr ?? 18.5}
            unit="dB"
            colorVariant="emerald"
            icon="📶"
            subtext="Signal to Interference Ratio"
          />
        </div>
      </section>

      {/* Quick Navigation Action Hub */}
      <section className="dashboard-section" aria-labelledby="dash-hub-heading">
        <div className="section-header">
          <h2 id="dash-hub-heading" className="section-title">Connected Network Modules</h2>
          <span className="section-subtitle">Direct access to specialized RF analysis, simulation, and diagnostic benches</span>
        </div>

        <div className="dashboard-quick-hub">
          {/* 1. RF Scanner Card */}
          <div className="hub-card">
            <div>
              <div className="hub-card-header">
                <span className="hub-icon">🔍</span>
                <h3 className="hub-title">Network Scanner</h3>
              </div>
              <p className="hub-desc">
                Sweep frequency spectrum across 5G NR and LTE carrier bands. Discover surrounding cell towers, PCIs, and signal levels.
              </p>
            </div>
            <div>
              <div className="hub-status-row">
                <span className="hub-status-label">Active Transponder:</span>
                <span className="hub-status-val">{telemetry?.technology || '5G Sub-6'}</span>
              </div>
              <button
                type="button"
                className="hub-action-btn"
                onClick={() => onNavigate('scanner')}
              >
                <span>Open Scanner</span> &rarr;
              </button>
            </div>
          </div>

          {/* 2. 4G/5G Network Mode */}
          <div className="hub-card">
            <div>
              <div className="hub-card-header">
                <span className="hub-icon">⚡</span>
                <h3 className="hub-title">4G / 5G Radio Mode</h3>
              </div>
              <p className="hub-desc">
                Switch between simulated 5G mmWave, 5G Sub-6, 4G LTE-A, and legacy LTE profiles to test cellular behavior.
              </p>
            </div>
            <div>
              <div className="hub-status-row">
                <span className="hub-status-label">Current Profile:</span>
                <span className="hub-status-val">{telemetry?.profileName || '5G Sub-6 GHz'}</span>
              </div>
              <button
                type="button"
                className="hub-action-btn"
                onClick={() => onNavigate('mode')}
              >
                <span>Switch Radio Mode</span> &rarr;
              </button>
            </div>
          </div>

          {/* 3. Speed & Latency Benchmark */}
          <div className="hub-card">
            <div>
              <div className="hub-card-header">
                <span className="hub-icon">⚡</span>
                <h3 className="hub-title">Speed &amp; Latency Bench</h3>
              </div>
              <p className="hub-desc">
                Run an interactive link benchmark with animated gauge speedometer testing downlink, uplink, and propagation delay.
              </p>
            </div>
            <div>
              <div className="hub-status-row">
                <span className="hub-status-label">Current Throughput:</span>
                <span className="hub-status-val">{telemetry?.downloadSpeed ?? 240} Mbps</span>
              </div>
              <button
                type="button"
                className="hub-action-btn"
                onClick={() => onNavigate('speedtest')}
              >
                <span>Run Speed Benchmark</span> &rarr;
              </button>
            </div>
          </div>

          {/* 4. Coverage Heat Map */}
          <div className="hub-card">
            <div>
              <div className="hub-card-header">
                <span className="hub-icon">🗺️</span>
                <h3 className="hub-title">Coverage Heat Map</h3>
              </div>
              <p className="hub-desc">
                Explore interactive Leaflet RF coverage topology, path propagation loss bubbles, and sector transmitter towers.
              </p>
            </div>
            <div>
              <div className="hub-status-row">
                <span className="hub-status-label">Target Zone:</span>
                <span className="hub-status-val">Innovation Tech Campus</span>
              </div>
              <button
                type="button"
                className="hub-action-btn"
                onClick={() => onNavigate('heatmap')}
              >
                <span>View Full Map</span> &rarr;
              </button>
            </div>
          </div>

          {/* 5. Network History */}
          <div className="hub-card">
            <div>
              <div className="hub-card-header">
                <span className="hub-icon">📈</span>
                <h3 className="hub-title">History &amp; Analytics</h3>
              </div>
              <p className="hub-desc">
                Analyze longitudinal time-series telemetry charts, signal fluctuation trends, and export dataset records.
              </p>
            </div>
            <div>
              <div className="hub-status-row">
                <span className="hub-status-label">Buffer Capacity:</span>
                <span className="hub-status-val">{historyData?.length || 0} Telemetry Samples</span>
              </div>
              <button
                type="button"
                className="hub-action-btn"
                onClick={() => onNavigate('history')}
              >
                <span>View Trend Charts</span> &rarr;
              </button>
            </div>
          </div>

          {/* 6. Offline Mode */}
          <div className="hub-card">
            <div>
              <div className="hub-card-header">
                <span className="hub-icon">📴</span>
                <h3 className="hub-title">Offline Mode &amp; Cache</h3>
              </div>
              <p className="hub-desc">
                Simulate underground or subterranean signal loss. Verify data resilience using browser local storage cache.
              </p>
            </div>
            <div>
              <div className="hub-status-row">
                <span className="hub-status-label">Cache Preservation:</span>
                <span className="hub-status-val">Available</span>
              </div>
              <button
                type="button"
                className="hub-action-btn"
                onClick={() => onNavigate('offline')}
              >
                <span>Manage Offline Mode</span> &rarr;
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Telemetry Measurements Log Table */}
      {recentMeasurements.length > 0 && (
        <section className="dashboard-section" aria-labelledby="dash-table-heading">
          <div className="section-header">
            <h2 id="dash-table-heading" className="section-title">Recent Telemetry Samples</h2>
            <span className="section-subtitle">Latest chronological RF link measurements</span>
          </div>

          <div className="standards-reference-card">
            <div className="standards-table-wrapper">
              <table className="standards-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Signal (RSRP)</th>
                    <th>Network</th>
                    <th>Download</th>
                    <th>Upload</th>
                    <th>Latency</th>
                    <th>Quality</th>
                  </tr>
                </thead>
                <tbody>
                  {recentMeasurements.map((sample, idx) => (
                    <tr key={sample.timestamp || idx}>
                      <td className="mono-font">{formatTime(sample.timestamp)}</td>
                      <td style={{ color: sample.signalStrength >= -80 ? '#10b981' : sample.signalStrength >= -90 ? '#06b6d4' : '#f59e0b' }}>
                        {sample.signalStrength} dBm
                      </td>
                      <td><span className="cell-tech-tag tag-5g">{sample.technology || sample.networkType || '5G'}</span></td>
                      <td className="throughput-val">{sample.downloadSpeed} Mbps</td>
                      <td>{sample.uploadSpeed} Mbps</td>
                      <td className="latency-val">{sample.latency} ms</td>
                      <td><span className="quality-dot dot-good" /> {sample.quality || 'Good'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Action / Refresh Bar */}
      <div className="dashboard-action-bar">
        <div className="last-updated-text">
          <span className="pulse-indicator" aria-hidden="true" />
          <span>Last telemetry reading: </span>
          <strong>{formatTime(telemetry?.timestamp)}</strong>
        </div>

        <button
          type="button"
          className={`refresh-telemetry-btn ${loading ? 'scanning' : ''}`}
          onClick={onRefresh}
          disabled={loading}
          aria-label="Refresh telemetry snapshot"
        >
          {loading ? (
            <>
              <span className="scan-radar-icon" aria-hidden="true" />
              <span>Scanning Telemetry...</span>
            </>
          ) : (
            <>
              <span className="refresh-icon" aria-hidden="true">🔄</span>
              <span>Refresh Telemetry</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default MainDashboardView;
