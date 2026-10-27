// Stock data service using Twelve Data API
// Free tier: 800 credits/day, 8 requests/minute.
// All quotes for tracked symbols are fetched in a SINGLE multi-symbol request,
// so the whole hourly refresh costs just 1 credit.
// (Finnhub is no longer used for prices - it was migrated to Twelve Data.)

import { fetchQuotes, type TwelveQuote as StockQuote } from './twelvedata.service.js';

interface StockData {
  quotes: StockQuote[];
  lastUpdated: string;
}

// In-memory cache (no database)
let stockCache: StockData | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 1 * 60 * 60 * 1000; // 1 hour

// List of stocks to track (Twelve Data supports all major US stocks)
const TRACKED_SYMBOLS = [
  'AAPL', 'NVDA', 'MSFT', 'TSLA', 'AMZN', 
  'GOOGL', 'META'
];

/**
 * Fetch all tracked stocks in a single multi-symbol Twelve Data request.
 */
export async function fetchAllStocks(): Promise<StockData> {
  console.log('📊 Fetching stock data from Twelve Data...');

  const quotes: StockQuote[] = await fetchQuotes(TRACKED_SYMBOLS);

  const fetchedSymbols = new Set(quotes.map((q) => q.symbol));
  const failedSymbols = TRACKED_SYMBOLS.filter((s) => !fetchedSymbols.has(s));

  const stockData: StockData = {
    quotes,
    lastUpdated: new Date().toISOString()
  };

  // Only cache non-empty results. Previously a failed fetch (e.g. unexpected API
  // response shape or quota error) was cached for a full hour, so every consumer
  // (dashboard AND analysis price lookup) kept receiving an empty quote list.
  if (quotes.length > 0) {
    stockCache = stockData;
    lastFetchTime = Date.now();
  } else {
    console.warn('⚠️  Twelve Data returned no quotes - NOT caching empty result; will retry on next request');
  }

  console.log(`✅ Fetched ${quotes.length}/${TRACKED_SYMBOLS.length} stock quotes`);
  if (failedSymbols.length > 0) {
    console.warn(`⚠️  Failed to fetch: ${failedSymbols.join(', ')}`);
  }
  
  return stockData;
}

/**
 * Get cached stock data or fetch new
 */
export async function getStockData(): Promise<StockData> {
  const now = Date.now();
  
  // Return cached data if fresh
  if (stockCache && (now - lastFetchTime) < CACHE_DURATION) {
    console.log(`📦 Returning CACHED stock data (age: ${Math.floor((now - lastFetchTime) / 1000)}s)`);
    return stockCache;
  }

  console.log(`🔄 Cache expired or empty, fetching NEW stock data...`);
  // Fetch new data
  return await fetchAllStocks();
}

/**
 * Force refresh stock data
 */
export async function refreshStockData(): Promise<StockData> {
  console.log('🔄 Force refreshing stock data...');
  return await fetchAllStocks();
}

/**
 * Start background updates
 */
export function startBackgroundUpdates() {
  console.log('🚀 Starting background stock updates (every 60 minutes)');
  
  // Initial fetch
  fetchAllStocks().catch(error => {
    console.error('❌ Initial stock fetch failed:', error);
  });

  // Update every hour
  setInterval(() => {
    fetchAllStocks().catch(error => {
      console.error('❌ Background stock fetch failed:', error);
    });
  }, CACHE_DURATION);
}

/**
 * Get cache status
 */
export function getStockCacheStatus() {
  if (!stockCache) {
    return {
      hasCache: false,
      lastUpdated: null,
      quotesCount: 0,
      cacheAge: null
    };
  }

  return {
    hasCache: true,
    lastUpdated: stockCache.lastUpdated,
    quotesCount: stockCache.quotes.length,
    cacheAge: Math.floor((Date.now() - lastFetchTime) / 1000)
  };
}

/**
 * Clear stock cache
 */
export function clearStockCache() {
  stockCache = null;
  lastFetchTime = 0;
  console.log('🗑️ Stock cache cleared');
}
