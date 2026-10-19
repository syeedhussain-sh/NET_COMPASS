import * as speedtestService from '../services/speedtestService.js';

export const runTest = (req, res, next) => {
  try {
    const result = speedtestService.runSpeedTest();
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getHistory = (req, res, next) => {
  try {
    const history = speedtestService.getSpeedTestHistory();
    return res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};
