import * as telemetryService from '../services/telemetryService.js';
import * as telemetryHistoryService from '../services/telemetryHistoryService.js';

/**
 * Controller for retrieving current network telemetry snapshot
 * GET /api/telemetry/current
 */
export const getCurrentTelemetry = (req, res, next) => {
  try {
    const data = telemetryService.getTelemetrySnapshot();
    // Record current snapshot into rolling history buffer
    telemetryHistoryService.recordTelemetry(data);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for retrieving historical telemetry trend data
 * GET /api/telemetry/history
 */
export const getTelemetryHistory = (req, res, next) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 60;
    const history = telemetryHistoryService.getTelemetryHistory(limit);

    return res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};
