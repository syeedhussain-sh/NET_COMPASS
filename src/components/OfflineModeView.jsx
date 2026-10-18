import React from 'react';

function OfflineModeView({
  isOfflineSimulated,
  onToggleOffline,
  currentTelemetry,
}) {
  const cachedData = React.useMemo(() => {
    try {
      const stored = localStorage.getItem('netcompass_last_telemetry');
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          snapshot: parsed,
          time: parsed.timestamp ? new Date(parsed.timestamp).toLocaleString() : 'Recent Session',
        };
      }
    } catch {}
    return {
      snapshot: currentTelemetry,
      time: currentTelemetry?.timestamp ? new Date(currentTelemetry.timestamp).toLocaleString() : 'Recent Session',
    };
  }, [currentTelemetry]);

  const cachedSnapshot = cachedData.snapshot;
  const cachedTime = cachedData.time;

  return (
    <div className="offline-mode-view">
      <div className="section-header">
        <div>
          <h2 className="section-title">Offline Mode &amp; Local Telemetry Cache</h2>
          <span className="section-subtitle">
            Simulate disconnected field environments and verify offline data preservation
          </span>
        </div>
        <div className={`academic-tag ${isOfflineSimulated ? 'tag-offline' : ''}`}>
          <span>{isOfflineSimulated ? 'Offline Simulation Active' : 'Online Stream Active'}</span>
        </div>
      </div>

      {/* Primary Toggle Hero */}
      <div className={`offline-hero-card ${isOfflineSimulated ? 'is-offline' : 'is-online'}`}>
        <div className="offline-hero-info">
          <div className="offline-status-indicator">
            <span className={`offline-pulse ${isOfflineSimulated ? 'pulse-orange' : 'pulse-green'}`} />
            <h3 className="offline-title">
              {isOfflineSimulated
                ? 'Operating in Simulated Offline Mode'
                : 'Connected to Live Telemetry Monitoring Stream'}
            </h3>
          </div>
          <p className="offline-desc">
            {isOfflineSimulated
              ? 'Real-time telemetry requests are paused. The dashboard is serving cached link layer parameters preserved prior to link loss.'
              : 'Live telemetry updates are streaming from the backend. Toggling offline simulation models signal obstruction or dead-zone field tests.'}
          </p>
        </div>

        <div className="offline-action-box">
          <button
            type="button"
            className={`toggle-offline-btn ${isOfflineSimulated ? 'btn-restore' : 'btn-disconnect'}`}
            onClick={onToggleOffline}
          >
            {isOfflineSimulated ? (
              <>
                <span className="btn-icon">📶</span>
                <span>Restore Online Telemetry Stream</span>
              </>
            ) : (
              <>
                <span className="btn-icon">📴</span>
                <span>Simulate Offline Disconnection</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Cached Data Inspection Panel */}
      <div className="cached-data-panel">
        <div className="cached-panel-header">
          <div className="cached-header-text">
            <h4>Preserved Telemetry Snapshot in Local Storage</h4>
            <span className="cached-timestamp">Last snapshot saved: <strong>{cachedTime || 'Just now'}</strong></span>
          </div>
          <span className="cached-pill">CACHED MEMORY</span>
        </div>

        {cachedSnapshot ? (
          <div className="cached-metrics-grid">
            <div className="cached-metric-item">
              <span className="cached-label">Network Mode</span>
              <strong className="cached-value">{cachedSnapshot.networkType || '5G'} ({cachedSnapshot.technology || 'Sub-6'})</strong>
              <span className="cached-badge-sub">CACHED</span>
            </div>

            <div className="cached-metric-item">
              <span className="cached-label">Signal Level (RSRP)</span>
              <strong className="cached-value">{cachedSnapshot.signalStrength ?? -75} dBm</strong>
              <span className="cached-badge-sub">CACHED</span>
            </div>

            <div className="cached-metric-item">
              <span className="cached-label">Last Download Speed</span>
              <strong className="cached-value">{cachedSnapshot.downloadSpeed ?? 240} Mbps</strong>
              <span className="cached-badge-sub">CACHED</span>
            </div>

            <div className="cached-metric-item">
              <span className="cached-label">Last Upload Speed</span>
              <strong className="cached-value">{cachedSnapshot.uploadSpeed ?? 45} Mbps</strong>
              <span className="cached-badge-sub">CACHED</span>
            </div>

            <div className="cached-metric-item">
              <span className="cached-label">Link Latency</span>
              <strong className="cached-value">{cachedSnapshot.latency ?? 22} ms</strong>
              <span className="cached-badge-sub">CACHED</span>
            </div>

            <div className="cached-metric-item">
              <span className="cached-label">Calculated Quality</span>
              <strong className="cached-value">{cachedSnapshot.quality || 'Good'}</strong>
              <span className="cached-badge-sub">CACHED</span>
            </div>
          </div>
        ) : (
          <div className="empty-cache-notice">
            <span>No previous telemetry record in cache yet. Refresh dashboard once while online.</span>
          </div>
        )}
      </div>

      {/* ECE Field Use Case Reference */}
      <div className="standards-reference-card">
        <h4 className="standards-title">ECE Field Engineering: Disconnected Mode Resilience</h4>
        <p className="standards-subtext">
          In rural RF surveys, underground tunnels, or emergency disaster response, cellular base stations may be unavailable.
          Network Compass incorporates local browser caching (Web Storage / Cache API) to preserve the most recent RF link survey,
          allowing telecommunications engineers to record measurements offline and sync telemetry once back in coverage.
        </p>
      </div>
    </div>
  );
}

export default OfflineModeView;
