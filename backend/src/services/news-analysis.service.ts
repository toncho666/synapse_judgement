// News Analysis Service
// Analyzes news sentiment for a ticker using Alpha Vantage API

import logger from '../utils/logger.js';
import { alphaVantageSlot } from './technical-analysis.service.js';

// ============ TYPES ============

export interface NewsItem {
  title: string;
  url: string;
  source: string;
  timePublished: string;
  summary: string;
  sentimentScore: number; // -1 to +1
  sentimentLabel: 'Bullish' | 'Somewhat-Bullish' | 'Neutral' | 'Somewhat-Bearish' | 'Bearish';
  relevanceScore: number; // 0 to 1
  tickerSentiment?: {
    ticker: string;
    relevanceScore: number;
    sentimentScore: number;
  };
}

export interface NewsAnalysis {
  ticker: string;
  period: string;
  timestamp: string;
  
  sentiment: {
    score: number; // -1 to +1
    label: 'positive' | 'negative' | 'neutral';
    trend: 'improving' | 'declining' | 'stable';
    confidence: number; // 0-100
  };
  
  statistics: {
    totalNews: number;
    positive: number;
    negative: number;
    neutral: number;
    positivityRatio: number;
  };
  
  timeAnalysis: {
    last24h: { score: number; count: number };
    last3d: { score: number; count: number };
    last5d: { score: number; count: number };
  };
  
  keyEvents: Array<{
    title: string;
    sentiment: number;
    source: string;
    time: string;
    impact: 'high' | 'medium' | 'low';
    url: string;
  }>;
  
  topSources: Array<{
    name: string;
    count: number;
    avgSentiment: number;
  }>;
  
  signal: 'bull' | 'bear' | 'flat';
  strength: number; // 0-100
  reasons: string[];
}

// ============ CACHE ============

interface NewsCache {
  [ticker: string]: {
    data: NewsAnalysis;
    timestamp: number;
  };
}

const newsCache: NewsCache = {};
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes (news changes frequently)

// ============ CONFIGURATION ============

// NOTE: intentionally read at call time (not module load) so dotenv/tsx ordering can't pin a stale value.
// No 'demo' fallback: the demo key does NOT support NEWS_SENTIMENT and silently yields empty results.
function getAlphaVantageApiKey(): string {
  return (process.env.ALPHA_VANTAGE_API_KEY || '').trim();
}

// Source credibility weights
const SOURCE_WEIGHTS: Record<string, number> = {
  'Bloomberg': 1.0,
  'Reuters': 1.0,
  'Wall Street Journal': 0.95,
  'Financial Times': 0.95,
  'CNBC': 0.9,
  'MarketWatch': 0.85,
  'Yahoo Finance': 0.7,
  'Seeking Alpha': 0.75,
  'The Motley Fool': 0.7,
  'Benzinga': 0.65,
};

// ============ HELPER FUNCTIONS ============

/**
 * Fetch news from Alpha Vantage
 */
