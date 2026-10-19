import React, { useState } from 'react';
import { runSpeedTest } from '../services/api';

function SpeedTestView({ currentTelemetry }) {
  const [testing, setTesting] = useState(false);
  const [stage, setStage] = useState('IDLE'); // 'IDLE' | 'PING' | 'DOWNLOAD' | 'UPLOAD' | 'DONE'
  const [currentSpeedValue, setCurrentSpeedValue] = useState(0);
  const [testResult, setTestResult] = useState(null);
  const [history, setHistory] = useState([]);

  const handleStartTest = async () => {
    setTesting(true);
    setTestResult(null);
    setCurrentSpeedValue(0);

    // 1. Stage: Ping & Jitter
    setStage('PING');
    for (let i = 0; i < 5; i++) {
      await new Promise((r) => setTimeout(r, 200));
      setCurrentSpeedValue(Math.round(15 + Math.random() * 20));
    }

    // 2. Stage: Download Throughput
    setStage('DOWNLOAD');
    const targetDownload = currentTelemetry?.downloadSpeed || 240;
    for (let step = 10; step <= targetDownload; step += targetDownload / 15) {
      await new Promise((r) => setTimeout(r, 100));
      setCurrentSpeedValue(parseFloat((step * (0.85 + Math.random() * 0.3)).toFixed(1)));
    }

    // 3. Stage: Upload Throughput
    setStage('UPLOAD');
    const targetUpload = currentTelemetry?.uploadSpeed || 48;
    for (let step = 5; step <= targetUpload; step += targetUpload / 10) {
      await new Promise((r) => setTimeout(r, 120));
      setCurrentSpeedValue(parseFloat((step * (0.85 + Math.random() * 0.3)).toFixed(1)));
    }

    // 4. Fetch final result from API
    try {
      const finalResult = await runSpeedTest();
      setTestResult(finalResult);
      setHistory((prev) => [finalResult, ...prev.slice(0, 7)]);
      setCurrentSpeedValue(finalResult.downloadSpeed);
    } catch (err) {
      console.error('Speedtest error:', err);
    } finally {
      setStage('DONE');
      setTesting(false);
    }
  };

  const getGaugeRotation = (speed) => {
    // 0 to 1000 Mbps mapped to -90deg to +90deg
    const clamped = Math.min(Math.max(speed, 0), 1000);
    return -90 + (clamped / 1000) * 180;
  };

  return (
    <div className="speedtest-view-container">
      <div className="section-header">
        <div>
          <h2 className="section-title">Speed &amp; Latency Benchmark Simulator</h2>
          <span className="section-subtitle">
            Simulated throughput rate and transmission latency test bench
          </span>
        </div>
        <div className="academic-tag">
          <span>Simulation Benchmark</span>
        </div>
      </div>

      <div className="scanner-notice-banner">
        <span className="notice-icon">ℹ️</span>
        <span>
          <strong>Simulated Test Bench Notice:</strong> Speed test results model network link performance under the active cellular profile. Generated values are for presentation and prototype validation, not real ISP internet speed measurements.
        </span>
      </div>

      {/* Main Gauge Dial Card */}
      <div className="speedtest-hero-card">
        <div className="speedtest-gauge-container">
          <div className="gauge-dial-outer">
            <div className="gauge-dial-track">
              {/* Needle Indicator */}
              <div
                className="gauge-needle"
                style={{ transform: `rotate(${getGaugeRotation(currentSpeedValue)}deg)` }}
              />
              <div className="gauge-center-cap" />
            </div>

            <div className="gauge-readout-center">
              <span className="gauge-stage-label">
                {stage === 'IDLE' && 'READY'}
                {stage === 'PING' && 'TESTING LATENCY...'}
                {stage === 'DOWNLOAD' && 'DOWNLINK TEST...'}
                {stage === 'UPLOAD' && 'UPLINK TEST...'}
                {stage === 'DONE' && 'TEST COMPLETE'}
              </span>
              <strong className="gauge-big-number">
                {currentSpeedValue}
              </strong>
              <span className="gauge-unit-label">
                {stage === 'PING' ? 'ms' : 'Mbps'}
              </span>
            </div>
          </div>

          <div className="speedtest-action-area">
            <button
              type="button"
              className={`run-speedtest-btn ${testing ? 'testing' : ''}`}
              onClick={handleStartTest}
              disabled={testing}
            >
              {testing ? (
                <>
                  <span className="scan-spinner-ring" />
                  <span>Benchmarking Link...</span>
                </>
              ) : (
                <>
                  <span className="btn-icon">⚡</span>
                  <span>{testResult ? 'Run Test Again' : 'Start Speed Test'}</span>
                </>
              )}
            </button>
            <div className="speedtest-server-tag">
              Simulated Edge Gateway: <strong>Campus Tech Node 01</strong>
            </div>
          </div>
        </div>

        {/* Live / Final Metrics Cards */}
        <div className="speedtest-metrics-panel">
          <div className="speedtest-metric-box highlight-cyan">
            <span className="box-icon">⬇️</span>
            <div className="box-data">
              <span className="box-label">Download Speed</span>
              <strong className="box-val">
                {testResult ? `${testResult.downloadSpeed} Mbps` : currentTelemetry?.downloadSpeed ? `${currentTelemetry.downloadSpeed} Mbps` : '--'}
              </strong>
              <span className="box-sub">Downlink throughput</span>
            </div>
          </div>

          <div className="speedtest-metric-box highlight-blue">
            <span className="box-icon">⬆️</span>
            <div className="box-data">
              <span className="box-label">Upload Speed</span>
              <strong className="box-val">
                {testResult ? `${testResult.uploadSpeed} Mbps` : currentTelemetry?.uploadSpeed ? `${currentTelemetry.uploadSpeed} Mbps` : '--'}
              </strong>
              <span className="box-sub">Uplink throughput</span>
            </div>
          </div>

          <div className="speedtest-metric-box highlight-emerald">
            <span className="box-icon">⏱️</span>
            <div className="box-data">
              <span className="box-label">Latency / Ping</span>
              <strong className="box-val">
                {testResult ? `${testResult.latency} ms` : currentTelemetry?.latency ? `${currentTelemetry.latency} ms` : '--'}
              </strong>
              <span className="box-sub">RTT propagation delay</span>
            </div>
          </div>

          <div className="speedtest-metric-box highlight-indigo">
            <span className="box-icon">〰️</span>
            <div className="box-data">
              <span className="box-label">Jitter</span>
              <strong className="box-val">
                {testResult ? `${testResult.jitter} ms` : currentTelemetry?.jitter ? `${currentTelemetry.jitter} ms` : '--'}
              </strong>
              <span className="box-sub">Packet delay variance</span>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Test Bench Results */}
      {history.length > 0 && (
        <div className="standards-reference-card">
          <h4 className="standards-title">Recent Test Session Runs ({history.length})</h4>
          <div className="standards-table-wrapper">
            <table className="standards-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Network Profile</th>
                  <th>Download (Mbps)</th>
                  <th>Upload (Mbps)</th>
                  <th>Latency (ms)</th>
                  <th>Jitter (ms)</th>
                  <th>Quality</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item, idx) => (
                  <tr key={item.testId || idx}>
                    <td className="mono-font">{new Date(item.timestamp).toLocaleTimeString()}</td>
                    <td><span className="cell-tech-tag tag-5g">{item.technology || '5G'}</span></td>
                    <td className="throughput-val">{item.downloadSpeed}</td>
                    <td>{item.uploadSpeed}</td>
                    <td className="latency-val">{item.latency}</td>
                    <td>{item.jitter}</td>
                    <td><span className="quality-dot dot-good" /> {item.quality}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default SpeedTestView;
