import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import telemetryRoutes from './telemetryRoutes.js';
import coverageRoutes from './coverageRoutes.js';

const router = Router();

// Mount routes
router.use('/health', healthRoutes);
router.use('/telemetry', telemetryRoutes);
router.use('/coverage', coverageRoutes);

export default router;
