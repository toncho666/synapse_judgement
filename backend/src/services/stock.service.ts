// Stock data service using Finnhub API
// Free tier: 60 requests/minute

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || '';

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
const CACHE_DURATION = 1 * 60 * 60 * 1000; // 1 hour

// List of stocks to track (Finnhub supports major stocks)
const TRACKED_SYMBOLS = [
  'AAPL', 'NVDA', 'MSFT', 'TSLA', 'AMZN', 
  'GOOGL', 'META'
];

/**
 * Fetch stock quote from Finnhub API with retry logic
 */
async function fetchStockQuote(symbol: string, retries: number = 2): Promise<StockQuote | null> {
  try {
    if (!FINNHUB_API_KEY) {
      console.warn(`⚠️  Finnhub API key not configured`);
      return null;
    }
    
    console.log(`📊 Fetching quote for ${symbol} from Finnhub...`);
    
    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
    
    // Add timeout (15 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.warn(`⚠️  Finnhub API error for ${symbol}: ${response.status}`);
        return null;
      }
      
      const data = await response.json();
      
      // Finnhub returns: { c: current, d: change, dp: percent change, h: high, l: low, o: open, pc: previous close }
      if (!data || data.c === 0 || !data.c) {
        console.warn(`⚠️  No quote data for ${symbol}`);
        return null;
      }
      
      const result: StockQuote = {
        symbol: symbol,
        price: data.c, // current price
        change: data.d || 0, // change
        changePercent: data.dp || 0, // percent change
        timestamp: new Date().toISOString()
      };
      
      console.log(`✅ ${symbol}: $${result.price.toFixed(2)} (${result.changePercent >= 0 ? '+' : ''}${result.changePercent.toFixed(2)}%)`);
      
      return result;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      // If timeout or network error, retry
      if (retries > 0 && fetchError instanceof Error && 
          (fetchError.message.includes('timeout') || 
           fetchError.message.includes('Timeout') ||
           fetchError.name === 'AbortError' ||
           fetchError.message.includes('ETIMEDOUT'))) {
        console.warn(`⚠️  Timeout for ${symbol}, retrying... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        return fetchStockQuote(symbol, retries - 1);
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error(`❌ Error fetching quote for ${symbol}:`, error);
    return null;
  }
}

/**
 * Fetch all tracked stocks
 */
export async function fetchAllStocks(): Promise<StockData> {
  console.log('📊 Fetching stock data from Finnhub...');
  
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
    
    // Small delay to respect rate limits (60 requests/minute = 1 request per second)
    await new Promise(resolve => setTimeout(resolve, 200));
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
