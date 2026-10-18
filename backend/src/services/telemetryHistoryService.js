/**
 * Telemetry History Service
 * Maintains an in-memory rolling buffer of realistic simulated telemetry records.
 * Provides historical telemetry for time-series trend analysis.
 */

import { getTelemetrySnapshot } from './telemetryService.js';

const MAX_HISTORY_RECORDS = 100;
const INITIAL_RECORDS_COUNT = 60;

// In-memory rolling history buffer
const historyBuffer = [];

/**
 * Initializes the history buffer with realistic pre-populated records
 * spaced across recent timestamps so charts have rich baseline data on startup.
 */
const initializeHistory = () => {
  const now = Date.now();
  const intervalMs = 30 * 1000; // 30 seconds interval between samples

  // Generate continuous baseline history
  for (let i = INITIAL_RECORDS_COUNT - 1; i >= 0; i--) {
    const snapshot = getTelemetrySnapshot();
    const recordTimestamp = new Date(now - i * intervalMs).toISOString();
    historyBuffer.push({
      ...snapshot,
      timestamp: recordTimestamp,
    });
  }
};

// Initialize on module load
initializeHistory();

/**
 * Appends a new telemetry snapshot to the rolling history buffer.
 * Caps storage to MAX_HISTORY_RECORDS.
 * @param {Object} snapshot - Telemetry data object
 */
export const recordTelemetry = (snapshot) => {
  if (!snapshot) return;

  historyBuffer.push({
    ...snapshot,
    timestamp: snapshot.timestamp || new Date().toISOString(),
  });

  if (historyBuffer.length > MAX_HISTORY_RECORDS) {
    historyBuffer.splice(0, historyBuffer.length - MAX_HISTORY_RECORDS);
  }
};

/**
 * Retrieves the rolling historical records.
 * @param {number} [limit=60] - Maximum number of records to return
 * @returns {Array<Object>} Historical telemetry records ordered chronologically (oldest to newest)
 */
export const getTelemetryHistory = (limit = 60) => {
  const count = Math.min(Math.max(1, limit), historyBuffer.length);
  return historyBuffer.slice(-count);
};
