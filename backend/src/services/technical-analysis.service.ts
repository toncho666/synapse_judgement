// Technical Analysis Service
// Calculates technical indicators and generates trading signals

import { getStockData } from './stock.service';

// ============ TYPES ============

export interface TechnicalIndicators {
  // Trend indicators
  sma20: number | null;
  sma50: number | null;
  sma200: number | null;
  ema12: number | null;
  ema26: number | null;
  
  // Momentum indicators
  rsi14: number | null;
  macd: { macd: number; signal: number; histogram: number } | null;
  stochastic: { k: number; d: number } | null;
  adx: number | null;
  
  // Volatility indicators
  bollingerBands: { upper: number; middle: number; lower: number } | null;
  atr14: number | null;
  
  // Volume indicators
  obv: number | null;
  obvChange: number | null;
}

export interface TechnicalSignal {
  type: 'bull' | 'bear' | 'flat';
  strength: number; // 0-100
  reasons: string[];
}

export interface TechnicalAnalysis {
  ticker: string;
  timestamp: string;
  currentPrice: number;
  indicators: TechnicalIndicators;
  signals: {
    trend: TechnicalSignal;
    momentum: TechnicalSignal;
    volatility: TechnicalSignal;
    volume: TechnicalSignal;
    overall: TechnicalSignal;
  };
  support: number | null;
  resistance: number | null;
  recommendation: 'BUY' | 'HOLD' | 'SELL';
  confidence: number;
}

// ============ CACHE ============

interface AnalysisCache {
  [ticker: string]: {
    data: TechnicalAnalysis;
    timestamp: number;
  };
}

const analysisCache: AnalysisCache = {};
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// ============ HELPER FUNCTIONS ============

/**
 * Calculate Simple Moving Average
 */
function calculateSMA(prices: number[], period: number): number | null {
  if (prices.length < period) return null;
  const slice = prices.slice(-period);
  return slice.reduce((sum, price) => sum + price, 0) / period;
}

/**
 * Calculate Exponential Moving Average
 */
function calculateEMA(prices: number[], period: number): number | null {
  if (prices.length < period) return null;
  
  const multiplier = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((sum, price) => sum + price, 0) / period;
  
  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema;
  }
  
  return ema;
}

/**
 * Calculate Relative Strength Index (RSI)
 */
function calculateRSI(prices: number[], period: number = 14): number | null {
  if (prices.length < period + 1) return null;
  
  let gains = 0;
  let losses = 0;
  
  // Initial average gain/loss
  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains += change;
    else losses -= change;
  }
  
  let avgGain = gains / period;
  let avgLoss = losses / period;
  
  // Smoothed averages
  for (let i = period + 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? -change : 0;
    
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }
  
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

/**
 * Calculate MACD
 */
function calculateMACD(prices: number[]): { macd: number; signal: number; histogram: number } | null {
  if (prices.length < 35) return null; // Need at least 26 + 9
  
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  
  if (ema12 === null || ema26 === null) return null;
  
  const macd = ema12 - ema26;
  
  // Calculate signal line (9-period EMA of MACD)
  const macdHistory: number[] = [];
  for (let i = 26; i <= prices.length; i++) {
    const e12 = calculateEMA(prices.slice(0, i), 12);
    const e26 = calculateEMA(prices.slice(0, i), 26);
    if (e12 !== null && e26 !== null) {
      macdHistory.push(e12 - e26);
    }
  }
  
  const signal = calculateEMA(macdHistory, 9);
  if (signal === null) return null;
  
  return {
    macd,
    signal,
    histogram: macd - signal,
  };
}

/**
 * Calculate Bollinger Bands
 */
function calculateBollingerBands(prices: number[], period: number = 20, stdDev: number = 2) {
  if (prices.length < period) return null;
  
  const slice = prices.slice(-period);
  const middle = slice.reduce((sum, p) => sum + p, 0) / period;
  
  const variance = slice.reduce((sum, p) => sum + Math.pow(p - middle, 2), 0) / period;
  const std = Math.sqrt(variance);
  
  return {
    upper: middle + (stdDev * std),
    middle,
    lower: middle - (stdDev * std),
  };
}

