// Yahoo Finance Service
// Free, no API key required, no rate limits

import { YahooFinance } from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

export interface YahooQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: string;
}

export interface YahooHistoricalData {
  dates: Date[];
  opens: number[];
  highs: number[];
  lows: number[];
  closes: number[];
  volumes: number[];
}

/**
 * Get current quote for a symbol
 */
export async function getQuote(symbol: string): Promise<YahooQuote | null> {
  try {
    console.log(`📊 Fetching quote for ${symbol} from Yahoo Finance...`);
    
    const quote = await yahooFinance.quote(symbol);
    
    if (!quote || !quote.regularMarketPrice) {
      console.warn(`⚠️  No quote data for ${symbol}`);
      return null;
    }
    
    const result: YahooQuote = {
      symbol: quote.symbol,
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
 * Get historical data for technical analysis
 */
export async function getHistoricalData(
  symbol: string, 
  period1: Date, 
  period2: Date,
  interval: '1d' | '1wk' | '1mo' = '1d'
): Promise<YahooHistoricalData | null> {
  try {
    console.log(`📈 Fetching historical data for ${symbol} from Yahoo Finance...`);
    console.log(`   Period: ${period1.toISOString().split('T')[0]} to ${period2.toISOString().split('T')[0]}`);
    console.log(`   Interval: ${interval}`);
    
    const queryOptions = {
      period1: period1.toISOString().split('T')[0],
      period2: period2.toISOString().split('T')[0],
      interval: interval
    };
    
    const result = await yahooFinance.historical(symbol, queryOptions);
    
    if (!result || result.length === 0) {
      console.warn(`⚠️  No historical data for ${symbol}`);
      return null;
    }
    
    const historicalData: YahooHistoricalData = {
      dates: result.map(r => r.date),
      opens: result.map(r => r.open),
      highs: result.map(r => r.high),
      lows: result.map(r => r.low),
      closes: result.map(r => r.close),
      volumes: result.map(r => r.volume)
    };
    
    console.log(`✅ Fetched ${result.length} days of historical data for ${symbol}`);
    console.log(`   Latest close: $${historicalData.closes[historicalData.closes.length - 1].toFixed(2)}`);
    
    return historicalData;
  } catch (error) {
    console.error(`❌ Error fetching historical data for ${symbol}:`, error);
    return null;
  }
}

/**
 * Get historical data for the last N days
 */
export async function getHistoricalDataForDays(
  symbol: string, 
  days: number = 250
): Promise<YahooHistoricalData | null> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return getHistoricalData(symbol, startDate, endDate, '1d');
}

/**
 * Get multiple quotes at once
 */
export async function getMultipleQuotes(symbols: string[]): Promise<YahooQuote[]> {
  console.log(`📊 Fetching quotes for ${symbols.length} symbols from Yahoo Finance...`);
  
  const quotes: YahooQuote[] = [];
  
  for (const symbol of symbols) {
    const quote = await getQuote(symbol);
    if (quote) {
      quotes.push(quote);
    }
  }
  
  console.log(`✅ Fetched ${quotes.length}/${symbols.length} quotes`);
  
  return quotes;
}
