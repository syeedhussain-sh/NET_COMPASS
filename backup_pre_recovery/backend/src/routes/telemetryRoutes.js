import { Router } from 'express';
import { getCurrentTelemetry, getTelemetryHistory } from '../controllers/telemetryController.js';

const router = Router();

// GET /api/telemetry/current
router.get('/current', getCurrentTelemetry);

// GET /api/telemetry/history
router.get('/history', getTelemetryHistory);

export default router;