/**
 * Calculate Average True Range (ATR)
 */
function calculateATR(highs: number[], lows: number[], closes: number[], period: number = 14): number | null {
  if (closes.length < period + 1) return null;
  
  const trueRanges: number[] = [];
  
  for (let i = 1; i < closes.length; i++) {
    const tr = Math.max(
      highs[i] - lows[i],
      Math.abs(highs[i] - closes[i - 1]),
      Math.abs(lows[i] - closes[i - 1])
    );
    trueRanges.push(tr);
  }
  
  if (trueRanges.length < period) return null;
  
  let atr = trueRanges.slice(0, period).reduce((sum, tr) => sum + tr, 0) / period;
  
  for (let i = period; i < trueRanges.length; i++) {
    atr = (atr * (period - 1) + trueRanges[i]) / period;
  }
  
  return atr;
}

/**
 * Calculate On-Balance Volume (OBV)
 */
function calculateOBV(closes: number[], volumes: number[]): { obv: number; change: number } | null {
  if (closes.length < 2 || volumes.length < 2) return null;
  
  let obv = volumes[0];
  const obvHistory = [obv];
  
  for (let i = 1; i < closes.length; i++) {
    if (closes[i] > closes[i - 1]) {
      obv += volumes[i];
    } else if (closes[i] < closes[i - 1]) {
      obv -= volumes[i];
    }
    obvHistory.push(obv);
  }
  
  const obvChange = obvHistory.length >= 2 
    ? ((obv - obvHistory[obvHistory.length - 2]) / obvHistory[obvHistory.length - 2]) * 100
    : 0;
  
  return { obv, change: obvChange };
}

/**
 * Calculate Stochastic Oscillator
 */
function calculateStochastic(highs: number[], lows: number[], closes: number[], period: number = 14): { k: number; d: number } | null {
  if (closes.length < period) return null;
  
  const recentHighs = highs.slice(-period);
  const recentLows = lows.slice(-period);
  
  const highestHigh = Math.max(...recentHighs);
  const lowestLow = Math.min(...recentLows);
  const currentClose = closes[closes.length - 1];
  
  if (highestHigh === lowestLow) return { k: 50, d: 50 };
  
  const k = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
  
  // %D is 3-period SMA of %K (simplified)
  const d = k; // Simplified for demo
  
  return { k, d };
}

/**
 * Calculate ADX (Average Directional Index)
 */
function calculateADX(highs: number[], lows: number[], closes: number[], period: number = 14): number | null {
  if (closes.length < period * 2) return null;
  
  // Simplified ADX calculation
  let plusDM = 0;
  let minusDM = 0;
  let tr = 0;
  
  for (let i = 1; i <= period; i++) {
    const upMove = highs[i] - highs[i - 1];
    const downMove = lows[i - 1] - lows[i];
    
    if (upMove > downMove && upMove > 0) plusDM += upMove;
    if (downMove > upMove && downMove > 0) minusDM += downMove;
    
    tr += Math.max(
      highs[i] - lows[i],
      Math.abs(highs[i] - closes[i - 1]),
      Math.abs(lows[i] - closes[i - 1])
    );
  }
  
  if (tr === 0) return null;
  
  const plusDI = (plusDM / tr) * 100;
  const minusDI = (minusDM / tr) * 100;
  
  const dx = Math.abs(plusDI - minusDI) / (plusDI + minusDI) * 100;
  
  return dx;
}

/**
 * Find support and resistance levels
 */
function findSupportResistance(highs: number[], lows: number[], closes: number[]) {
  if (closes.length < 20) return { support: null, resistance: null };
  
  const recentLows = lows.slice(-20);
  const recentHighs = highs.slice(-20);
  
  const support = Math.min(...recentLows);
  const resistance = Math.max(...recentHighs);
  
  return { support, resistance };
}

// ============ SIGNAL GENERATION ============

