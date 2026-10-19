import { Router } from 'express';
import { runTest, getHistory } from '../controllers/speedtestController.js';

const router = Router();

// POST /api/speedtest/run - Executes a simulated throughput benchmark
router.post('/run', runTest);

// GET /api/speedtest/history - Returns previous test records
router.get('/history', getHistory);

export default router;
