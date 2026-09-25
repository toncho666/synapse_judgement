import { Router, Request, Response } from 'express';
import { getStockData, refreshStockData, getCacheStatus } from '../services/stock.service';

const router = Router();

/**
 * GET /api/stocks
 * Get current stock data (from cache or fetch new)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    console.log('📊 GET /api/stocks - Fetching stock data');
    
    const stockData = await getStockData();
    
    res.json({
      success: true,
      data: stockData,
      cached: Date.now() - new Date(stockData.lastUpdated).getTime() < 60 * 60 * 1000
    });
  } catch (error) {
    console.error('❌ Error fetching stock data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stock data'
    });
  }
});

/**
 * POST /api/stocks/refresh
 * Force refresh stock data
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    console.log('🔄 POST /api/stocks/refresh - Force refreshing stock data');
    
    const stockData = await refreshStockData();
    
    res.json({
      success: true,
      data: stockData,
      message: 'Stock data refreshed successfully'
    });
  } catch (error) {
    console.error('❌ Error refreshing stock data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh stock data'
    });
  }
});

/**
 * GET /api/stocks/status
 * Get cache status
 */
router.get('/status', (req: Request, res: Response) => {
  try {
    const status = getCacheStatus();
    
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

export default router;
