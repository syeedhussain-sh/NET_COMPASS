import React from 'react';

function SignalMonitor({ telemetry }) {
  const signal = telemetry?.signalStrength ?? -75;
  const bars = telemetry?.signalBars ?? 4;
  const sinr = telemetry?.sinr ?? 18.2;
  const rsrq = telemetry?.rsrq ?? -10.5;
  const cqi = telemetry?.cqi ?? 12;
  const quality = telemetry?.quality ?? 'Good';

  // Calculate percentage on scale -120 dBm (0%) to -60 dBm (100%)
  const percentage = Math.max(0, Math.min(100, Math.round(((signal + 120) / 60) * 100)));

  const getSignalStatusText = (dbm) => {
    if (dbm >= -80) return { label: 'Excellent Signal', desc: 'Optimal RF reception. Highest modulation order (256-QAM) supported.', color: '#10b981' };
    if (dbm >= -90) return { label: 'Good Signal', desc: 'Stable carrier link. 64-QAM modulation with strong throughput.', color: '#06b6d4' };
    if (dbm >= -100) return { label: 'Fair Signal', desc: 'Acceptable reception. May experience occasional re-transmissions (HARQ).', color: '#f59e0b' };
    if (dbm >= -110) return { label: 'Poor Signal', desc: 'Degraded link near cell boundary. QPSK fallback modulation.', color: '#ef4444' };
    return { label: 'Very Weak / Edge', desc: 'High packet loss, critical link degradation.', color: '#dc2626' };
  };

  const statusInfo = getSignalStatusText(signal);

  return (
    <div className="signal-monitor-view">
      <div className="section-header">
        <div>
          <h2 className="section-title">RF Signal Strength &amp; Propagation Monitoring</h2>
          <span className="section-subtitle">
            Cellular link layer telemetry, RSRP/RSRQ analysis, and radio reception thresholds
          </span>
        </div>
        <div className="academic-tag">
          <span>Simulated ECE RF Telemetry</span>
        </div>
      </div>

      {/* Main Signal Meter Hero */}
      <div className="signal-hero-card">
        <div className="signal-meter-section">
          <div className="signal-dial-wrapper">
            <div className="signal-large-dbm" style={{ color: statusInfo.color }}>
              {signal} <span className="dbm-unit">dBm</span>
            </div>
            <div className="signal-status-title" style={{ color: statusInfo.color }}>
              {statusInfo.label} • {quality} Quality
            </div>
            <div className="signal-bars-graphic">
              {[1, 2, 3, 4, 5].map((bar) => {
                const active = bar <= bars;
                return (
                  <span
                    key={bar}
                    className={`meter-bar ${active ? 'active' : ''}`}
                    style={{
                      height: `${bar * 18}px`,
                      backgroundColor: active ? statusInfo.color : 'rgba(148, 163, 184, 0.2)',
                      boxShadow: active ? `0 0 10px ${statusInfo.color}` : 'none',
                    }}
                  />
                );
              })}
            </div>
          </div>

          <div className="signal-meter-details">
            <div className="signal-bar-track">
              <div
                className="signal-bar-fill"
                style={{ width: `${percentage}%`, backgroundColor: statusInfo.color }}
              />
            </div>
            <div className="signal-scale-markers">
              <span>-120 dBm (Floor)</span>
              <span>-100 dBm</span>
              <span>-80 dBm</span>
              <span>-60 dBm (Peak)</span>
            </div>
            <p className="signal-context-description">
              {statusInfo.desc}
            </p>
          </div>
        </div>
      </div>

      {/* ECE RF Engineering Parameters */}
      <h3 className="subheading-text">Radio Frequency (RF) Engineering Link Budget</h3>
      <div className="rf-parameters-grid">
        <div className="rf-card">
          <div className="rf-header">
            <span className="rf-title">RSRP (Power)</span>
            <span className="rf-badge">Primary Level</span>
          </div>
          <div className="rf-value-row">
            <strong className="rf-val" style={{ color: statusInfo.color }}>{signal}</strong>
            <span className="rf-unit">dBm</span>
          </div>
          <p className="rf-subtext">
            Reference Signal Received Power across Resource Elements (REs). Key metric for cell re-selection and handover.
          </p>
        </div>

        <div className="rf-card">
          <div className="rf-header">
            <span className="rf-title">RSRQ (Quality)</span>
            <span className="rf-badge">Interference</span>
          </div>
          <div className="rf-value-row">
            <strong className="rf-val">{rsrq}</strong>
            <span className="rf-unit">dB</span>
          </div>
          <p className="rf-subtext">
            Reference Signal Received Quality. Ratio of carrier power to total interference (N × RSRP / RSSI).
          </p>
        </div>

        <div className="rf-card">
          <div className="rf-header">
            <span className="rf-title">SINR (SNR)</span>
            <span className="rf-badge">Link Margin</span>
          </div>
          <div className="rf-value-row">
            <strong className="rf-val" style={{ color: sinr > 15 ? '#10b981' : '#f59e0b' }}>
              {sinr}
            </strong>
            <span className="rf-unit">dB</span>
          </div>
          <p className="rf-subtext">
            Signal to Interference plus Noise Ratio. Determines maximum achievable Modulation and Coding Scheme (MCS).
          </p>
        </div>

        <div className="rf-card">
          <div className="rf-header">
            <span className="rf-title">CQI (Channel)</span>
            <span className="rf-badge">AMC Index</span>
          </div>
          <div className="rf-value-row">
            <strong className="rf-val">{cqi}</strong>
            <span className="rf-unit">/ 15</span>
          </div>
          <p className="rf-subtext">
            Channel Quality Indicator fed back to the gNodeB base station to schedule downlink resource blocks.
          </p>
        </div>
      </div>

      {/* RF Standards Reference Table */}
      <div className="standards-reference-card">
        <h4 className="standards-title">3GPP Cellular RF Signal Classification Standard</h4>
        <div className="standards-table-wrapper">
          <table className="standards-table">
            <thead>
              <tr>
                <th>Quality Category</th>
                <th>RSRP Threshold</th>
                <th>RSRQ Range</th>
                <th>SINR Minimum</th>
                <th>User Experience</th>
              </tr>
            </thead>
            <tbody>
              <tr className={signal >= -80 ? 'active-row' : ''}>
                <td><span className="quality-dot dot-excellent" /> Excellent</td>
                <td>&ge; -80 dBm</td>
                <td>&gt; -10 dB</td>
                <td>&gt; 20 dB</td>
                <td>Max speed, 4K/8K UHD streaming, ultra-low latency</td>
              </tr>
              <tr className={signal < -80 && signal >= -90 ? 'active-row' : ''}>
                <td><span className="quality-dot dot-good" /> Good</td>
                <td>-90 to -81 dBm</td>
                <td>-15 to -10 dB</td>
                <td>13 to 20 dB</td>
                <td>Fast browsing, seamless HD video calling</td>
              </tr>
              <tr className={signal < -90 && signal >= -100 ? 'active-row' : ''}>
                <td><span className="quality-dot dot-fair" /> Fair</td>
                <td>-100 to -91 dBm</td>
                <td>-19 to -15 dB</td>
                <td>0 to 12 dB</td>
                <td>Standard web browsing, occasional buffering</td>
              </tr>
              <tr className={signal < -100 ? 'active-row' : ''}>
                <td><span className="quality-dot dot-poor" /> Poor / Weak</td>
                <td>&le; -101 dBm</td>
                <td>&lt; -19 dB</td>
                <td>&lt; 0 dB</td>
                <td>Call drops, audio jitter, fallback to basic voice</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SignalMonitor;
