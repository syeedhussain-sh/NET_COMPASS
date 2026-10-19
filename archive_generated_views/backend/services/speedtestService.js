/**
 * Speed Test Service
 * Simulates network link throughput & transmission latency benchmark.
 * NOTE: Simulated demonstration speed benchmark for college ECE project.
 * Not a real hardware or ISP internet speed test.
 */

import { getActiveProfile, getTelemetrySnapshot } from './telemetryService.js';

const testHistory = [];

export const runSpeedTest = () => {
  const current = getTelemetrySnapshot();
  const profile = getActiveProfile();

  // Add realistic variation for speed test run
  const testMultiplier = 0.9 + Math.random() * 0.25; // 0.9x to 1.15x
  const downloadSpeed = parseFloat((current.downloadSpeed * testMultiplier).toFixed(1));
  const uploadSpeed = parseFloat((current.uploadSpeed * (0.92 + Math.random() * 0.2)).toFixed(1));
  const latency = Math.max(6, Math.round(current.latency * (0.95 + Math.random() * 0.15)));
  const jitter = parseFloat((current.jitter * (0.9 + Math.random() * 0.2)).toFixed(1));

  const result = {
    testId: `test-${Date.now()}`,
    timestamp: new Date().toISOString(),
    server: 'Campus ECE Core Gateway (Simulated Node 01)',
    distanceKm: 1.2,
    networkType: profile.networkType,
    technology: profile.technology,
    band: profile.band,
    downloadSpeed, // Mbps
    uploadSpeed, // Mbps
    latency, // ms
    jitter, // ms
    packetLoss: current.packetLoss,
    quality: current.quality,
    isSimulated: true,
  };

  testHistory.unshift(result);
  if (testHistory.length > 20) {
    testHistory.pop();
  }

  return result;
};

export const getSpeedTestHistory = () => {
  return testHistory;
};
