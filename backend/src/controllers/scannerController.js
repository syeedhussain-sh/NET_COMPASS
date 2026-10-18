import * as scannerService from '../services/scannerService.js';

export const triggerScan = (req, res, next) => {
  try {
    const result = scannerService.performScan();
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
    const history = scannerService.getScanHistory();
    return res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};
