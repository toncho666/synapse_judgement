import { Router } from 'express';
import { z } from 'zod';
import { analysisController } from '../controllers/analysis.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const runAnalysisSchema = z.object({
  ticker: z.string().min(1, 'Ticker is required').max(10, 'Ticker too long'),
  agents: z.array(z.string()).min(1, 'At least one agent is required'),
  portfolio: z.number().optional(),
});

router.post('/run', authMiddleware, validate(runAnalysisSchema), analysisController.runAnalysis);
router.get('/history', authMiddleware, analysisController.getHistory);
router.get('/:id', authMiddleware, analysisController.getSession);

export default router;
