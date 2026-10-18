/**
 * Coverage Service
 * Generates realistic simulated RF cellular coverage data points across a demonstration geographic zone.
 * NOTE: Demonstration simulated dataset for ECE network topology visualization, not physical tower telemetry.
 */

import { calculateSignalBars, calculateNetworkQuality } from './telemetryService.js';

// Central Demonstration Coordinate (Metro Tech Campus Area)
export const DEMO_CENTER = {
  latitude: 37.7749,
  longitude: -122.4194,
  name: 'Innovation Tech Corridor',
  defaultZoom: 14,
};

/**
 * Generates bounded Gaussian-like random offset
 */
const randomOffset = (spread) => {
  return (Math.random() + Math.random() + Math.random() - 1.5) * spread;
};

/**
 * Generates ~80 correlated simulated coverage points across geographic sectors.
 */
export const generateCoveragePoints = () => {
  const points = [];
  const totalPoints = 80;

  // Base cell clusters simulating transmitter towers
  const transmitterNodes = [
    { latOffset: 0.0, lngOffset: 0.0, type: '5G mmWave', primaryGen: '5G', baseSignal: -68 },
    { latOffset: 0.008, lngOffset: -0.007, type: '5G Sub-6', primaryGen: '5G', baseSignal: -74 },
    { latOffset: -0.007, lngOffset: 0.009, type: '5G Sub-6', primaryGen: '5G', baseSignal: -76 },
    { latOffset: 0.012, lngOffset: 0.011, type: 'LTE-A', primaryGen: '4G', baseSignal: -86 },
    { latOffset: -0.011, lngOffset: -0.012, type: 'LTE', primaryGen: '4G', baseSignal: -94 },
  ];

  for (let i = 0; i < totalPoints; i++) {
    // Associate with a transmitter cluster
    const cluster = transmitterNodes[i % transmitterNodes.length];

    // Distance offset from transmitter cluster
    const dLat = cluster.latOffset + randomOffset(0.006);
    const dLng = cluster.lngOffset + randomOffset(0.008);
    const distanceFactor = Math.sqrt(dLat * dLat + dLng * dLng) * 50; // 0 to ~2

    // Path loss calculation simulation
    const pathLoss = distanceFactor * 14 + (Math.random() * 8 - 4);
    const signalStrength = Math.round(Math.max(-118, Math.min(-62, cluster.baseSignal - pathLoss)));

    // Derive signal bars and quality
    const signalBars = calculateSignalBars(signalStrength);

    // Correlate throughput & latency with signal level
    const signalRatio = Math.max(0, Math.min(1, (signalStrength + 118) / 56)); // 0 (weak) to 1 (strong)

    const is5G = cluster.primaryGen === '5G';
    const baseSpeed = is5G ? (cluster.type === '5G mmWave' ? 550 : 260) : (cluster.type === 'LTE-A' ? 95 : 45);
    const downloadSpeed = parseFloat((baseSpeed * (0.3 + 0.7 * signalRatio) * (1 + (Math.random() * 0.1 - 0.05))).toFixed(1));
    const uploadSpeed = parseFloat((downloadSpeed * (0.2 + (Math.random() * 0.05))).toFixed(1));

    const latency = Math.round(Math.max(10, Math.min(130, 20 + (1 - signalRatio) * 65 + (Math.random() * 8 - 4))));
    const jitter = parseFloat((1.5 + (1 - signalRatio) * 8 + Math.random()).toFixed(1));
    const packetLoss = parseFloat(((1 - signalRatio) * 1.5 + (Math.random() * 0.2)).toFixed(1));

    const quality = calculateNetworkQuality(signalStrength, latency, packetLoss);

    // Technology classification
    let technology = cluster.type;
    let networkType = cluster.primaryGen;
    if (signalStrength < -100 && networkType === '5G') {
      technology = 'LTE';
      networkType = '4G';
    }

    points.push({
      id: `pt-${i + 1}`,
      latitude: parseFloat((DEMO_CENTER.latitude + dLat).toFixed(6)),
      longitude: parseFloat((DEMO_CENTER.longitude + dLng).toFixed(6)),
      signalStrength,
      signalBars,
      networkType,
      technology,
      quality,
      downloadSpeed,
      uploadSpeed,
      latency,
      jitter,
      packetLoss,
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 3600000)).toISOString(),
    });
  }

  return points;
};

// Cached simulation points to keep map positions consistent during sessions
let cachedCoveragePoints = null;

export const getCoveragePoints = () => {
  if (!cachedCoveragePoints) {
    cachedCoveragePoints = generateCoveragePoints();
  }
  return {
    center: DEMO_CENTER,
    points: cachedCoveragePoints,
  };
};
