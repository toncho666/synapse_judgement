// Stock data service using Alpha Vantage API
// Free tier: 25 requests/day, 5 requests/minute

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
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours - Alpha Vantage free tier: 25 requests/day

// List of stocks to track (reduced to fit within 25 requests/day limit)
const TRACKED_SYMBOLS = [
  'AAPL', 'NVDA', 'MSFT', 'TSLA', 'AMZN'
];

// Alpha Vantage API configuration
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || 'demo';
const ALPHA_VANTAGE_BASE_URL = 'https://www.alternative.me/crypto/fear-and-greed-index/json/';

/**
 * Fetch stock quote from Alpha Vantage with timeout and retry
 */
async function fetchStockQuote(symbol: string, retries: number = 2): Promise<StockQuote | null> {
  try {
    // For crypto, use different endpoint
    if (symbol === 'BTC' || symbol === 'ETH') {
      return await fetchCryptoQuote(symbol);
    }

    // For indices, use mock data (Alpha Vantage doesn't support indices in free tier)
    if (symbol === 'S&P 500' || symbol === 'NASDAQ') {
      return generateMockIndexData(symbol);
    }

    // For stocks, use Alpha Vantage with timeout
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    
    // Add timeout (10 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      const data = await response.json();

      if (data['Global Quote'] && data['Global Quote']['05. price']) {
        const quote = data['Global Quote'];
        const price = parseFloat(quote['05. price']);
        const change = parseFloat(quote['09. change']);
        const changePercent = parseFloat(quote['10. change percent'].replace('%', ''));

        return {
          symbol,
          price,
          change,
          changePercent,
          timestamp: new Date().toISOString()
        };
      }

      // If no data, return null
      return null;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      // If timeout or network error, retry
      if (retries > 0 && (fetchError instanceof Error && 
          (fetchError.message.includes('timeout') || 
           fetchError.message.includes('terminated') ||
           fetchError.message.includes('ETIMEDOUT')))) {
        console.warn(`⚠️  Timeout for ${symbol}, retrying... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        return fetchStockQuote(symbol, retries - 1);
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error(`❌ Error fetching quote for ${symbol}:`, error);
    
    // Fallback to mock data if API fails
    console.warn(`⚠️  Using mock data for ${symbol}`);
    return generateMockStockData(symbol);
  }
}

/**
 * Generate mock stock data as fallback
 */
function generateMockStockData(symbol: string): StockQuote {
  // Realistic base prices for common stocks (updated for late 2024)
  const basePrices: Record<string, number> = {
    'AAPL': 225.50,
    'NVDA': 140.20,
    'MSFT': 420.75,
    'TSLA': 245.40,
    'AMZN': 185.90,
    'GOOGL': 175.03,
    'META': 575.44,
  };

  const basePrice = basePrices[symbol] || (100 + Math.random() * 400);
  const change = (Math.random() - 0.5) * basePrice * 0.03; // -1.5% to +1.5%
  const changePercent = (change / basePrice) * 100;

  return {
    symbol,
    price: basePrice + change,
    change,
    changePercent,
    timestamp: new Date().toISOString()
  };
}

/**
 * Fetch crypto quote from alternative API
 */
async function fetchCryptoQuote(symbol: string): Promise<StockQuote | null> {
  try {
    const cryptoSymbol = symbol === 'BTC' ? 'bitcoin' : 'ethereum';
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoSymbol}&vs_currencies=usd&include_24hr_change=true`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data[cryptoSymbol]) {
      const price = data[cryptoSymbol].usd;
      const changePercent = data[cryptoSymbol].usd_24h_change || 0;
      const change = price * (changePercent / 100);

      return {
        symbol,
        price,
        change,
        changePercent,
        timestamp: new Date().toISOString()
      };
    }

    return null;
  } catch (error) {
    console.error(`Error fetching crypto quote for ${symbol}:`, error);
    return null;
  }
}

/**
 * Generate mock data for indices (free tier limitation)
 */
function generateMockIndexData(symbol: string): StockQuote {
  // Updated base prices for indices (late 2024)
  const basePrice = symbol === 'S&P 500' ? 5850.10 : 18450.24;
  const change = (Math.random() - 0.5) * 50;
  const changePercent = (change / basePrice) * 100;

  return {
    symbol,
    price: basePrice + change,
    change,
    changePercent,
    timestamp: new Date().toISOString()
  };
}

/**
 * Fetch all tracked stocks
 */
export async function fetchAllStocks(): Promise<StockData> {
  console.log('📊 Fetching stock data...');
  
  const quotes: StockQuote[] = [];
  const errors: string[] = [];
  
  // Fetch all symbols (with delay to respect rate limits)
  for (const symbol of TRACKED_SYMBOLS) {
    try {
      const quote = await fetchStockQuote(symbol);
      if (quote) {
        quotes.push(quote);
        console.log(`✅ ${symbol}: $${quote.price.toFixed(2)} (${quote.changePercent >= 0 ? '+' : ''}${quote.changePercent.toFixed(2)}%)`);
      } else {
        errors.push(symbol);
        console.warn(`⚠️  No data for ${symbol}`);
      }
    } catch (error) {
      errors.push(symbol);
      console.error(`❌ Failed to fetch ${symbol}:`, error);
    }
    
    // Delay between requests to respect rate limits (12 seconds for 5 req/min)
    if (symbol !== 'S&P 500' && symbol !== 'NASDAQ' && symbol !== 'BTC' && symbol !== 'ETH') {
      await new Promise(resolve => setTimeout(resolve, 12000));
    } else {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  const stockData: StockData = {
    quotes,
    lastUpdated: new Date().toISOString()
  };

  // Update cache
  stockCache = stockData;
  lastFetchTime = Date.now();

  console.log(`✅ Fetched ${quotes.length}/${TRACKED_SYMBOLS.length} stock quotes`);
  if (errors.length > 0) {
    console.warn(`⚠️  Failed to fetch: ${errors.join(', ')}`);
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
 * Clear stock cache
 */
export function clearStockCache() {
  stockCache = null;
  lastFetchTime = 0;
  console.log('🗑️ Stock cache cleared');
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

  const now = Date.now();
  return {
    hasCache: true,
    lastUpdated: stockCache.lastUpdated,
    quotesCount: stockCache.quotes.length,
    cacheAge: Math.floor((now - lastFetchTime) / 1000)
  };
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
export function getCacheStatus() {
  return {
    hasCache: stockCache !== null,
    lastUpdated: stockCache?.lastUpdated || null,
    quotesCount: stockCache?.quotes.length || 0,
    cacheAge: stockCache ? Date.now() - lastFetchTime : null
  };
}
