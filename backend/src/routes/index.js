import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import telemetryRoutes from './telemetryRoutes.js';
import coverageRoutes from './coverageRoutes.js';
import scannerRoutes from './scannerRoutes.js';
import speedtestRoutes from './speedtestRoutes.js';

const router = Router();

// Mount routes
router.use('/health', healthRoutes);
router.use('/telemetry', telemetryRoutes);
router.use('/coverage', coverageRoutes);
router.use('/scanner', scannerRoutes);
router.use('/speedtest', speedtestRoutes);

export default router;
