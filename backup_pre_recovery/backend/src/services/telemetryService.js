/**
 * Telemetry Service
 * Generates correlated, realistic simulated cellular and network measurements.
 * NOTE: This is prototype demo data for ECE network visualization, not real hardware measurements.
 */

// Internal simulation state for realistic dynamic drift
let currentProfile = {
  networkType: '5G',
  technology: '5G Sub-6',
  baseSignal: -76, // dBm
  baseDownload: 235.0, // Mbps
  baseUpload: 48.5, // Mbps
  baseLatency: 22, // ms
  baseJitter: 3.5, // ms
  basePacketLoss: 0.1, // %
};

/**
 * Derives signal bar count (1-5) from RSRP/RSSI dBm value.
 * Standard cellular threshold mapping:
 *   >= -80 dBm: 5 bars (Excellent)
 *   -90 to -81 dBm: 4 bars (Good)
 *   -100 to -91 dBm: 3 bars (Fair)
 *   -110 to -101 dBm: 2 bars (Poor)
 *   <= -111 dBm: 1 bar (Very Weak)
 */
export const calculateSignalBars = (dbm) => {
  if (dbm >= -80) return 5;
  if (dbm >= -90) return 4;
  if (dbm >= -100) return 3;
  if (dbm >= -110) return 2;
  return 1;
};

/**
 * Computes network quality category based on signal strength, latency, and packet loss.
 */
export const calculateNetworkQuality = (signalStrength, latency, packetLoss) => {
  let score = 100;

  // Signal penalty: optimal is -65 dBm, floor is -120 dBm
  const signalPenalty = Math.max(0, (-signalStrength - 65) * 1.2);
  score -= signalPenalty;

  // Latency penalty: optimal is < 20 ms
  const latencyPenalty = Math.max(0, (latency - 20) * 0.8);
  score -= latencyPenalty;

  // Packet loss penalty
  score -= packetLoss * 25;

  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Poor';
};

/**
 * Determines connection status.
 */
export const calculateConnectionStatus = (signalStrength, packetLoss) => {
  if (signalStrength <= -116 || packetLoss >= 4.0) {
    return 'Weak';
  }
  return 'Connected';
};

/**
 * Helper to clamp values
 */
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

/**
 * Generates a realistic telemetry snapshot with correlated network metrics.
 * Simulates small dynamic fluctuations on each request.
 */
export const getTelemetrySnapshot = () => {
  // Occasionally switch profiles to demonstrate 4G / 5G variation (15% chance)
  if (Math.random() < 0.15) {
    const profiles = [
      {
        networkType: '5G',
        technology: '5G Sub-6',
        baseSignal: -74,
        baseDownload: 245.0,
        baseUpload: 45.0,
        baseLatency: 21,
        baseJitter: 3.0,
        basePacketLoss: 0.1,
      },
      {
        networkType: '5G',
        technology: '5G mmWave',
        baseSignal: -69,
        baseDownload: 620.0,
        baseUpload: 88.0,
        baseLatency: 12,
        baseJitter: 1.8,
        basePacketLoss: 0.05,
      },
      {
        networkType: '4G',
        technology: 'LTE-A',
        baseSignal: -86,
        baseDownload: 82.0,
        baseUpload: 26.0,
        baseLatency: 34,
        baseJitter: 5.5,
        basePacketLoss: 0.3,
      },
      {
        networkType: '4G',
        technology: 'LTE',
        baseSignal: -98,
        baseDownload: 38.0,
        baseUpload: 12.0,
        baseLatency: 48,
        baseJitter: 8.2,
        basePacketLoss: 0.6,
      },
    ];
    currentProfile = profiles[Math.floor(Math.random() * profiles.length)];
  }

  // Generate bounded natural noise/drift around the active profile
  const signalJitter = (Math.random() * 4 - 2); // +/- 2 dBm
  const signalStrength = Math.round(clamp(currentProfile.baseSignal + signalJitter, -120, -65));

  // Signal ratio (0 = -120dBm, 1 = -65dBm) to correlate throughput
  const signalRatio = (signalStrength + 120) / 55; // 0.0 to 1.0

  // Throughput correlates with signal ratio + small random fluctuation
  const downloadFluctuation = (Math.random() * 0.1 - 0.05); // +/- 5%
  const downloadSpeed = parseFloat(
    clamp(currentProfile.baseDownload * (0.8 + 0.35 * signalRatio) * (1 + downloadFluctuation), 5, 980).toFixed(1)
  );

  const uploadFluctuation = (Math.random() * 0.1 - 0.05);
  const uploadSpeed = parseFloat(
    clamp(currentProfile.baseUpload * (0.8 + 0.35 * signalRatio) * (1 + uploadFluctuation), 1, 150).toFixed(1)
  );

  // Latency inverse correlation with signal
  const latencyDrift = (Math.random() * 4 - 2) + (1 - signalRatio) * 10;
  const latency = Math.round(clamp(currentProfile.baseLatency + latencyDrift, 8, 160));

  // Jitter
  const jitterDrift = (Math.random() * 1.5 - 0.75);
  const jitter = parseFloat(clamp(currentProfile.baseJitter + jitterDrift, 1.0, 25.0).toFixed(1));

  // Packet Loss
  const packetLossDrift = (1 - signalRatio) * 0.4 + (Math.random() * 0.1);
  const packetLoss = parseFloat(clamp(currentProfile.basePacketLoss + packetLossDrift, 0.0, 5.0).toFixed(1));

  // Derive status, bars, and quality
  const signalBars = calculateSignalBars(signalStrength);
  const quality = calculateNetworkQuality(signalStrength, latency, packetLoss);
  const connectionStatus = calculateConnectionStatus(signalStrength, packetLoss);

  return {
    connectionStatus,
    networkType: currentProfile.networkType,
    technology: currentProfile.technology,
    signalStrength,
    signalBars,
    downloadSpeed,
    uploadSpeed,
    latency,
    jitter,
    packetLoss,
    quality,
    timestamp: new Date().toISOString(),
    isSimulated: true,
  };
};