function generateTrendSignal(price: number, indicators: TechnicalIndicators): TechnicalSignal {
  const reasons: string[] = [];
  let bullPoints = 0;
  let bearPoints = 0;
  
  // Price vs SMA200
  if (indicators.sma200 !== null) {
    if (price > indicators.sma200) {
      bullPoints += 2;
      reasons.push('Price above 200-day SMA (long-term uptrend)');
    } else {
      bearPoints += 2;
      reasons.push('Price below 200-day SMA (long-term downtrend)');
    }
  }
  
  // Price vs SMA50
  if (indicators.sma50 !== null) {
    if (price > indicators.sma50) {
      bullPoints += 1;
      reasons.push('Price above 50-day SMA (medium-term uptrend)');
    } else {
      bearPoints += 1;
      reasons.push('Price below 50-day SMA (medium-term downtrend)');
    }
  }
  
  // SMA20 vs SMA50 (Golden/Death Cross)
  if (indicators.sma20 !== null && indicators.sma50 !== null) {
    if (indicators.sma20 > indicators.sma50) {
      bullPoints += 1;
      reasons.push('SMA20 above SMA50 (bullish alignment)');
    } else {
      bearPoints += 1;
      reasons.push('SMA20 below SMA50 (bearish alignment)');
    }
  }
  
  // EMA12 vs EMA26
  if (indicators.ema12 !== null && indicators.ema26 !== null) {
    if (indicators.ema12 > indicators.ema26) {
      bullPoints += 1;
      reasons.push('EMA12 above EMA26 (short-term bullish)');
    } else {
      bearPoints += 1;
      reasons.push('EMA12 below EMA26 (short-term bearish)');
    }
  }
  
  const totalPoints = bullPoints + bearPoints;
  const strength = totalPoints > 0 ? Math.max(bullPoints, bearPoints) / totalPoints * 100 : 50;
  
  if (bullPoints > bearPoints + 1) {
    return { type: 'bull', strength, reasons };
  } else if (bearPoints > bullPoints + 1) {
    return { type: 'bear', strength, reasons };
  } else {
    return { type: 'flat', strength: 50, reasons: ['Mixed trend signals'] };
  }
}

function generateMomentumSignal(indicators: TechnicalIndicators): TechnicalSignal {
  const reasons: string[] = [];
  let bullPoints = 0;
  let bearPoints = 0;
  
  // RSI
  if (indicators.rsi14 !== null) {
    if (indicators.rsi14 > 70) {
      bearPoints += 2;
      reasons.push(`RSI ${indicators.rsi14.toFixed(1)} - Overbought`);
    } else if (indicators.rsi14 < 30) {
      bullPoints += 2;
      reasons.push(`RSI ${indicators.rsi14.toFixed(1)} - Oversold`);
    } else if (indicators.rsi14 > 50) {
      bullPoints += 1;
      reasons.push(`RSI ${indicators.rsi14.toFixed(1)} - Bullish momentum`);
    } else {
      bearPoints += 1;
      reasons.push(`RSI ${indicators.rsi14.toFixed(1)} - Bearish momentum`);
    }
  }
  
  // MACD
  if (indicators.macd !== null) {
    if (indicators.macd.histogram > 0) {
      bullPoints += 1;
      reasons.push('MACD histogram positive (bullish momentum)');
    } else {
      bearPoints += 1;
      reasons.push('MACD histogram negative (bearish momentum)');
    }
  }
  
  // Stochastic
  if (indicators.stochastic !== null) {
    if (indicators.stochastic.k > 80) {
      bearPoints += 1;
      reasons.push(`Stochastic ${indicators.stochastic.k.toFixed(1)} - Overbought`);
    } else if (indicators.stochastic.k < 20) {
      bullPoints += 1;
      reasons.push(`Stochastic ${indicators.stochastic.k.toFixed(1)} - Oversold`);
    }
  }
  
  const totalPoints = bullPoints + bearPoints;
  const strength = totalPoints > 0 ? Math.max(bullPoints, bearPoints) / totalPoints * 100 : 50;
  
  if (bullPoints > bearPoints) {
    return { type: 'bull', strength, reasons };
  } else if (bearPoints > bullPoints) {
    return { type: 'bear', strength, reasons };
  } else {
    return { type: 'flat', strength: 50, reasons: ['Mixed momentum signals'] };
  }
}

