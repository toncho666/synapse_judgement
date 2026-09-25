import { useState, useEffect } from 'react';

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

interface UseStocksResult {
  stocks: StockQuote[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  refresh: () => Promise<void>;
}

// Fallback mock data
const MOCK_STOCKS: StockQuote[] = [
  { symbol: 'AAPL', price: 232.41, change: 1.94, changePercent: 0.84, timestamp: new Date().toISOString() },
  { symbol: 'NVDA', price: 1042.10, change: 23.56, changePercent: 2.31, timestamp: new Date().toISOString() },
  { symbol: 'MSFT', price: 468.22, change: -1.65, changePercent: -0.35, timestamp: new Date().toISOString() },
  { symbol: 'TSLA', price: 244.60, change: 2.70, changePercent: 1.12, timestamp: new Date().toISOString() },
  { symbol: 'AMZN', price: 186.90, change: 0.90, changePercent: 0.48, timestamp: new Date().toISOString() },
  { symbol: 'GOOGL', price: 171.03, change: -0.38, changePercent: -0.22, timestamp: new Date().toISOString() },
  { symbol: 'META', price: 512.44, change: 9.38, changePercent: 1.87, timestamp: new Date().toISOString() },
  { symbol: 'S&P 500', price: 5472.10, change: 22.43, changePercent: 0.41, timestamp: new Date().toISOString() },
  { symbol: 'NASDAQ', price: 17862.4, change: 117.34, changePercent: 0.66, timestamp: new Date().toISOString() },
  { symbol: 'BTC', price: 64230, change: -810, changePercent: -1.24, timestamp: new Date().toISOString() },
  { symbol: 'ETH', price: 3418, change: 31.16, changePercent: 0.92, timestamp: new Date().toISOString() },
];

export function useStocks(): UseStocksResult {
  const [stocks, setStocks] = useState<StockQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchStocks = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:3001/api/stocks');
      
      if (!response.ok) {
        throw new Error('Failed to fetch stock data');
      }

      const data = await response.json();

      if (data.success && data.data.quotes.length > 0) {
        setStocks(data.data.quotes);
        setLastUpdated(data.data.lastUpdated);
      } else {
        // Fallback to mock data
        console.warn('⚠️ No stock data available, using mock data');
        setStocks(MOCK_STOCKS);
        setLastUpdated(new Date().toISOString());
      }
    } catch (err) {
      console.error('❌ Error fetching stocks:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      
      // Fallback to mock data
      console.warn('⚠️ Using mock stock data due to error');
      setStocks(MOCK_STOCKS);
      setLastUpdated(new Date().toISOString());
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/stocks/refresh', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to refresh stock data');
      }

      const data = await response.json();

      if (data.success && data.data.quotes.length > 0) {
        setStocks(data.data.quotes);
        setLastUpdated(data.data.lastUpdated);
      }
    } catch (err) {
      console.error('❌ Error refreshing stocks:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();

    // Refresh every 5 minutes
    const interval = setInterval(fetchStocks, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    stocks,
    loading,
    error,
    lastUpdated,
    refresh,
  };
}
