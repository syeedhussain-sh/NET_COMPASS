import React from 'react';
import ConnectionStatus from './ConnectionStatus';
import NetworkType from './NetworkType';
import SignalStrength from './SignalStrength';
import MetricCard from './MetricCard';

function NetworkOverview({ telemetry, loading, error, onRefresh }) {
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

  return (
    <div className="network-overview-container">
      {/* Error Notification */}
      {error && (
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

      {/* Section 1: Current Network Status */}
      <section className="dashboard-section" aria-labelledby="status-section-heading">
        <div className="section-header">
          <h2 id="status-section-heading" className="section-title">Current Network Status</h2>
          <span className="section-subtitle">Real-time link status and radio access technology</span>
        </div>

        <div className="telemetry-primary-grid">
          {/* Connection Status Card */}
          <div className="overview-card highlight-card">
            <div className="card-header-label">Connection Status</div>
            <ConnectionStatus status={telemetry?.connectionStatus || 'Connected'} />
          </div>

          {/* Network Generation & Technology */}
          <div className="overview-card highlight-card">
            <div className="card-header-label">Cellular Technology</div>
            <NetworkType
              networkType={telemetry?.networkType || '5G'}
              technology={telemetry?.technology || '5G Sub-6'}
            />
          </div>

          {/* Signal Strength & Bars */}
          <div className="overview-card highlight-card">
            <div className="card-header-label">Signal Strength</div>
            <SignalStrength
              signalStrength={telemetry?.signalStrength ?? -75}
              signalBars={telemetry?.signalBars ?? 4}
            />
          </div>

          {/* Overall Quality Rating */}
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

      {/* Section 2: Performance Metrics */}
      <section className="dashboard-section" aria-labelledby="metrics-section-heading">
        <div className="section-header">
          <h2 id="metrics-section-heading" className="section-title">Performance Metrics</h2>
          <span className="section-subtitle">Throughput, transmission latency, and link integrity</span>
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
            subtext="Drop rate percentage"
          />
        </div>
      </section>

      {/* Action and Refresh Section */}
      <div className="dashboard-action-bar">
        <div className="last-updated-text">
          <span className="pulse-indicator" aria-hidden="true" />
          <span>Last updated: </span>
          <strong>{formatTime(telemetry?.timestamp)}</strong>
        </div>

        <button
          type="button"
          className={`refresh-telemetry-btn ${loading ? 'scanning' : ''}`}
          onClick={onRefresh}
          disabled={loading}
          aria-label="Refresh and scan network telemetry"
        >
          {loading ? (
            <>
              <span className="scan-radar-icon" aria-hidden="true" />
              <span>Scanning Telemetry...</span>
            </>
          ) : (
            <>
              <span className="refresh-icon" aria-hidden="true">🔄</span>
              <span>Refresh / Scan Telemetry</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default NetworkOverview;
