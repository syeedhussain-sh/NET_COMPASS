/**
 * Scanner Service
 * Simulates cellular radio frequency (RF) scanning across spectrum bands.
 * NOTE: Simulated demonstration dataset for ECE hackathon project. Not physical hardware measurements.
 */

const scanHistory = [];

const BASE_CELL_TEMPLATES = [
  {
    operator: 'Jio True 5G',
    plmn: '405-861',
    technology: '5G SA',
    band: 'n78',
    frequency: '3500 MHz',
    channelBandwidth: '100 MHz',
    earfcn: 632000,
    pci: 314,
    tac: '0x4A12',
    baseSignal: -72,
    baseRsrq: -9,
    baseSinr: 22,
    isServing: true,
  },
  {
    operator: 'Airtel 5G Plus',
    plmn: '404-45',
    technology: '5G NSA',
    band: 'n78',
    frequency: '3500 MHz',
    channelBandwidth: '100 MHz',
    earfcn: 633500,
    pci: 182,
    tac: '0x4A12',
    baseSignal: -79,
    baseRsrq: -11,
    baseSinr: 17,
    isServing: false,
  },
  {
    operator: 'Jio 5G Coverage',
    plmn: '405-861',
    technology: '5G SA',
    band: 'n28',
    frequency: '700 MHz',
    channelBandwidth: '20 MHz',
    earfcn: 153000,
    pci: 402,
    tac: '0x4A12',
    baseSignal: -68,
    baseRsrq: -8,
    baseSinr: 20,
    isServing: false,
  },
  {
    operator: 'Airtel LTE-A',
    plmn: '404-45',
    technology: '4G LTE-A',
    band: 'Band 3 (1800) + Band 40 (2300)',
    frequency: '1800/2300 MHz',
    channelBandwidth: '40 MHz CA',
    earfcn: 1650,
    pci: 96,
    tac: '0x3F08',
    baseSignal: -84,
    baseRsrq: -12,
    baseSinr: 15,
    isServing: false,
  },
  {
    operator: 'Vi GIGAnet LTE',
    plmn: '404-20',
    technology: '4G LTE-A',
    band: 'Band 1 (2100) + Band 3',
    frequency: '2100 MHz',
    channelBandwidth: '30 MHz CA',
    earfcn: 250,
    pci: 210,
    tac: '0x2D11',
    baseSignal: -91,
    baseRsrq: -13,
    baseSinr: 11,
    isServing: false,
  },
  {
    operator: 'BSNL 4G',
    plmn: '404-53',
    technology: '4G LTE',
    band: 'Band 1 (2100)',
    frequency: '2100 MHz',
    channelBandwidth: '10 MHz',
    earfcn: 450,
    pci: 58,
    tac: '0x1C04',
    baseSignal: -99,
    baseRsrq: -16,
    baseSinr: 7,
    isServing: false,
  },
  {
    operator: 'Metro Emergency Public Safety',
    plmn: '404-99',
    technology: 'PMR / TETRA / LTE',
    band: 'Band 14 (700 MHz)',
    frequency: '758 MHz',
    channelBandwidth: '10 MHz',
    earfcn: 5330,
    pci: 12,
    tac: '0x0001',
    baseSignal: -82,
    baseRsrq: -10,
    baseSinr: 18,
    isServing: false,
  },
];

export const performScan = () => {
  const timestamp = new Date().toISOString();
  const scanId = `scan-${Date.now()}`;

  const cells = BASE_CELL_TEMPLATES.map((tpl, idx) => {
    // Add small random noise to signal
    const jitter = Math.round((Math.random() * 6 - 3));
    const rsrp = Math.min(-60, Math.max(-120, tpl.baseSignal + jitter));
    const rsrq = parseFloat((tpl.baseRsrq + (Math.random() * 2 - 1)).toFixed(1));
    const sinr = parseFloat((tpl.baseSinr + (Math.random() * 3 - 1.5)).toFixed(1));

    return {
      cellId: `${tpl.plmn}-${tpl.pci}-${idx + 1}`,
      operator: tpl.operator,
      plmn: tpl.plmn,
      technology: tpl.technology,
      band: tpl.band,
      frequency: tpl.frequency,
      channelBandwidth: tpl.channelBandwidth,
      earfcn: tpl.earfcn,
      pci: tpl.pci,
      tac: tpl.tac,
      rsrp, // dBm
      rsrq, // dB
      sinr, // dB
      isServing: tpl.isServing,
      quality: rsrp >= -80 ? 'Excellent' : rsrp >= -90 ? 'Good' : rsrp >= -100 ? 'Fair' : 'Poor',
    };
  });

  const scanRecord = {
    scanId,
    timestamp,
    cellCount: cells.length,
    servingCell: cells.find((c) => c.isServing) || cells[0],
    cells,
    isSimulated: true,
  };

  scanHistory.unshift(scanRecord);
  if (scanHistory.length > 20) {
    scanHistory.pop();
  }

  return scanRecord;
};

export const getScanHistory = () => {
  if (scanHistory.length === 0) {
    // Generate initial baseline scan
    performScan();
  }
  return scanHistory;
};