async function fetchNewsFromAlphaVantage(ticker: string): Promise<NewsItem[]> {
  const apiKey = getAlphaVantageApiKey();

  if (!apiKey) {
    logger.error(
      `❌ ALPHA_VANTAGE_API_KEY is not set. News agent cannot fetch data for ${ticker}. ` +
      `Set it in backend/.env (free key: https://www.alphavantage.co/support/#api-key). ` +
      `Note: the "demo" key does NOT support NEWS_SENTIMENT.`
    );
    return [];
  }

  // Masked key for logs
  const maskedKey = apiKey.length > 8 ? `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}` : '****';
  logger.info(`📰 Fetching news for ${ticker} from Alpha Vantage (key ${maskedKey})`);

  try {
    // LATEST: freshest articles first (default was EARLIEST - wrong for a sentiment snapshot).
    // sort=LATEST also avoids the known "premium endpoint" Information response of NEWS_SENTIMENT.
    const url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${ticker}&limit=50&sort=LATEST&apikey=${apiKey}`;
    logger.info(`🌐 Requesting: ${url.replace(apiKey, '***')}`);

    // Timeout guard (AV can hang and stall the request)
    const doFetch = async (): Promise<Response> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      try {
        return await fetch(url, { signal: controller.signal });
      } finally {
        clearTimeout(timeoutId);
      }
    };

    // Route through the shared Alpha Vantage rate-limit queue (1 req/sec on the free tier).
    // Without this, news + technical requests fire simultaneously and AV throttles one of them.
    let response: Response;
    try {
      response = await alphaVantageSlot(`NEWS_SENTIMENT ${ticker}`, doFetch);
    } catch (fetchError) {
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        logger.error(`❌ Timeout fetching news for ${ticker} (15s)`);
      } else {
        logger.error(`❌ Network error fetching news for ${ticker}:`, fetchError);
      }
      return [];
    }

    if (!response.ok) {
      logger.error(`❌ Alpha Vantage HTTP error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = (await response.json()) as Record<string, unknown>;

    logger.info(`📥 API response received, keys: ${Object.keys(data).join(', ')}`);

    if (data.Error) {
      logger.error(`❌ Alpha Vantage API error: ${String(data.Error)}`);
      return [];
    }

    if (data.Note) {
      logger.warn(`⚠️  Alpha Vantage API rate limit: ${String(data.Note)}`);
      logger.warn(`💡 You've reached the daily limit (25 requests/day for free tier)`);
      return [];
    }

    if (data.Information) {
      logger.warn(`ℹ️  Alpha Vantage API info: ${String(data.Information)}`);
      return [];
    }

    const feed = Array.isArray(data.feed) ? (data.feed as any[]) : [];

    if (feed.length === 0) {
      logger.warn(`⚠️  No news found for ${ticker} in Alpha Vantage`);
      logger.warn(`💡 This is normal - Alpha Vantage may not have recent news for this ticker`);
      logger.warn(`💡 Try more popular tickers: AAPL, MSFT, TSLA, GOOGL`);
      return [];
    }

    logger.info(`✅ Found ${feed.length} total news items for ${ticker}`);

    // Filter news from last 5 days
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    const news: NewsItem[] = feed
      .filter((item: any) => {
        const newsDate = new Date(item.time_published);
        return newsDate >= fiveDaysAgo;
      })
      .map((item: any) => {
        // Prefer per-ticker sentiment when available; fall back to overall values
        const ts = item.ticker_sentiment?.find?.((t: any) => t.ticker === ticker);
        return {
          title: item.title,
          url: item.url,
          source: item.source,
          timePublished: item.time_published,
          summary: item.summary || '',
          sentimentScore: parseFloat(ts?.ticker_sentiment_score ?? item.overall_sentiment_score ?? 0) || 0,
          sentimentLabel: ts?.ticker_sentiment_label || item.overall_sentiment_label || 'Neutral',
          relevanceScore: parseFloat(ts?.ticker_relevance_score ?? item.relevance_score ?? 0) || 0,
          tickerSentiment: ts
            ? {
                ticker,
                relevanceScore: parseFloat(ts.ticker_relevance_score ?? 0) || 0,
                sentimentScore: parseFloat(ts.ticker_sentiment_score ?? 0) || 0,
              }
            : undefined,
        };
      });
    
    logger.info(`Fetched ${news.length} news items for ${ticker}`);
    return news;
  } catch (error) {
    logger.error('Error fetching news from Alpha Vantage:', error);
    return [];
  }
}

/**
 * Calculate source credibility weight
 */
function getSourceWeight(source: string): number {
  return SOURCE_WEIGHTS[source] || 0.5;
}

/**
 * Calculate time decay (recent news is more important)
 */
function getTimeDecay(hoursAgo: number): number {
  // Exponential decay: importance halves every 24 hours
  return Math.exp(-hoursAgo / 24);
}

/**
 * Analyze sentiment from news items
 */
function analyzeSentiment(news: NewsItem[]): {
  score: number;
  label: 'positive' | 'negative' | 'neutral';
  confidence: number;
} {
  if (news.length === 0) {
    return { score: 0, label: 'neutral', confidence: 0 };
  }
  
  let weightedSum = 0;
  let totalWeight = 0;
  
  news.forEach(item => {
    const sourceWeight = getSourceWeight(item.source);
    const timePublished = new Date(item.timePublished);
    const hoursAgo = (Date.now() - timePublished.getTime()) / (1000 * 60 * 60);
    const timeDecay = getTimeDecay(hoursAgo);
    
    const weight = sourceWeight * timeDecay * item.relevanceScore;
    weightedSum += item.sentimentScore * weight;
    totalWeight += weight;
  });
  
  const score = totalWeight > 0 ? weightedSum / totalWeight : 0;
  
  let label: 'positive' | 'negative' | 'neutral';
  if (score > 0.15) {
    label = 'positive';
  } else if (score < -0.15) {
    label = 'negative';
  } else {
    label = 'neutral';
  }
  
  // Confidence based on news volume and consistency
  const confidence = Math.min(100, news.length * 5);
  
  return { score, label, confidence };
}

