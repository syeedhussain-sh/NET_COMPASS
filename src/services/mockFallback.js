/**
 * Mock Fallback Provider
 * Ensures the Network Compass frontend remains fully operational, demonstrable,
 * and resilient even if the backend server is stopped or network requests time out.
 * All data is clearly flagged as simulated demo data.
 */

export const mockFallbackTelemetry = {
  connectionStatus: 'Connected',
  networkType: '5G',
  technology: '5G Sub-6',
  band: 'n78 (3.5 GHz)',
  frequency: '3500 MHz',
  channelBandwidth: '100 MHz',
  activeProfileId: '5g-sub6',
  profileName: '5G Sub-6 GHz (FR1)',
  signalStrength: -75,
  signalBars: 4,
  downloadSpeed: 242.8,
  uploadSpeed: 46.2,
  latency: 22,
  jitter: 3.1,
  packetLoss: 0.1,
  sinr: 18.5,
  rsrq: -10.2,
  cqi: 12,
  quality: 'Good',
  timestamp: new Date().toISOString(),
  isSimulated: true,
  isOfflineFallback: true,
};

export const getMockHistory = (count = 30) => {
  const now = Date.now();
  const list = [];
  for (let i = count - 1; i >= 0; i--) {
    const time = new Date(now - i * 30000).toISOString();
    const signal = Math.round(-76 + (Math.sin(i / 3) * 6));
    list.push({
      timestamp: time,
      signalStrength: signal,
      downloadSpeed: parseFloat((240 + Math.cos(i / 2) * 45).toFixed(1)),
      uploadSpeed: parseFloat((45 + Math.sin(i / 3) * 12).toFixed(1)),
      latency: Math.round(22 + (Math.sin(i / 2) * 5)),
      jitter: 3.2,
      packetLoss: 0.1,
      isSimulated: true,
    });
  }
  return list;
};

export const mockFallbackProfiles = [
  {
    id: '5g-mmwave',
    name: '5G mmWave (FR2)',
    networkType: '5G',
    technology: '5G mmWave',
    band: 'n258 (26 GHz)',
    frequency: '26000 MHz',
    channelBandwidth: '400 MHz',
    baseSignal: -69,
    baseDownload: 640,
    baseLatency: 12,
    isActive: false,
  },
  {
    id: '5g-sub6',
    name: '5G Sub-6 GHz (FR1)',
    networkType: '5G',
    technology: '5G Sub-6',
    band: 'n78 (3.5 GHz)',
    frequency: '3500 MHz',
    channelBandwidth: '100 MHz',
    baseSignal: -76,
    baseDownload: 255,
    baseLatency: 21,
    isActive: true,
  },
  {
    id: '4g-lte-a',
    name: '4G LTE-Advanced (CA)',
    networkType: '4G',
    technology: 'LTE-A',
    band: 'Band 3 + Band 40',
    frequency: '1800/2300 MHz',
    channelBandwidth: '40 MHz (2x20 CA)',
    baseSignal: -86,
    baseDownload: 88,
    baseLatency: 35,
    isActive: false,
  },
  {
    id: '4g-lte',
    name: '4G LTE Standard',
    networkType: '4G',
    technology: 'LTE',
    band: 'Band 3 (1800 MHz)',
    frequency: '1800 MHz',
    channelBandwidth: '20 MHz',
    baseSignal: -98,
    baseDownload: 36,
    baseLatency: 49,
    isActive: false,
  },
];

