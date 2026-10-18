import { Router } from 'express';
import {
  getCurrentTelemetry,
  getTelemetryHistory,
  getProfiles,
  setTelemetryProfile,
} from '../controllers/telemetryController.js';

const router = Router();

// GET /api/telemetry/current
router.get('/current', getCurrentTelemetry);

// GET /api/telemetry/history
router.get('/history', getTelemetryHistory);

// GET /api/telemetry/profiles
router.get('/profiles', getProfiles);

// POST /api/telemetry/profile
router.post('/profile', setTelemetryProfile);

export default router;
