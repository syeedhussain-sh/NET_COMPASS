/**
 * Health Service
 * Provides health and status verification for the Network Compass backend
 */
export const getHealthStatus = () => {
  return {
    success: true,
    message: 'Network Compass backend is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };
};
