import React, { useState, useEffect } from 'react';
import { triggerScan, getScanHistory } from '../services/api';

function NetworkScanner() {
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStageText, setScanStageText] = useState('');
  const [currentScan, setCurrentScan] = useState(null);
  const [history, setHistory] = useState([]);
  const [filterTech, setFilterTech] = useState('ALL');
  const [error, setError] = useState(null);

  // Load past scans on mount
  useEffect(() => {
    getScanHistory()
      .then((data) => {
        if (data && data.length > 0) {
          setHistory(data);
          setCurrentScan(data[0]);
        }
      })
      .catch((err) => console.error('Failed to load scan history:', err));
  }, []);

  const handleStartScan = async () => {
    setScanning(true);
    setScanProgress(0);
    setError(null);

    const stages = [
      { pct: 20, text: 'Calibrating RF Receiver Front-End...' },
      { pct: 45, text: 'Sweeping 5G NR Band n78 (3.5 GHz)...' },
      { pct: 70, text: 'Decoding LTE Carrier Aggregation (B3 + B40)...' },
      { pct: 90, text: 'Extracting Physical Cell IDs (PCI) & RSRP levels...' },
      { pct: 100, text: 'Scan Complete.' },
    ];

    for (let i = 0; i < stages.length; i++) {
      await new Promise((r) => setTimeout(r, 400));
      setScanProgress(stages[i].pct);
      setScanStageText(stages[i].text);
    }

    try {
      const result = await triggerScan();
      setCurrentScan(result);
      setHistory((prev) => [result, ...prev.slice(0, 9)]);
    } catch (err) {
      console.error('Scan error:', err);
      setError('RF scan simulation encountered a communication timeout. Please retry.');
    } finally {
      setScanning(false);
    }
  };

  const filteredCells = (currentScan?.cells || []).filter((cell) => {
    if (filterTech === '5G') return cell.technology.includes('5G');
    if (filterTech === '4G') return cell.technology.includes('4G');
    return true;
  });

  const getQualityColor = (quality) => {
    switch (quality?.toLowerCase()) {
      case 'excellent':
        return '#10b981';
      case 'good':
        return '#06b6d4';
      case 'fair':
        return '#f59e0b';
      case 'poor':
        return '#ef4444';
      default:
        return '#94a3b8';
    }
  };

  return (
    <div className="network-scanner-container">
      {/* Header Info */}
      <div className="section-header">
        <div>
          <h2 className="section-title">Cellular RF Network Scanner</h2>
          <span className="section-subtitle">
            Simulated radio frequency discovery across sub-6 GHz and LTE frequency bands
          </span>
        </div>
        <div className="academic-tag">
          <span>ECE Demo Telemetry</span>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="scanner-notice-banner">
        <span className="notice-icon">ℹ️</span>
        <span>
          <strong>Simulated Spectrum Scanner:</strong> Displays RF cell parameters (RSRP, RSRQ, SINR, PCI) modeling cellular basestations for academic visualization.
        </span>
      </div>

      {/* Control Card */}
      <div className="scanner-control-card">
        <div className="control-left">
          <div className="scanner-status-text">
            {scanning ? (
              <span className="scanning-pulse-text">
                <span className="pulse-dot active" />
                {scanStageText} ({scanProgress}%)
              </span>
            ) : (
              <span>Ready to sweep radio spectrum. Last scan: {currentScan ? new Date(currentScan.timestamp).toLocaleTimeString() : 'Never'} ({history.length} scans on record)</span>
            )}
          </div>
          {scanning && (
            <div className="scanner-progress-bar-track">
              <div
                className="scanner-progress-bar-fill"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
          )}
        </div>

        <button
          type="button"
          className={`primary-scan-button ${scanning ? 'scanning' : ''}`}
          onClick={handleStartScan}
          disabled={scanning}
        >
          {scanning ? (
            <>
              <span className="scan-spinner-ring" />
              <span>Scanning Bands...</span>
            </>
          ) : (
            <>
              <span className="btn-icon">📡</span>
              <span>Start RF Scan</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="overview-error-banner" role="alert">
          <span>⚠️ {error}</span>
          <button type="button" className="retry-btn" onClick={handleStartScan}>
            Retry Scan
          </button>
        </div>
      )}

      {/* Serving Cell Spotlight */}
      {currentScan?.servingCell && (
        <div className="serving-cell-spotlight">
          <div className="spotlight-badge">
            <span className="pulse-dot active" /> Active Serving Cell
          </div>
          <div className="spotlight-grid">
            <div className="spotlight-item">
              <span className="spotlight-label">Operator</span>
              <strong className="spotlight-val">{currentScan.servingCell.operator}</strong>
            </div>
            <div className="spotlight-item">
              <span className="spotlight-label">Radio Tech</span>
              <strong className="spotlight-val tech-highlight">{currentScan.servingCell.technology}</strong>
            </div>
            <div className="spotlight-item">
              <span className="spotlight-label">Spectrum Band</span>
              <strong className="spotlight-val">{currentScan.servingCell.band}</strong>
            </div>
            <div className="spotlight-item">
              <span className="spotlight-label">RSRP Signal</span>
              <strong className="spotlight-val" style={{ color: getQualityColor(currentScan.servingCell.quality) }}>
                {currentScan.servingCell.rsrp} dBm
              </strong>
            </div>
            <div className="spotlight-item">
              <span className="spotlight-label">PCI / TAC</span>
              <strong className="spotlight-val mono-font">
                PCI: {currentScan.servingCell.pci || '--'} | TAC: {currentScan.servingCell.tac || '--'}
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="scanner-results-header">
        <h3 className="subheading-text">
          Discovered Cell Towers &amp; Transponders ({filteredCells.length})
        </h3>
        <div className="filter-button-group">
          <button
            type="button"
            className={`filter-btn ${filterTech === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilterTech('ALL')}
          >
            All Cells
          </button>
          <button
            type="button"
            className={`filter-btn ${filterTech === '5G' ? 'active' : ''}`}
            onClick={() => setFilterTech('5G')}
          >
            5G NR Only
          </button>
          <button
            type="button"
            className={`filter-btn ${filterTech === '4G' ? 'active' : ''}`}
            onClick={() => setFilterTech('4G')}
          >
            4G LTE Only
          </button>
        </div>
      </div>

      {/* Discovered Cells Grid / Table */}
      <div className="discovered-cells-grid">
        {filteredCells.map((cell, idx) => (
          <div
            key={cell.cellId || idx}
            className={`cell-card ${cell.isServing ? 'serving-card' : ''}`}
          >
            <div className="cell-card-header">
              <div className="cell-operator-group">
                <strong className="cell-operator">{cell.operator}</strong>
                <span className={`cell-tech-tag ${cell.technology.includes('5G') ? 'tag-5g' : 'tag-4g'}`}>
                  {cell.technology}
                </span>
              </div>
              <span
                className="cell-quality-pill"
                style={{
                  color: getQualityColor(cell.quality),
                  borderColor: getQualityColor(cell.quality),
                }}
              >
                {cell.quality}
              </span>
            </div>

            <div className="cell-specs-grid">
              <div className="spec-col">
                <span className="spec-key">RSRP (Power)</span>
                <span className="spec-val highlight-val">{cell.rsrp} dBm</span>
              </div>
              <div className="spec-col">
                <span className="spec-key">RSRQ (Quality)</span>
                <span className="spec-val">{cell.rsrq} dB</span>
              </div>
              <div className="spec-col">
                <span className="spec-key">SINR (SNR)</span>
                <span className="spec-val">{cell.sinr} dB</span>
              </div>
              <div className="spec-col">
                <span className="spec-key">Band / ARFCN</span>
                <span className="spec-val mono-font">{cell.band}</span>
              </div>
              <div className="spec-col">
                <span className="spec-key">Channel BW</span>
                <span className="spec-val">{cell.channelBandwidth || '20 MHz'}</span>
              </div>
              <div className="spec-col">
                <span className="spec-key">PCI</span>
                <span className="spec-val mono-font">{cell.pci || '--'}</span>
              </div>
            </div>

            <div className="cell-card-footer">
              <span className="cell-plmn">PLMN: {cell.plmn || '405-861'}</span>
              {cell.isServing && <span className="serving-indicator">Connected Link</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NetworkScanner;
