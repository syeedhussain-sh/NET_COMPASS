import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

// Custom Dark Tooltip
const CustomTooltip = ({ active, payload, label, unit, labelName }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip-card">
        <div className="tooltip-time">{label}</div>
        {payload.map((entry, idx) => (
          <div key={idx} className="tooltip-row" style={{ color: entry.color || entry.stroke }}>
            <span className="tooltip-entry-name">{entry.name || labelName}:</span>
            <strong className="tooltip-entry-val">
              {entry.value} {unit}
            </strong>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

function TelemetryHistory({ historyData = [], loading, error, onRetry }) {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'signal' | 'throughput' | 'latency'

  // Format timestamp for chart X-axis
  const formatXAxis = (isoTime) => {
    if (!isoTime) return '';
    try {
      const date = new Date(isoTime);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return '';
    }
  };

  // Memoized formatted dataset with safe numeric fallbacks
  const chartData = useMemo(() => {
    if (!Array.isArray(historyData)) return [];
    return historyData.map((item, index) => ({
      index,
      timestamp: item.timestamp,
      formattedTime: formatXAxis(item.timestamp),
      signalStrength: item.signalStrength,
      downloadSpeed: item.downloadSpeed,
      uploadSpeed: item.uploadSpeed,
      latency: item.latency,
      jitter: item.jitter,
      packetLoss: item.packetLoss,
    }));
  }, [historyData]);

  return (
    <div className="telemetry-history-card">
      <div className="history-header">
        <div className="history-header-info">
          <h3 className="history-title">Network Telemetry History</h3>
          <span className="history-subtitle">
            Time-series telemetry tracking past link performance ({chartData.length} samples)
          </span>
        </div>

        {/* View Mode Filter Tabs */}
        <div className="history-tabs" role="tablist" aria-label="Metric Focus Tabs">
          <button
            type="button"
            className={`history-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Metrics
          </button>
          <button
            type="button"
            className={`history-tab-btn ${activeTab === 'signal' ? 'active' : ''}`}
            onClick={() => setActiveTab('signal')}
          >
            Signal RF
          </button>
          <button
            type="button"
            className={`history-tab-btn ${activeTab === 'throughput' ? 'active' : ''}`}
            onClick={() => setActiveTab('throughput')}
          >
            Throughput
          </button>
          <button
            type="button"
            className={`history-tab-btn ${activeTab === 'latency' ? 'active' : ''}`}
            onClick={() => setActiveTab('latency')}
          >
            Latency
          </button>
        </div>
      </div>

      {loading && chartData.length === 0 && (
        <div className="history-loading-state">
          <div className="loading-radar-spinner" aria-hidden="true" />
          <span>Loading historical telemetry...</span>
        </div>
      )}

      {error && (
        <div className="history-error-state" role="alert">
          <span>Network history unavailable.</span>
          {onRetry && (
            <button type="button" className="retry-btn" onClick={onRetry}>
              Retry
            </button>
          )}
        </div>
      )}

      {chartData.length > 0 && (
        <div className="history-charts-grid">
          {/* Chart 1: Signal Strength (dBm) */}
          {(activeTab === 'all' || activeTab === 'signal') && (
            <div className="chart-panel">
              <div className="chart-panel-header">
                <div className="chart-panel-title">
                  <span className="chart-bullet bullet-cyan" />
                  <span>Signal Strength History</span>
                </div>
                <span className="chart-panel-unit">Unit: dBm</span>
              </div>
              <div className="chart-canvas-wrapper">
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="signalGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                    <XAxis
                      dataKey="formattedTime"
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      minTickGap={35}
                    />
                    <YAxis
                      domain={[-125, -60]}
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(val) => `${val}`}
                    />
                    <Tooltip
                      content={<CustomTooltip unit="dBm" labelName="Signal" />}
                      cursor={{ stroke: 'rgba(56, 189, 248, 0.3)', strokeWidth: 1 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="signalStrength"
                      name="Signal Strength"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#signalGrad)"
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Chart 2: Throughput (Download & Upload Mbps) */}
          {(activeTab === 'all' || activeTab === 'throughput') && (
            <div className="chart-panel">
              <div className="chart-panel-header">
                <div className="chart-panel-title">
                  <span className="chart-bullet bullet-blue" />
                  <span>Throughput History</span>
                </div>
                <div className="chart-legend-pills">
                  <span className="chart-legend-pill down">Downlink</span>
                  <span className="chart-legend-pill up">Uplink</span>
                </div>
              </div>
              <div className="chart-canvas-wrapper">
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="downGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="upGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                    <XAxis
                      dataKey="formattedTime"
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      minTickGap={35}
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(val) => `${val}`}
                    />
                    <Tooltip
                      content={<CustomTooltip unit="Mbps" />}
                      cursor={{ stroke: 'rgba(59, 130, 246, 0.3)', strokeWidth: 1 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="downloadSpeed"
                      name="Download"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#downGrad)"
                      isAnimationActive={false}
                    />
                    <Area
                      type="monotone"
                      dataKey="uploadSpeed"
                      name="Upload"
                      stroke="#10b981"
                      strokeWidth={1.5}
                      strokeDasharray="4 2"
                      fillOpacity={1}
                      fill="url(#upGrad)"
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Chart 3: Latency & Packet Loss History */}
          {(activeTab === 'all' || activeTab === 'latency') && (
            <div className="chart-panel">
              <div className="chart-panel-header">
                <div className="chart-panel-title">
                  <span className="chart-bullet bullet-emerald" />
                  <span>Latency &amp; Transmission Delay</span>
                </div>
                <span className="chart-panel-unit">Unit: ms (Round-Trip)</span>
              </div>
              <div className="chart-canvas-wrapper">
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                    <XAxis
                      dataKey="formattedTime"
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      minTickGap={35}
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(val) => `${val}`}
                    />
                    <Tooltip
                      content={<CustomTooltip unit="ms" labelName="Latency" />}
                      cursor={{ stroke: 'rgba(16, 185, 129, 0.3)', strokeWidth: 1 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="latency"
                      name="Latency"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#latencyGrad)"
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TelemetryHistory;
