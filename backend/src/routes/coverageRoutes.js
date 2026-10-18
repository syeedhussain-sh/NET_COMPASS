import { Router } from 'express';
import { getCoveragePoints } from '../controllers/coverageController.js';

const router = Router();

// GET /api/coverage/points
router.get('/points', getCoveragePoints);

export default router;
