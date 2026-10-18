/**
 * Telemetry Service
 * Generates correlated, realistic simulated cellular and network measurements.
 * NOTE: This is prototype demo data for ECE network visualization, not real hardware measurements.
 */

export const PROFILES = {
  '5g-mmwave': {
    id: '5g-mmwave',
    name: '5G mmWave (FR2)',
    networkType: '5G',
    technology: '5G mmWave',
    band: 'n258 (26 GHz)',
    frequency: '26000 MHz',
    channelBandwidth: '400 MHz',
    baseSignal: -69, // dBm
    baseDownload: 640.0, // Mbps
    baseUpload: 92.0, // Mbps
    baseLatency: 12, // ms
    baseJitter: 1.8, // ms
    basePacketLoss: 0.04, // %
    baseSinr: 24, // dB
    baseRsrq: -7, // dB
    cqi: 14,
  },
  '5g-sub6': {
    id: '5g-sub6',
    name: '5G Sub-6 GHz (FR1)',
    networkType: '5G',
    technology: '5G Sub-6',
    band: 'n78 (3.5 GHz)',
    frequency: '3500 MHz',
    channelBandwidth: '100 MHz',
    baseSignal: -76, // dBm
    baseDownload: 255.0, // Mbps
    baseUpload: 48.0, // Mbps
    baseLatency: 21, // ms
    baseJitter: 3.2, // ms
    basePacketLoss: 0.1, // %
    baseSinr: 18, // dB
    baseRsrq: -10, // dB
    cqi: 12,
  },
  '4g-lte-a': {
    id: '4g-lte-a',
    name: '4G LTE-Advanced (CA)',
    networkType: '4G',
    technology: 'LTE-A',
    band: 'Band 3 + Band 40',
    frequency: '1800/2300 MHz',
    channelBandwidth: '40 MHz (2x20 CA)',
    baseSignal: -86, // dBm
    baseDownload: 88.0, // Mbps
    baseUpload: 28.0, // Mbps
    baseLatency: 35, // ms
    baseJitter: 5.4, // ms
    basePacketLoss: 0.25, // %
    baseSinr: 14, // dB
    baseRsrq: -12, // dB
    cqi: 9,
  },
  '4g-lte': {
    id: '4g-lte',
    name: '4G LTE Standard',
    networkType: '4G',
    technology: 'LTE',
    band: 'Band 3 (1800 MHz)',
    frequency: '1800 MHz',
    channelBandwidth: '20 MHz',
    baseSignal: -98, // dBm
    baseDownload: 36.0, // Mbps
    baseUpload: 11.5, // Mbps
    baseLatency: 49, // ms
    baseJitter: 8.5, // ms
    basePacketLoss: 0.6, // %
    baseSinr: 8, // dB
    baseRsrq: -15, // dB
    cqi: 6,
  },
};

// Active simulation profile
let activeProfileId = '5g-sub6';
let isAutoDrift = false;

export const getAvailableProfiles = () => {
  return Object.values(PROFILES).map((p) => ({
    id: p.id,
    name: p.name,
    networkType: p.networkType,
    technology: p.technology,
    band: p.band,
    frequency: p.frequency,
    channelBandwidth: p.channelBandwidth,
    baseSignal: p.baseSignal,
    baseDownload: p.baseDownload,
    baseLatency: p.baseLatency,
    isActive: p.id === activeProfileId,
  }));
};

export const setProfile = (profileId) => {
  if (profileId === 'auto') {
    isAutoDrift = true;
    return { success: true, message: 'Auto dynamic drift enabled', activeProfileId };
  }
  if (!PROFILES[profileId]) {
    throw new Error(`Profile '${profileId}' not found. Available: ${Object.keys(PROFILES).join(', ')}`);
  }
  isAutoDrift = false;
  activeProfileId = profileId;
  return { success: true, message: `Switched profile to ${PROFILES[profileId].name}`, profile: PROFILES[profileId] };
};

export const getActiveProfile = () => PROFILES[activeProfileId];

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
  const signalPenalty = Math.max(0, (-signalStrength - 65) * 1.2);
  score -= signalPenalty;
  const latencyPenalty = Math.max(0, (latency - 20) * 0.8);
  score -= latencyPenalty;
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

const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

/**
 * Generates a realistic telemetry snapshot with correlated network metrics.
 */
export const getTelemetrySnapshot = () => {
  if (isAutoDrift && Math.random() < 0.15) {
    const keys = Object.keys(PROFILES);
    activeProfileId = keys[Math.floor(Math.random() * keys.length)];
  }

  const profile = PROFILES[activeProfileId] || PROFILES['5g-sub6'];

  // Signal noise +/- 2.5 dBm
  const signalJitter = (Math.random() * 5 - 2.5);
  const signalStrength = Math.round(clamp(profile.baseSignal + signalJitter, -120, -60));

  // Signal ratio (0 = -120 dBm, 1 = -60 dBm)
  const signalRatio = (signalStrength + 120) / 60;

  // Correlated throughput
  const dlNoise = (Math.random() * 0.1 - 0.05);
  const downloadSpeed = parseFloat(
    clamp(profile.baseDownload * (0.8 + 0.35 * signalRatio) * (1 + dlNoise), 5, 1200).toFixed(1)
  );

  const ulNoise = (Math.random() * 0.1 - 0.05);
  const uploadSpeed = parseFloat(
    clamp(profile.baseUpload * (0.8 + 0.35 * signalRatio) * (1 + ulNoise), 1, 200).toFixed(1)
  );

  // Correlated latency
  const latNoise = (Math.random() * 4 - 2) + (1 - signalRatio) * 8;
  const latency = Math.round(clamp(profile.baseLatency + latNoise, 7, 180));

  // Jitter
  const jitNoise = (Math.random() * 1.5 - 0.75);
  const jitter = parseFloat(clamp(profile.baseJitter + jitNoise, 0.8, 30.0).toFixed(1));

  // Packet Loss
  const plNoise = (1 - signalRatio) * 0.35 + (Math.random() * 0.08);
  const packetLoss = parseFloat(clamp(profile.basePacketLoss + plNoise, 0.0, 5.0).toFixed(2));

  // ECE RF Parameters
  const sinr = parseFloat((profile.baseSinr + (Math.random() * 3 - 1.5)).toFixed(1));
  const rsrq = parseFloat((profile.baseRsrq + (Math.random() * 2 - 1.0)).toFixed(1));

  const signalBars = calculateSignalBars(signalStrength);
  const quality = calculateNetworkQuality(signalStrength, latency, packetLoss);
  const connectionStatus = calculateConnectionStatus(signalStrength, packetLoss);

  return {
    connectionStatus,
    networkType: profile.networkType,
    technology: profile.technology,
    band: profile.band,
    frequency: profile.frequency,
    channelBandwidth: profile.channelBandwidth,
    activeProfileId,
    profileName: profile.name,
    signalStrength, // RSRP in dBm
    signalBars,
    downloadSpeed,
    uploadSpeed,
    latency,
    jitter,
    packetLoss,
    sinr,
    rsrq,
    cqi: profile.cqi,
    quality,
    timestamp: new Date().toISOString(),
    isSimulated: true,
  };
};
