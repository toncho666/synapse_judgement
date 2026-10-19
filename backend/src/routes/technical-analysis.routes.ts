import { Router, Request, Response } from 'express';
import { 
  performTechnicalAnalysis, 
  getAnalysisCacheStatus, 
  clearAnalysisCache 
} from '../services/technical-analysis.service';

const router = Router();

/**
 * GET /api/technical-analysis/:ticker
 * Perform technical analysis on a ticker
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
    
    console.log(`📊 GET /api/technical-analysis/${ticker}`);
    
    const analysis = await performTechnicalAnalysis(ticker.toUpperCase());
    
    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('❌ Error performing technical analysis:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to perform technical analysis'
    });
  }
});

/**
 * GET /api/technical-analysis/cache/status
 * Get cache status
 */
router.get('/cache/status', (req: Request, res: Response) => {
  try {
    const status = getAnalysisCacheStatus();
    
    res.json({
      success: true,
      data: status
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
 * POST /api/technical-analysis/cache/clear
 * Clear analysis cache
 */
router.post('/cache/clear', (req: Request, res: Response) => {
  try {
    clearAnalysisCache();
    
    res.json({
      success: true,
      message: 'Technical analysis cache cleared'
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