function generateVolatilitySignal(price: number, indicators: TechnicalIndicators): TechnicalSignal {
  const reasons: string[] = [];
  
  if (indicators.bollingerBands === null) {
    return { type: 'flat', strength: 50, reasons: ['Insufficient data for volatility analysis'] };
  }
  
  const { upper, middle, lower } = indicators.bollingerBands;
  
  if (price > upper) {
    return { 
      type: 'bear', 
      strength: 70, 
      reasons: [`Price above upper Bollinger Band ($${upper.toFixed(2)}) - potentially overbought`] 
    };
  } else if (price < lower) {
    return { 
      type: 'bull', 
      strength: 70, 
      reasons: [`Price below lower Bollinger Band ($${lower.toFixed(2)}) - potentially oversold`] 
    };
  } else if (price > middle) {
    return { 
      type: 'bull', 
      strength: 55, 
      reasons: ['Price in upper half of Bollinger Bands - bullish bias'] 
    };
  } else {
    return { 
      type: 'bear', 
      strength: 55, 
      reasons: ['Price in lower half of Bollinger Bands - bearish bias'] 
    };
  }
}

function generateVolumeSignal(indicators: TechnicalIndicators): TechnicalSignal {
  const reasons: string[] = [];
  
  if (indicators.obv === null || indicators.obvChange === null) {
    return { type: 'flat', strength: 50, reasons: ['Insufficient volume data'] };
  }
  
  if (indicators.obvChange > 5) {
    return { 
      type: 'bull', 
      strength: 70, 
      reasons: [`OBV up ${indicators.obvChange.toFixed(1)}% - strong buying pressure`] 
    };
  } else if (indicators.obvChange < -5) {
    return { 
      type: 'bear', 
      strength: 70, 
      reasons: [`OBV down ${Math.abs(indicators.obvChange).toFixed(1)}% - strong selling pressure`] 
    };
  } else {
    return { 
      type: 'flat', 
      strength: 50, 
      reasons: [`OBV change ${indicators.obvChange.toFixed(1)}% - neutral volume`] 
    };
  }
}

function generateOverallSignal(signals: TechnicalSignal[]): TechnicalSignal {
  let bullCount = 0;
  let bearCount = 0;
  let totalStrength = 0;
  
  signals.forEach(signal => {
    if (signal.type === 'bull') bullCount++;
    else if (signal.type === 'bear') bearCount++;
    totalStrength += signal.strength;
  });
  
  const avgStrength = totalStrength / signals.length;
  const reasons: string[] = [];
  
  if (bullCount > bearCount + 1) {
    reasons.push(`Strong bullish consensus (${bullCount}/${signals.length} indicators)`);
    return { type: 'bull', strength: avgStrength, reasons };
  } else if (bearCount > bullCount + 1) {
    reasons.push(`Strong bearish consensus (${bearCount}/${signals.length} indicators)`);
    return { type: 'bear', strength: avgStrength, reasons };
  } else if (bullCount > bearCount) {
    reasons.push(`Moderate bullish bias (${bullCount}/${signals.length} indicators)`);
    return { type: 'bull', strength: avgStrength, reasons };
  } else if (bearCount > bullCount) {
    reasons.push(`Moderate bearish bias (${bearCount}/${signals.length} indicators)`);
    return { type: 'bear', strength: avgStrength, reasons };
  } else {
    reasons.push(`Mixed signals (${bullCount} bull, ${bearCount} bear)`);
    return { type: 'flat', strength: 50, reasons };
  }
}

// ============ MAIN FUNCTION ============

/**
 * Perform technical analysis on a ticker
 */
