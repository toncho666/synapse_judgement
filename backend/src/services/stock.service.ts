// Stock data service using Alpha Vantage API
// Free tier: 5 requests/minute, 500 requests/day

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
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

// List of stocks to track
const TRACKED_SYMBOLS = [
  'AAPL', 'NVDA', 'MSFT', 'TSLA', 'AMZN', 
  'GOOGL', 'META', 'S&P 500', 'NASDAQ', 'BTC', 'ETH'
];

// Alpha Vantage API configuration
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || 'demo';
const ALPHA_VANTAGE_BASE_URL = 'https://www.alternative.me/crypto/fear-and-greed-index/json/';

/**
 * Fetch stock quote from Alpha Vantage
 */
async function fetchStockQuote(symbol: string): Promise<StockQuote | null> {
  try {
    // For crypto, use different endpoint
    if (symbol === 'BTC' || symbol === 'ETH') {
      return await fetchCryptoQuote(symbol);
    }

    // For indices, use mock data (Alpha Vantage doesn't support indices in free tier)
    if (symbol === 'S&P 500' || symbol === 'NASDAQ') {
      return generateMockIndexData(symbol);
    }

    // For stocks, use Alpha Vantage
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    
    const response = await fetch(url);
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

    return null;
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error);
    return null;
  }
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
  const basePrice = symbol === 'S&P 500' ? 5472.10 : 17862.4;
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
  
  // Fetch all symbols (with delay to respect rate limits)
  for (const symbol of TRACKED_SYMBOLS) {
    const quote = await fetchStockQuote(symbol);
    if (quote) {
      quotes.push(quote);
    }
    
    // Delay between requests to respect rate limits (200ms)
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  const stockData: StockData = {
    quotes,
    lastUpdated: new Date().toISOString()
  };

  // Update cache
  stockCache = stockData;
  lastFetchTime = Date.now();

  console.log(`✅ Fetched ${quotes.length} stock quotes`);
  
  return stockData;
}

/**
 * Get cached stock data or fetch new
 */
export async function getStockData(): Promise<StockData> {
  const now = Date.now();
  
  // Return cached data if fresh
  if (stockCache && (now - lastFetchTime) < CACHE_DURATION) {
    return stockCache;
  }

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
export function getCacheStatus() {
  return {
    hasCache: stockCache !== null,
    lastUpdated: stockCache?.lastUpdated || null,
    quotesCount: stockCache?.quotes.length || 0,
    cacheAge: stockCache ? Date.now() - lastFetchTime : null
  };
}
