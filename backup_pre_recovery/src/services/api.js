/**
 * Frontend API Service
 * Centralized HTTP service for communicating with the Network Compass backend
 */

const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || 'http://localhost:5000/api';

/**
 * Checks backend health status
 * @returns {Promise<{success: boolean, message: string, timestamp?: string, uptime?: number}>}
 */
export const checkBackendHealth = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Connection timed out. Telemetry service is not responding.');
    }
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Unable to connect to the telemetry service.');
    }
    throw error;
  }
};

/**
 * Fetches the current simulated network telemetry snapshot
 * @returns {Promise<{
 *   connectionStatus: string,
 *   networkType: string,
 *   technology: string,
 *   signalStrength: number,
 *   signalBars: number,
 *   downloadSpeed: number,
 *   uploadSpeed: number,
 *   latency: number,
 *   jitter: number,
 *   packetLoss: number,
 *   quality: string,
 *   timestamp: string,
 *   isSimulated: boolean
 * }>}
 */
export const getCurrentTelemetry = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`${API_BASE_URL}/telemetry/current`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    if (!result.success || !result.data) {
      throw new Error(result.message || 'Invalid telemetry data received from server');
    }

    return result.data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Telemetry request timed out. Please check monitoring connection.');
    }
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Unable to retrieve network telemetry.');
    }
    throw error;
  }
};

/**
 * Fetches historical telemetry records for trend charts
 * @param {number} [limit=60]
 * @returns {Promise<Array<Object>>}
 */
export const getTelemetryHistory = async (limit = 60) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`${API_BASE_URL}/telemetry/history?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    if (!result.success || !Array.isArray(result.data)) {
      throw new Error(result.message || 'Invalid history data received from server');
    }

    return result.data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Telemetry history request timed out.');
    }
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Network history unavailable.');
    }
    throw error;
  }
};

/**
 * Fetches simulated geographic coverage points
 * @returns {Promise<{ center: Object, points: Array<Object> }>}
 */
export const getCoveragePoints = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`${API_BASE_URL}/coverage/points`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    if (!result.success || !Array.isArray(result.data)) {
      throw new Error(result.message || 'Invalid coverage data received from server');
    }

    return {
      center: result.center,
      points: result.data,
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Coverage data request timed out.');
    }
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Coverage data unavailable.');
    }
    throw error;
  }
};