export async function performTechnicalAnalysis(ticker: string): Promise<TechnicalAnalysis> {
  console.log(`📊 Performing technical analysis for ${ticker}`);
  
  // Check cache
  const cached = analysisCache[ticker];
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`✅ Returning cached analysis for ${ticker}`);
    return cached.data;
  }
  
  // Get historical data (mock for now - in production, fetch from API)
  const historicalData = await fetchHistoricalData(ticker);
  
  if (!historicalData || historicalData.closes.length < 50) {
    throw new Error(`Insufficient historical data for ${ticker}`);
  }
  
  const { opens, highs, lows, closes, volumes } = historicalData;
  const currentPrice = closes[closes.length - 1];
  
  // Calculate indicators
  const indicators: TechnicalIndicators = {
    sma20: calculateSMA(closes, 20),
    sma50: calculateSMA(closes, 50),
    sma200: calculateSMA(closes, 200),
    ema12: calculateEMA(closes, 12),
    ema26: calculateEMA(closes, 26),
    rsi14: calculateRSI(closes, 14),
    macd: calculateMACD(closes),
    stochastic: calculateStochastic(highs, lows, closes, 14),
    adx: calculateADX(highs, lows, closes, 14),
    bollingerBands: calculateBollingerBands(closes, 20, 2),
    atr14: calculateATR(highs, lows, closes, 14),
    obv: null,
    obvChange: null,
  };
  
  const obvData = calculateOBV(closes, volumes);
  if (obvData) {
    indicators.obv = obvData.obv;
    indicators.obvChange = obvData.change;
  }
  
  // Find support/resistance
  const { support, resistance } = findSupportResistance(highs, lows, closes);
  
  // Generate signals
  const trendSignal = generateTrendSignal(currentPrice, indicators);
  const momentumSignal = generateMomentumSignal(indicators);
  const volatilitySignal = generateVolatilitySignal(currentPrice, indicators);
  const volumeSignal = generateVolumeSignal(indicators);
  const overallSignal = generateOverallSignal([
    trendSignal,
    momentumSignal,
    volatilitySignal,
    volumeSignal,
  ]);
  
  // Generate recommendation
  let recommendation: 'BUY' | 'HOLD' | 'SELL';
  let confidence: number;
  
  if (overallSignal.type === 'bull' && overallSignal.strength > 65) {
    recommendation = 'BUY';
    confidence = overallSignal.strength;
  } else if (overallSignal.type === 'bear' && overallSignal.strength > 65) {
    recommendation = 'SELL';
    confidence = overallSignal.strength;
  } else {
    recommendation = 'HOLD';
    confidence = 50 + Math.abs(50 - overallSignal.strength);
  }
  
  const analysis: TechnicalAnalysis = {
    ticker,
    timestamp: new Date().toISOString(),
    currentPrice,
    indicators,
    signals: {
      trend: trendSignal,
      momentum: momentumSignal,
      volatility: volatilitySignal,
      volume: volumeSignal,
      overall: overallSignal,
    },
    support,
    resistance,
    recommendation,
    confidence,
  };
  
  // Cache result
  analysisCache[ticker] = {
    data: analysis,
    timestamp: Date.now(),
  };
  
  console.log(`✅ Technical analysis complete for ${ticker}: ${recommendation} (${confidence.toFixed(0)}% confidence)`);
  
  return analysis;
}

/**
 * Fetch historical data from Alpha Vantage API
 * Falls back to mock data if API fails
 */
