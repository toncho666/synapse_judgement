import { Router, Request, Response } from 'express';
import { 
  performEarningsCallAnalysis, 
  getEarningsCacheStatus, 
  clearEarningsCache 
} from '../services/earnings-call.service.js';

const router = Router();

/**
 * GET /api/earnings-call/:ticker
 * Perform earnings call analysis on a ticker
 */
router.get('/:ticker', async (req: Request, res: Response) => {
  try {
    const { ticker } = req.params;
    
    if (!ticker || ticker.length > 10) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ticker symbol'
      });
    }
    
    console.log(`📞 GET /api/earnings-call/${ticker}`);
    
    const analysis = await performEarningsCallAnalysis(ticker.toUpperCase());
    
    res.json({
      success: true,
       analysis
    });
  } catch (error) {
    console.error('❌ Error performing earnings call analysis:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to perform earnings call analysis'
    });
  }
});

/**
 * GET /api/earnings-call/cache/status
 * Get cache status
 */
router.get('/cache/status', (req: Request, res: Response) => {
  try {
    const status = getEarningsCacheStatus();
    
    res.json({
      success: true,
       status
    });
  } catch (error) {
    console.error('❌ Error getting cache status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get cache status'
    });
  }
});

/**
 * POST /api/earnings-call/cache/clear
 * Clear earnings call analysis cache
 */
router.post('/cache/clear', (req: Request, res: Response) => {
  try {
    clearEarningsCache();
    
    res.json({
      success: true,
      message: 'Earnings call analysis cache cleared'
    });
  } catch (error) {
    console.error('❌ Error clearing cache:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear cache'
    });
  }
});

export default router;
