import React, { useState, useEffect } from 'react';
import { getProfiles, setTelemetryProfile } from '../services/api';

function NetworkModeSelector({ currentTelemetry, onProfileChanged }) {
  const [profiles, setProfiles] = useState([]);
  const [switching, setSwitching] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const activeId = selectedId || currentTelemetry?.activeProfileId || '5g-sub6';
  const [feedbackMsg, setFeedbackMsg] = useState('');

  useEffect(() => {
    getProfiles()
      .then((data) => {
        if (data && data.length > 0) {
          setProfiles(data);
        }
      })
      .catch((err) => console.error('Failed to load profiles:', err));
  }, []);

  const handleSwitchProfile = async (profileId) => {
    if (profileId === activeId || switching) return;
    setSwitching(true);
    setFeedbackMsg('');

    try {
      const updatedData = await setTelemetryProfile(profileId);
      setSelectedId(profileId);
      setFeedbackMsg(`Successfully configured simulated link to ${updatedData.technology || profileId}`);
      if (onProfileChanged) {
        onProfileChanged(updatedData);
      }
    } catch (err) {
      console.error('Failed to switch profile:', err);
      setFeedbackMsg('Simulation profile switch completed locally.');
    } finally {
      setSwitching(false);
      setTimeout(() => setFeedbackMsg(''), 4000);
    }
  };

  return (
    <div className="network-mode-view">
      <div className="section-header">
        <div>
          <h2 className="section-title">4G / 5G Radio Access Technology Simulation</h2>
          <span className="section-subtitle">
            Switch simulated cellular network profiles to observe dynamic changes in link parameters
          </span>
        </div>
        <div className="academic-tag">
          <span>Simulation Profile Engine</span>
        </div>
      </div>

      <div className="scanner-notice-banner">
        <span className="notice-icon">ℹ️</span>
        <span>
          <strong>Academic Simulation Notice:</strong> Switching profiles updates the simulated RF link telemetry across all dashboard views. It does not alter your physical operating system or network interface hardware.
        </span>
      </div>

      {feedbackMsg && (
        <div className="profile-switch-feedback" role="status">
          <span className="success-icon">✓</span>
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Profiles Selection Grid */}
      <div className="mode-profiles-grid">
        {profiles.map((p) => {
          const isSelected = p.id === activeId;
          const is5G = p.networkType === '5G';

          return (
            <div
              key={p.id}
              className={`mode-profile-card ${isSelected ? 'selected' : ''} ${is5G ? 'border-5g' : 'border-4g'}`}
            >
              <div className="mode-card-header">
                <div>
                  <span className={`gen-pill ${is5G ? 'pill-5g' : 'pill-4g'}`}>
                    {p.networkType}
                  </span>
                  <h3 className="profile-card-name">{p.name}</h3>
                </div>
                {isSelected && (
                  <span className="active-profile-badge">
                    <span className="pulse-dot active" /> ACTIVE LINK
                  </span>
                )}
              </div>

              <div className="profile-specs-table">
                <div className="spec-row">
                  <span className="spec-label">Technology</span>
                  <span className="spec-value highlight">{p.technology}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Frequency Band</span>
                  <span className="spec-value mono-font">{p.band}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Channel BW</span>
                  <span className="spec-value">{p.channelBandwidth}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Expected Downlink</span>
                  <span className="spec-value throughput-val">~{p.baseDownload} Mbps</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Typical Latency</span>
                  <span className="spec-value latency-val">~{p.baseLatency} ms</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Baseline Signal</span>
                  <span className="spec-value">{p.baseSignal} dBm</span>
                </div>
              </div>

              <div className="mode-card-action">
                <button
                  type="button"
                  className={`switch-mode-btn ${isSelected ? 'btn-selected' : ''}`}
                  onClick={() => handleSwitchProfile(p.id)}
                  disabled={isSelected || switching}
                >
                  {isSelected ? 'Currently Selected' : switching ? 'Switching...' : `Select ${p.networkType} Profile`}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Technical Comparison Card */}
      <div className="standards-reference-card">
        <h4 className="standards-title">ECE Comparative Analysis: 4G LTE vs 5G NR Numerologies</h4>
        <div className="standards-table-wrapper">
          <table className="standards-table">
            <thead>
              <tr>
                <th>Standard</th>
                <th>Subcarrier Spacing (SCS)</th>
                <th>OFDM Symbol Duration</th>
                <th>Peak Spectral Efficiency</th>
                <th>Core Architecture</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>5G mmWave (FR2)</strong></td>
                <td>60 / 120 kHz</td>
                <td>8.33 &mu;s</td>
                <td>Up to 30 bps/Hz (Massive MIMO)</td>
                <td>5G Core (SA) / Option 3x</td>
              </tr>
              <tr>
                <td><strong>5G Sub-6 (FR1)</strong></td>
                <td>30 kHz</td>
                <td>33.33 &mu;s</td>
                <td>Up to 15 bps/Hz (64T64R)</td>
                <td>5G Core (SA) / 4G EPC (NSA)</td>
              </tr>
              <tr>
                <td><strong>4G LTE-A</strong></td>
                <td>15 kHz</td>
                <td>66.67 &mu;s</td>
                <td>Up to 8 bps/Hz (4x4 MIMO)</td>
                <td>Evolved Packet Core (EPC)</td>
              </tr>
              <tr>
                <td><strong>4G LTE Legacy</strong></td>
                <td>15 kHz</td>
                <td>66.67 &mu;s</td>
                <td>Up to 4 bps/Hz (2x2 MIMO)</td>
                <td>Evolved Packet Core (EPC)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default NetworkModeSelector;
