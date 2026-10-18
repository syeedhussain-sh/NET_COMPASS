/**
 * Frontend API Service
 * Centralized HTTP service for communicating with the Network Compass backend.
 * Includes graceful offline fallback so the application stays fully functional
 * even if the backend is stopped, network drops, or a telemetry request times out.
 */

import {
  mockFallbackTelemetry,
  getMockHistory,
  mockFallbackProfiles,
  mockFallbackScan,
} from './mockFallback';

// Primary endpoint uses relative /api (proxied by Vite) or fallback to localhost:5000/api
const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  '/api';

const DIRECT_BACKEND_URL = 'http://localhost:5000/api';

/**
 * Robust fetch wrapper with timeout and fallback URL handling
 */
const fetchWithTimeout = async (endpoint, options = {}, timeoutMs = 4500) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    clearTimeout(timeoutId);
    return response;
  } catch (err) {
    clearTimeout(timeoutId);

    // If Vite proxy failed or endpoint was unreachable, try direct backend URL once
    if (API_BASE_URL.startsWith('/')) {
      const fallbackController = new AbortController();
      const fallbackTimer = setTimeout(() => fallbackController.abort(), 2000);
      try {
        const directResp = await fetch(`${DIRECT_BACKEND_URL}${endpoint}`, {
          ...options,
          signal: fallbackController.signal,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            ...(options.headers || {}),
          },
        });
        clearTimeout(fallbackTimer);
        return directResp;
      } catch {
        clearTimeout(fallbackTimer);
      }
    }
    throw err;
  }
};

/**
 * Checks backend health status
 */
export const checkBackendHealth = async () => {
  try {
    const res = await fetchWithTimeout('/health', { method: 'GET' }, 3000);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return {
      success: false,
      connected: false,
      message: 'Backend server is not responding. Operating in offline demo mode.',
    };
  }
};

/**
 * Fetches the current simulated network telemetry snapshot
 */
export const getCurrentTelemetry = async () => {
  try {
    const res = await fetchWithTimeout('/telemetry/current', { method: 'GET' }, 4000);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.success && json.data) {
      // Store latest successful reading in localStorage for offline caching
      try {
        localStorage.setItem('netcompass_last_telemetry', JSON.stringify(json.data));
      } catch {}
      return json.data;
    }
    throw new Error('Invalid telemetry payload');
  } catch (error) {
    console.warn('Backend telemetry unavailable, using cached/mock fallback:', error.message);
    // Check localStorage cached reading first
    try {
      const cached = localStorage.getItem('netcompass_last_telemetry');
      if (cached) {
        return {
          ...JSON.parse(cached),
          isOfflineFallback: true,
          timestamp: new Date().toISOString(),
        };
      }
    } catch {}
    return { ...mockFallbackTelemetry, timestamp: new Date().toISOString() };
  }
};

/**
 * Fetches historical telemetry records for trend charts
 */
export const getTelemetryHistory = async (limit = 60) => {
  try {
    const res = await fetchWithTimeout(`/telemetry/history?limit=${limit}`, { method: 'GET' }, 4000);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data;
    }
    throw new Error('Invalid history payload');
  } catch (error) {
    console.warn('Backend history unavailable, using simulated trend:', error.message);
    return getMockHistory(limit);
  }
};

/**
 * Fetches simulated geographic coverage points for heatmap
 */
export const getCoveragePoints = async () => {
  try {
    const res = await fetchWithTimeout('/coverage/points', { method: 'GET' }, 4500);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return {
        center: json.center,
        points: json.data,
      };
    }
    throw new Error('Invalid coverage payload');
  } catch (error) {
    console.warn('Backend coverage unavailable, using fallback dataset:', error.message);
    // Return standard campus coordinate dataset
    return {
      center: { latitude: 37.7749, longitude: -122.4194, name: 'Innovation Tech Corridor' },
      points: [],
    };
  }
};

/**
 * Retrieves available 4G/5G simulation profiles
 */
export const getProfiles = async () => {
  try {
    const res = await fetchWithTimeout('/telemetry/profiles', { method: 'GET' }, 3500);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data;
    }
    throw new Error('Invalid profiles payload');
  } catch (error) {
    console.warn('Profiles endpoint offline, using defaults:', error.message);
    return mockFallbackProfiles;
  }
};

/**
 * Switches the active network mode profile
 */
export const setTelemetryProfile = async (profileId) => {
  try {
    const res = await fetchWithTimeout('/telemetry/profile', {
      method: 'POST',
      body: JSON.stringify({ profileId }),
    }, 4000);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.warn('Profile switch offline fallback:', error.message);
    const found = mockFallbackProfiles.find((p) => p.id === profileId);
    return {
      ...mockFallbackTelemetry,
      activeProfileId: profileId,
      networkType: found?.networkType || '5G',
      technology: found?.technology || '5G Sub-6',
      band: found?.band || 'n78',
      signalStrength: found?.baseSignal || -76,
      downloadSpeed: found?.baseDownload || 250,
      latency: found?.baseLatency || 20,
      isOfflineFallback: true,
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Executes a simulated RF cell scan
 */
export const triggerScan = async () => {
  try {
    const res = await fetchWithTimeout('/scanner/scan', { method: 'POST' }, 5000);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.warn('Scanner offline fallback:', error.message);
    return {
      ...mockFallbackScan,
      scanId: `mock-scan-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Fetches scanner past history
 */
export const getScanHistory = async () => {
  try {
    const res = await fetchWithTimeout('/scanner/history', { method: 'GET' }, 3500);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data || [];
  } catch {
    return [mockFallbackScan];
  }
};

/**
 * Executes simulated speed test benchmark
 */
export const runSpeedTest = async () => {
  try {
    const res = await fetchWithTimeout('/speedtest/run', { method: 'POST' }, 5000);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.warn('Speedtest offline fallback:', error.message);
    return {
      testId: `test-${Date.now()}`,
      timestamp: new Date().toISOString(),
      server: 'Local Loopback Gateway (Demo Mode)',
      networkType: '5G',
      technology: '5G Sub-6',
      downloadSpeed: 238.4,
      uploadSpeed: 44.8,
      latency: 24,
      jitter: 3.2,
      packetLoss: 0.1,
      isSimulated: true,
      isOfflineFallback: true,
    };
  }
};