/**
 * Calculate time-based analysis
 */
function calculateTimeAnalysis(news: NewsItem[]): {
  last24h: { score: number; count: number };
  last3d: { score: number; count: number };
  last5d: { score: number; count: number };
} {
  const now = Date.now();
  
  const last24h = news.filter(n => {
    const hoursAgo = (now - new Date(n.timePublished).getTime()) / (1000 * 60 * 60);
    return hoursAgo <= 24;
  });
  
  const last3d = news.filter(n => {
    const hoursAgo = (now - new Date(n.timePublished).getTime()) / (1000 * 60 * 60);
    return hoursAgo <= 72;
  });
  
  const last5d = news; // All news is within 5 days
  
  return {
    last24h: {
      score: last24h.length > 0 ? last24h.reduce((sum, n) => sum + n.sentimentScore, 0) / last24h.length : 0,
      count: last24h.length,
    },
    last3d: {
      score: last3d.length > 0 ? last3d.reduce((sum, n) => sum + n.sentimentScore, 0) / last3d.length : 0,
      count: last3d.length,
    },
    last5d: {
      score: last5d.length > 0 ? last5d.reduce((sum, n) => sum + n.sentimentScore, 0) / last5d.length : 0,
      count: last5d.length,
    },
  };
}

/**
 * Extract key events (high-impact news)
 */
function extractKeyEvents(news: NewsItem[]): NewsAnalysis['keyEvents'] {
  return news
    .filter(n => Math.abs(n.sentimentScore) > 0.5 && n.relevanceScore > 0.7)
    .sort((a, b) => Math.abs(b.sentimentScore) - Math.abs(a.sentimentScore))
    .slice(0, 5)
    .map(n => ({
      title: n.title,
      sentiment: n.sentimentScore,
      source: n.source,
      time: n.timePublished,
      impact: Math.abs(n.sentimentScore) > 0.7 ? 'high' as const : Math.abs(n.sentimentScore) > 0.4 ? 'medium' as const : 'low' as const,
      url: n.url,
    }));
}

/**
 * Calculate top sources
 */
