import * as coverageService from '../services/coverageService.js';

/**
 * Controller for retrieving simulated coverage points
 * GET /api/coverage/points
 */
export const getCoveragePoints = (req, res, next) => {
  try {
    const coverageData = coverageService.getCoveragePoints();
    return res.status(200).json({
      success: true,
      center: coverageData.center,
      count: coverageData.points.length,
      data: coverageData.points,
    });
  } catch (error) {
    next(error);
  }
};
