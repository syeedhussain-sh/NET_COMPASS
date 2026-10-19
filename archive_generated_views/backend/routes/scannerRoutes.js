import { Router } from 'express';
import { triggerScan, getHistory } from '../controllers/scannerController.js';

const router = Router();

// POST /api/scanner/scan - Triggers an RF scan
router.post('/scan', triggerScan);

// GET /api/scanner/history - Returns past scan records
router.get('/history', getHistory);

export default router;
