import { Router, Request, Response } from 'express';
import { 
  performNewsAnalysis, 
  getNewsCacheStatus, 
  clearNewsCache 
} from '../services/news-analysis.service.js';

const router = Router();

/**
 * GET /api/news-analysis/:ticker
 * Perform news sentiment analysis on a ticker
 */
router.get('/:ticker', async (req: Request, res: Response) => {
  try {
    const raw = req.params.ticker;
    const ticker = Array.isArray(raw) ? raw[0] : raw;

    if (!ticker || ticker.length > 10 || !/^[A-Za-z.\-]{1,10}$/.test(ticker)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ticker symbol'
      });
    }

    console.log(`📰 GET /api/news-analysis/${ticker}`);

    const analysis = await performNewsAnalysis(ticker.toUpperCase());

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('❌ Error performing news analysis:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to perform news analysis'
    });
  }
});

/**
 * GET /api/news-analysis/cache/status
 * Get cache status
 */
router.get("/cache/status", (_req: Request, res: Response) => {
  try {
    const status = getNewsCacheStatus();
    
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
 * POST /api/news-analysis/cache/clear
 * Clear news analysis cache
 */
router.post("/cache/clear", (_req: Request, res: Response) => {
  try {
    clearNewsCache();
    
    res.json({
      success: true,
      message: 'News analysis cache cleared'
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