async function fetchHistoricalData(ticker: string) {
  const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || 'demo';
  
  console.log(`🔑 Using API key: ${ALPHA_VANTAGE_API_KEY.substring(0, 4)}...${ALPHA_VANTAGE_API_KEY.substring(ALPHA_VANTAGE_API_KEY.length - 4)}`);
  
  if (ALPHA_VANTAGE_API_KEY === 'demo' || ALPHA_VANTAGE_API_KEY === '') {
    console.warn(`⚠️  No valid API key configured for ${ticker}, using mock data`);
    return generateMockData(ticker);
  }
  
  try {
    // Try to fetch real data from Alpha Vantage
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}&outputsize=compact&apikey=${ALPHA_VANTAGE_API_KEY}`;
    
    console.log(`🌐 Fetching historical data for ${ticker} from Alpha Vantage...`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      const data = await response.json();
      
      // Check for API error messages
      if (data['Error Message']) {
        console.error(`❌ Alpha Vantage API error for ${ticker}:`, data['Error Message']);
        return generateMockData(ticker);
      }
      
      if (data['Note']) {
        console.warn(`⚠️  Alpha Vantage API rate limit for ${ticker}:`, data['Note']);
        return generateMockData(ticker);
      }
      
      if (data['Information']) {
        console.warn(`⚠️  Alpha Vantage API info for ${ticker}:`, data['Information']);
        return generateMockData(ticker);
      }
      
      if (data['Time Series (Daily)']) {
        const timeSeries = data['Time Series (Daily)'];
        const dates = Object.keys(timeSeries).sort().slice(-250); // Last 250 days
        
        if (dates.length === 0) {
          console.warn(`⚠️  No historical data available for ${ticker}, using mock data`);
          return generateMockData(ticker);
        }
        
        const opens: number[] = [];
        const highs: number[] = [];
        const lows: number[] = [];
        const closes: number[] = [];
        const volumes: number[] = [];
        
        dates.forEach(date => {
          const dayData = timeSeries[date];
          opens.push(parseFloat(dayData['1. open']));
          highs.push(parseFloat(dayData['2. high']));
          lows.push(parseFloat(dayData['3. low']));
          closes.push(parseFloat(dayData['4. close']));
          volumes.push(parseInt(dayData['5. volume']));
        });
        
        const latestPrice = closes[closes.length - 1];
        console.log(`✅ Fetched REAL historical data for ${ticker}: ${dates.length} days, latest price: $${latestPrice.toFixed(2)}`);
        return { opens, highs, lows, closes, volumes };
      } else {
        console.warn(`⚠️  Alpha Vantage API returned unexpected format for ${ticker}, using mock data`);
        console.log('Response keys:', Object.keys(data));
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error(`❌ Timeout fetching historical data for ${ticker} (15s)`);
      } else {
        console.error(`❌ Network error fetching historical data for ${ticker}:`, fetchError);
      }
    }
  } catch (error) {
    console.error(`❌ Failed to fetch historical data for ${ticker}:`, error);
  }
  
  // Fallback to mock data
  console.warn(`⚠️  Using MOCK data for ${ticker}`);
  return generateMockData(ticker);
}

/**
 * Generate mock historical data (fallback when API fails)
 */
function generateMockData(ticker: string) {
  const days = 250;
  
  // Use realistic base prices for common tickers
  const tickerPrices: Record<string, number> = {
    'AAPL': 175,
    'MSFT': 380,
    'GOOGL': 140,
    'AMZN': 155,
    'TSLA': 250,
    'NVDA': 480,
    'META': 350,
    'NFLX': 480,
    'AMD': 120,
    'INTC': 45,
  };
  
  const basePrice = tickerPrices[ticker] || (100 + Math.random() * 400);
  
  const opens: number[] = [];
  const highs: number[] = [];
  const lows: number[] = [];
  const closes: number[] = [];
  const volumes: number[] = [];
  
  let price = basePrice;
  
  for (let i = 0; i < days; i++) {
    const change = (Math.random() - 0.48) * price * 0.03;
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * price * 0.01;
    const low = Math.min(open, close) - Math.random() * price * 0.01;
    const volume = 1000000 + Math.random() * 5000000;
    
    opens.push(open);
    highs.push(high);
    lows.push(low);
    closes.push(close);
    volumes.push(volume);
    
    price = close;
  }
  
  console.log(`⚠️  Using mock historical data for ${ticker} (base price: $${basePrice.toFixed(2)})`);
  return { opens, highs, lows, closes, volumes };
}

/**
 * Get cache status for technical analysis
 */
export function getAnalysisCacheStatus() {
  return {
    cachedTickers: Object.keys(analysisCache),
    cacheSize: Object.keys(analysisCache).length,
  };
}

/**
 * Clear analysis cache
 */
export function clearAnalysisCache() {
  Object.keys(analysisCache).forEach(key => delete analysisCache[key]);
  console.log('🗑️ Technical analysis cache cleared');
}