export const mockFallbackScan = {
  scanId: `mock-scan-${Date.now()}`,
  timestamp: new Date().toISOString(),
  cellCount: 6,
  servingCell: {
    cellId: '405-861-314-1',
    operator: 'Jio True 5G (Demo)',
    technology: '5G SA',
    band: 'n78 (3500 MHz)',
    rsrp: -74,
    rsrq: -9.5,
    sinr: 21.0,
    isServing: true,
    quality: 'Good',
  },
  cells: [
    {
      cellId: '405-861-314-1',
      operator: 'Jio True 5G',
      technology: '5G SA',
      band: 'n78 (3500 MHz)',
      frequency: '3500 MHz',
      earfcn: 632000,
      pci: 314,
      rsrp: -74,
      rsrq: -9.5,
      sinr: 21.0,
      isServing: true,
      quality: 'Good',
    },
    {
      cellId: '404-45-182-2',
      operator: 'Airtel 5G Plus',
      technology: '5G NSA',
      band: 'n78 (3500 MHz)',
      frequency: '3500 MHz',
      earfcn: 633500,
      pci: 182,
      rsrp: -81,
      rsrq: -11.0,
      sinr: 16.5,
      isServing: false,
      quality: 'Good',
    },
    {
      cellId: '405-861-402-3',
      operator: 'Jio 5G Coverage',
      technology: '5G SA',
      band: 'n28 (700 MHz)',
      frequency: '700 MHz',
      earfcn: 153000,
      pci: 402,
      rsrp: -69,
      rsrq: -8.2,
      sinr: 19.8,
      isServing: false,
      quality: 'Excellent',
    },
    {
      cellId: '404-45-96-4',
      operator: 'Airtel LTE-A',
      technology: '4G LTE-A',
      band: 'Band 3 + Band 40',
      frequency: '1800/2300 MHz',
      earfcn: 1650,
      pci: 96,
      rsrp: -86,
      rsrq: -12.4,
      sinr: 14.2,
      isServing: false,
      quality: 'Good',
    },
    {
      cellId: '404-20-210-5',
      operator: 'Vi GIGAnet LTE',
      technology: '4G LTE-A',
      band: 'Band 1 + Band 3',
      frequency: '2100 MHz',
      earfcn: 250,
      pci: 210,
      rsrp: -92,
      rsrq: -13.8,
      sinr: 10.5,
      isServing: false,
      quality: 'Fair',
    },
    {
      cellId: '404-53-58-6',
      operator: 'BSNL 4G',
      technology: '4G LTE',
      band: 'Band 1 (2100 MHz)',
      frequency: '2100 MHz',
      earfcn: 450,
      pci: 58,
      rsrp: -101,
      rsrq: -16.0,
      sinr: 6.8,
      isServing: false,
      quality: 'Poor',
    },
  ],
};

export const getMockCoveragePoints = () => {
  const points = [];
  const transmitterNodes = [
    { latOffset: 0.0, lngOffset: 0.0, type: '5G mmWave', primaryGen: '5G', baseSignal: -68 },
    { latOffset: 0.008, lngOffset: -0.007, type: '5G Sub-6', primaryGen: '5G', baseSignal: -74 },
    { latOffset: -0.007, lngOffset: 0.009, type: '5G Sub-6', primaryGen: '5G', baseSignal: -76 },
    { latOffset: 0.012, lngOffset: 0.011, type: 'LTE-A', primaryGen: '4G', baseSignal: -86 },
    { latOffset: -0.011, lngOffset: -0.012, type: 'LTE', primaryGen: '4G', baseSignal: -94 },
  ];

  for (let i = 0; i < 80; i++) {
    const cluster = transmitterNodes[i % transmitterNodes.length];
    const dLat = cluster.latOffset + ((Math.sin(i * 1.7) + Math.cos(i * 0.9)) * 0.003);
    const dLng = cluster.lngOffset + ((Math.cos(i * 1.3) + Math.sin(i * 0.5)) * 0.004);
    const signalStrength = Math.round(Math.max(-118, Math.min(-62, cluster.baseSignal - (Math.abs(dLat) + Math.abs(dLng)) * 500)));
    const is5G = cluster.primaryGen === '5G';
    const downloadSpeed = is5G ? parseFloat((260 + (Math.sin(i) * 20)).toFixed(1)) : 65.0;

    points.push({
      id: `pt-${i + 1}`,
      latitude: parseFloat((37.7749 + dLat).toFixed(6)),
      longitude: parseFloat((-122.4194 + dLng).toFixed(6)),
      signalStrength,
      signalBars: signalStrength >= -80 ? 5 : signalStrength >= -90 ? 4 : signalStrength >= -100 ? 3 : 2,
      networkType: cluster.primaryGen,
      technology: cluster.type,
      downloadSpeed,
      uploadSpeed: is5G ? 48.0 : 16.5,
      latency: is5G ? 21 : 38,
      jitter: 2.8,
      packetLoss: 0.1,
      quality: signalStrength >= -80 ? 'Excellent' : signalStrength >= -90 ? 'Good' : signalStrength >= -100 ? 'Fair' : 'Poor',
    });
  }

  return {
    center: { latitude: 37.7749, longitude: -122.4194, name: 'Innovation Tech Corridor' },
    points,
  };
};
