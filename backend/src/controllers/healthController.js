import * as healthService from '../services/healthService.js';

/**
 * Controller for handling health check requests
 * GET /api/health
 */
export const checkHealth = (req, res, next) => {
  try {
    const status = healthService.getHealthStatus();
    return res.status(200).json(status);
  } catch (error) {
    next(error);
  }
};
