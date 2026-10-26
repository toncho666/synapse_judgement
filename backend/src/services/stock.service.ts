// Stock data service using Yahoo Finance API
// Free, no API key required, no rate limits

import { YahooFinance } from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: string;
}

interface StockData {
  quotes: StockQuote[];
  lastUpdated: string;
}

// In-memory cache (no database)
let stockCache: StockData | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 1 * 60 * 60 * 1000; // 1 hour - Yahoo Finance has no limits

// List of stocks to track
const TRACKED_SYMBOLS = [
  'AAPL', 'NVDA', 'MSFT', 'TSLA', 'AMZN', 
  'GOOGL', 'META', 'S&P 500', 'NASDAQ', 'BTC', 'ETH'
];

// Crypto symbols mapping for Yahoo Finance
const CRYPTO_SYMBOLS: Record<string, string> = {
  'BTC': 'BTC-USD',
  'ETH': 'ETH-USD'
};

// Index symbols mapping for Yahoo Finance
const INDEX_SYMBOLS: Record<string, string> = {
  'S&P 500': '^GSPC',
  'NASDAQ': '^IXIC'
};

/**
 * Fetch stock quote from Yahoo Finance
 */
async function fetchStockQuote(symbol: string): Promise<StockQuote | null> {
  try {
    // Map symbol to Yahoo Finance format
    let yahooSymbol = symbol;
    
    if (CRYPTO_SYMBOLS[symbol]) {
      yahooSymbol = CRYPTO_SYMBOLS[symbol];
    } else if (INDEX_SYMBOLS[symbol]) {
      yahooSymbol = INDEX_SYMBOLS[symbol];
    }
    
    console.log(`📊 Fetching quote for ${symbol} (${yahooSymbol}) from Yahoo Finance...`);
    
    const quote = await yahooFinance.quote(yahooSymbol);
    
    if (!quote || !quote.regularMarketPrice) {
      console.warn(`⚠️  No quote data for ${symbol}`);
      return null;
    }
    
    const result: StockQuote = {
      symbol: symbol,
      price: quote.regularMarketPrice,
      change: quote.regularMarketChange || 0,
      changePercent: quote.regularMarketChangePercent || 0,
      timestamp: new Date().toISOString()
    };
    
    console.log(`✅ ${symbol}: $${result.price.toFixed(2)} (${result.changePercent >= 0 ? '+' : ''}${result.changePercent.toFixed(2)}%)`);
    
    return result;
  } catch (error) {
    console.error(`❌ Error fetching quote for ${symbol}:`, error);
    return null;
  }
}

/**
 * Fetch all tracked stocks
 */
export async function fetchAllStocks(): Promise<StockData> {
  console.log('📊 Fetching stock data from Yahoo Finance...');
  
  const quotes: StockQuote[] = [];
  const failedSymbols: string[] = [];
  
  // Fetch all symbols sequentially
  for (const symbol of TRACKED_SYMBOLS) {
    try {
      const quote = await fetchStockQuote(symbol);
      if (quote) {
        quotes.push(quote);
      } else {
        failedSymbols.push(symbol);
        console.warn(`⚠️  No data for ${symbol}`);
      }
    } catch (error) {
      failedSymbols.push(symbol);
      console.error(`❌ Error fetching ${symbol}:`, error);
    }
    
    // Small delay to be polite to Yahoo Finance API
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  const stockData: StockData = {
    quotes,
    lastUpdated: new Date().toISOString()
  };

  // Update cache
  stockCache = stockData;
  lastFetchTime = Date.now();

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
