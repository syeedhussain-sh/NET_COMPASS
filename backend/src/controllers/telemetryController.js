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

/**
 * Controller for getting available simulation profiles
 * GET /api/telemetry/profiles
 */
export const getProfiles = (req, res, next) => {
  try {
    const profiles = telemetryService.getAvailableProfiles();
    return res.status(200).json({
      success: true,
      data: profiles,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for setting the active network mode profile
 * POST /api/telemetry/profile
 */
export const setTelemetryProfile = (req, res, next) => {
  try {
    const { profileId } = req.body;
    if (!profileId) {
      return res.status(400).json({
        success: false,
        message: 'profileId is required in request body',
      });
    }

    const result = telemetryService.setProfile(profileId);
    // Immediately record a new snapshot with the new profile
    const newSnapshot = telemetryService.getTelemetrySnapshot();
    telemetryHistoryService.recordTelemetry(newSnapshot);

    return res.status(200).json({
      success: true,
      message: result.message,
      data: newSnapshot,
    });
  } catch (error) {
    next(error);
  }
};
