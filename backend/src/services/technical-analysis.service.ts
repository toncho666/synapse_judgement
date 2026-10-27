// Technical Analysis Service
// Calculates technical indicators and generates trading signals
// Historical OHLC data source: Twelve Data (see twelvedata.service.ts)

import { fetchHistoricalDaily } from './twelvedata.service.js';

// Shared sequential rate limiter for Alpha Vantage (free tier: 1 request/second, 25/day).
// All AV calls (historical + news) go through this queue to avoid "Note"/"Information" throttling responses.
let avLastCallAt = 0;
const AV_MIN_INTERVAL_MS = 1100;
let avQueueTail: Promise<void> = Promise.resolve();

export async function alphaVantageSlot<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const run = avQueueTail.then(async () => {
    const wait = avLastCallAt + AV_MIN_INTERVAL_MS - Date.now();
    if (wait > 0) {
      console.log(`⏱️ Rate-limiting Alpha Vantage request (${label}): waiting ${wait}ms`);
      await new Promise((r) => setTimeout(r, wait));
    }
    avLastCallAt = Date.now();
    return fn();
  });
  // Keep the chain alive even if this call rejects
  avQueueTail = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

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
    console.log(`✅ Returning CACHED analysis for ${ticker} (age: ${Math.floor((Date.now() - cached.timestamp) / 1000)}s)`);
    console.log(`   Current price in cache: $${cached.data.currentPrice.toFixed(2)}`);
    return cached.data;
  }
  
  console.log(`🔄 Cache expired or empty, fetching NEW data for ${ticker}...`);
  
  // Get historical data from Alpha Vantage API
  const historicalData = await fetchHistoricalData(ticker);
  
  if (!historicalData || historicalData.closes.length < 50) {
    console.warn(`⚠️  Insufficient historical data for ${ticker}, returning "no data" response`);
    
    // Return special "no data" response
    const noDataResponse: TechnicalAnalysis = {
      ticker,
      timestamp: new Date().toISOString(),
      currentPrice: 0,
      indicators: {
        sma20: null,
        sma50: null,
        sma200: null,
        ema12: null,
        ema26: null,
        rsi14: null,
        macd: null,
        stochastic: null,
        adx: null,
        bollingerBands: null,
        atr14: null,
        obv: null,
        obvChange: null,
      },
      signals: {
        trend: { type: 'flat', strength: 0, reasons: ['No data available'] },
        momentum: { type: 'flat', strength: 0, reasons: ['No data available'] },
        volatility: { type: 'flat', strength: 0, reasons: ['No data available'] },
        volume: { type: 'flat', strength: 0, reasons: ['No data available'] },
        overall: { type: 'flat', strength: 0, reasons: ['No data available'] },
      },
      support: null,
      resistance: null,
      recommendation: 'HOLD',
      confidence: 0,
    };
    
    return noDataResponse;
  }
  
  const { highs, lows, closes, volumes } = historicalData;
  const currentPrice = closes[closes.length - 1];
  
  console.log(`📈 Historical data received for ${ticker}:`);
  console.log(`   Days: ${closes.length}`);
  console.log(`   Current price: $${currentPrice.toFixed(2)}`);
  console.log(`   Price range: $${Math.min(...lows).toFixed(2)} - $${Math.max(...highs).toFixed(2)}`);
  
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

async function fetchHistoricalData(ticker: string) {
  // Historical OHLC data now comes from Twelve Data (much more generous free tier
  // than Alpha Vantage: 800 credits/day vs 25/day, and no "Information" throttling blobs).
  return await fetchHistoricalDaily(ticker, 350);
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