function calculateTopSources(news: NewsItem[]): NewsAnalysis['topSources'] {
  const sourceMap = new Map<string, { count: number; totalSentiment: number }>();
  
  news.forEach(n => {
    const existing = sourceMap.get(n.source) || { count: 0, totalSentiment: 0 };
    existing.count++;
    existing.totalSentiment += n.sentimentScore;
    sourceMap.set(n.source, existing);
  });
  
  return Array.from(sourceMap.entries())
    .map(([name, data]) => ({
      name,
      count: data.count,
      avgSentiment: data.totalSentiment / data.count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

/**
 * Determine sentiment trend
 */
function determineTrend(timeAnalysis: NewsAnalysis['timeAnalysis']): 'improving' | 'declining' | 'stable' {
  const { last24h, last5d } = timeAnalysis;

  if (last24h.count === 0 || last5d.count === 0) {
    return 'stable';
  }

  // Compare the average sentiment of the freshest news vs the whole 5-day window.
  // (Old formula divided last3d.score by 3, which almost always produced "improving".)
  const recentDelta = last24h.score - last5d.score;

  if (recentDelta > 0.1) {
    return 'improving';
  } else if (recentDelta < -0.1) {
    return 'declining';
  } else {
    return 'stable';
  }
}

/**
 * Generate trading signal
 */
function generateSignal(analysis: Omit<NewsAnalysis, 'signal' | 'strength' | 'reasons'>): {
  signal: 'bull' | 'bear' | 'flat';
  strength: number;
  reasons: string[];
} {
  const reasons: string[] = [];
  let signal: 'bull' | 'bear' | 'flat' = 'flat';
  let strength = 50;

  // Note: timeAnalysis intentionally not used here (trend already folded in via sentiment.trend)
  const { sentiment, statistics } = analysis;

  // Determine signal based on sentiment.
  // positivityRatio is a fraction positive/(positive+negative) in [0..1] (0.5 = balanced).
  if (sentiment.score > 0.2 && statistics.positivityRatio > 0.6) {
    signal = 'bull';
    strength = Math.min(100, 50 + sentiment.score * 100);
    reasons.push(`Strong positive sentiment (${sentiment.score.toFixed(2)})`);
  } else if (sentiment.score < -0.2 && statistics.positivityRatio < 0.4) {
    signal = 'bear';
    strength = Math.min(100, 50 + Math.abs(sentiment.score) * 100);
    reasons.push(`Strong negative sentiment (${sentiment.score.toFixed(2)})`);
  }
  
  // Add trend information
  if (sentiment.trend === 'improving' && signal === 'bull') {
    strength += 10;
    reasons.push('Sentiment improving over time');
  } else if (sentiment.trend === 'declining' && signal === 'bear') {
    strength += 10;
    reasons.push('Sentiment declining over time');
  }
  
  // Add volume information
  if (statistics.totalNews > 30) {
    strength += 5;
    reasons.push(`High news volume (${statistics.totalNews} articles)`);
  }
  
  // Add confidence
  if (sentiment.confidence > 70) {
    strength += 5;
    reasons.push(`High confidence (${sentiment.confidence}%)`);
  }
  
  return { signal, strength, reasons };
}

// ============ MAIN FUNCTION ============

/**
 * Perform news analysis for a ticker
 */
export async function performNewsAnalysis(ticker: string): Promise<NewsAnalysis> {
  logger.info(`Starting news analysis for ${ticker}`);
  
  // Check cache
  const cached = newsCache[ticker];
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    logger.info(`Returning cached news analysis for ${ticker}`);
    return cached.data;
  }
  
  // Fetch news
  const news = await fetchNewsFromAlphaVantage(ticker);
  
  if (news.length === 0) {
    logger.warn(`No news found for ${ticker}, returning neutral analysis`);
    return {
      ticker,
      period: '5d',
      timestamp: new Date().toISOString(),
      sentiment: { score: 0, label: 'neutral', trend: 'stable', confidence: 0 },
      statistics: { totalNews: 0, positive: 0, negative: 0, neutral: 0, positivityRatio: 1 },
      timeAnalysis: {
        last24h: { score: 0, count: 0 },
        last3d: { score: 0, count: 0 },
        last5d: { score: 0, count: 0 },
      },
      keyEvents: [],
      topSources: [],
      signal: 'flat',
      strength: 50,
      reasons: ['No recent news available'],
    };
  }
  
  // Analyze sentiment
  const sentimentAnalysis = analyzeSentiment(news);
  
  // Calculate statistics
  const positive = news.filter(n => n.sentimentScore > 0.15).length;
  const negative = news.filter(n => n.sentimentScore < -0.15).length;
  const neutral = news.length - positive - negative;
  // Fraction of opinionated articles that are positive, in [0..1]; 0.5 = balanced; 1 when no negatives
  const positivityRatio = (positive + negative) > 0 ? positive / (positive + negative) : 0.5;
  
  // Calculate time analysis
  const timeAnalysis = calculateTimeAnalysis(news);
  
  // Determine trend
  const trend = determineTrend(timeAnalysis);
  
  // Extract key events
  const keyEvents = extractKeyEvents(news);
  
  // Calculate top sources
  const topSources = calculateTopSources(news);
  
  // Build analysis object
  const analysis: Omit<NewsAnalysis, 'signal' | 'strength' | 'reasons'> = {
    ticker,
    period: '5d',
    timestamp: new Date().toISOString(),
    sentiment: {
      ...sentimentAnalysis,
      trend,
    },
    statistics: {
      totalNews: news.length,
      positive,
      negative,
      neutral,
      positivityRatio,
    },
    timeAnalysis,
    keyEvents,
    topSources,
  };
  
  // Generate signal
  const { signal, strength, reasons } = generateSignal(analysis);
  
  const fullAnalysis: NewsAnalysis = {
    ...analysis,
    signal,
    strength,
    reasons,
  };
  
  // Cache result
  newsCache[ticker] = {
    data: fullAnalysis,
    timestamp: Date.now(),
  };
  
  logger.info(`News analysis complete for ${ticker}: ${signal} signal (${strength}% strength)`);
  
  return fullAnalysis;
}

/**
 * Get cache status
 */
export function getNewsCacheStatus() {
  return {
    cachedTickers: Object.keys(newsCache),
    cacheSize: Object.keys(newsCache).length,
  };
}

/**
 * Clear news cache
 */
export function clearNewsCache() {
  Object.keys(newsCache).forEach(key => delete newsCache[key]);
  logger.info('News analysis cache cleared');
}
