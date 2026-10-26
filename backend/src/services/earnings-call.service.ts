// Earnings Call Analysis Service
// Analyzes earnings call transcripts using Finnhub API

import logger from '../utils/logger.js';

// ============ TYPES ============

export interface Transcript {
  id: number;
  symbol: string;
  quarter: number;
  year: number;
  date: string;
  participants: Array<{
    name: string;
    title: string;
  }>;
  content: Array<{
    speaker: string;
    title: string;
    text: string;
  }>;
}

export interface EarningsAnalysis {
  ticker: string;
  timestamp: string;
  period: string;
  
  tone: {
    evasivenessIndex: number; // 0-100
    confidenceScore: number; // 0-100
    sentimentShift: number; // -100 to +100
    overallTone: 'confident' | 'cautious' | 'uncertain';
  };
  
  guidance: {
    companyGuidance: {
      eps?: number;
      revenue?: number;
    };
    consensusEstimate: {
      eps?: number;
      revenue?: number;
    };
    beat: boolean;
    delta: number; // percentage
  };
  
  keyTopics: Array<{
    topic: string;
    count: number;
    sentiment: number; // -1 to +1
  }>;
  
  keyQuotes: Array<{
    speaker: string;
    title: string;
    text: string;
    confidence: 'high' | 'medium' | 'low';
    quarter: string;
  }>;
  
  quarterlyTrend: Array<{
    quarter: string;
    confidence: number;
    evasiveness: number;
    sentiment: number;
  }>;
  
  signal: 'bull' | 'bear' | 'flat';
  strength: number; // 0-100
  reasons: string[];
}

// ============ CACHE ============

interface EarningsCache {
  [ticker: string]: {
     EarningsAnalysis;
    timestamp: number;
  };
}

const earningsCache: EarningsCache = {};
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// ============ CONFIGURATION ============

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || '';

// Evasive phrases
const EVASIVE_PHRASES = [
  'we might', 'could potentially', 'uncertain', 'challenging environment',
  'headwinds', 'cautious', 'monitor closely', 'difficult to predict',
  'may not', 'might be', 'could be', 'uncertainty', 'volatile',
  'unpredictable', 'challenging', 'difficult', 'risk', 'concern'
];

// Confident phrases
const CONFIDENT_PHRASES = [
  'we expect', 'we are confident', 'strong performance', 'exceeded expectations',
  'record quarter', 'momentum', 'optimistic', 'well-positioned',
  'delivered', 'achieved', 'surpassed', 'outperformed', 'robust',
  'solid', 'impressive', 'exceptional', 'strong', 'growth'
];

// Topic keywords
const TOPIC_KEYWORDS: Record<string, string[]> = {
  'AI': ['ai', 'artificial intelligence', 'machine learning', 'ml', 'generative ai', 'llm'],
  'Cloud': ['cloud', 'saas', 'subscription', 'recurring revenue'],
  'Margins': ['margin', 'profitability', 'cost', 'efficiency', 'operating'],
  'Growth': ['growth', 'expansion', 'revenue', 'sales', 'market share'],
  'Debt': ['debt', 'leverage', 'balance sheet', 'liquidity'],
  'Dividend': ['dividend', 'payout', 'shareholder return', 'buyback'],
  'Guidance': ['guidance', 'outlook', 'forecast', 'expectation', 'target'],
  'Supply Chain': ['supply chain', 'logistics', 'inventory', 'procurement'],
  'Regulation': ['regulation', 'compliance', 'legal', 'regulatory'],
  'Competition': ['competition', 'competitive', 'market position', 'rival']
};

// ============ HELPER FUNCTIONS ============

/**
 * Fetch transcripts list from Finnhub
 */
async function fetchTranscriptsList(ticker: string): Promise<any[]> {
  if (!FINNHUB_API_KEY) {
    logger.warn('Finnhub API key not configured, using mock data');
    return [];
  }

  try {
    const url = `https://finnhub.io/api/v1/stock/transcripts?symbol=${ticker}&token=${FINNHUB_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.data && Array.isArray(data.data)) {
      logger.info(`Fetched ${data.data.length} transcripts for ${ticker}`);
      return data.data.slice(0, 4); // Last 4 quarters
    }
    
    return [];
  } catch (error) {
    logger.error('Error fetching transcripts list:', error);
    return [];
  }
}

/**
 * Fetch full transcript from Finnhub
 */
async function fetchTranscript(transcriptId: number): Promise<Transcript | null> {
  if (!FINNHUB_API_KEY) {
    return null;
  }

  try {
    const url = `https://finnhub.io/api/v1/call/transcript?id=${transcriptId}&token=${FINNHUB_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.transcript) {
      return data.transcript;
    }
    
    return null;
  } catch (error) {
    logger.error(`Error fetching transcript ${transcriptId}:`, error);
    return null;
  }
}

/**
 * Calculate evasiveness index
 */
function calculateEvasivenessIndex(transcript: Transcript): number {
  const allText = transcript.content.map(c => c.text.toLowerCase()).join(' ');
  const words = allText.split(/\s+/).length;
  
  let evasiveCount = 0;
  EVASIVE_PHRASES.forEach(phrase => {
    const regex = new RegExp(phrase, 'gi');
    const matches = allText.match(regex);
    if (matches) evasiveCount += matches.length;
  });
  
  return Math.min(100, (evasiveCount / words) * 10000);
}

/**
 * Calculate confidence score
 */
function calculateConfidenceScore(transcript: Transcript): number {
  const allText = transcript.content.map(c => c.text.toLowerCase()).join(' ');
  const words = allText.split(/\s+/).length;
  
  let confidentCount = 0;
  CONFIDENT_PHRASES.forEach(phrase => {
    const regex = new RegExp(phrase, 'gi');
    const matches = allText.match(regex);
    if (matches) confidentCount += matches.length;
  });
  
  return Math.min(100, (confidentCount / words) * 10000);
}

/**
 * Extract key quotes
 */
function extractKeyQuotes(transcript: Transcript, quarter: string): EarningsAnalysis['keyQuotes'] {
  const quotes: EarningsAnalysis['keyQuotes'] = [];
  
  transcript.content.forEach(section => {
    // Look for confident statements
    const text = section.text;
    const lowerText = text.toLowerCase();
    
    let confidence: 'high' | 'medium' | 'low' = 'low';
    
    if (CONFIDENT_PHRASES.some(phrase => lowerText.includes(phrase))) {
      confidence = 'high';
    } else if (EVASIVE_PHRASES.some(phrase => lowerText.includes(phrase))) {
      confidence = 'low';
    } else {
      confidence = 'medium';
    }
    
    // Only add significant quotes (longer than 50 chars and contain key phrases)
    if (text.length > 50 && (confidence === 'high' || confidence === 'medium')) {
      // Extract first sentence
      const firstSentence = text.split(/[.!?]/)[0].trim();
      if (firstSentence.length > 30) {
        quotes.push({
          speaker: section.speaker,
          title: section.title,
          text: firstSentence,
          confidence,
          quarter
        });
      }
    }
  });
  
  return quotes.slice(0, 5); // Top 5 quotes
}

/**
 * Identify key topics
 */
function identifyKeyTopics(transcript: Transcript): EarningsAnalysis['keyTopics'] {
  const allText = transcript.content.map(c => c.text.toLowerCase()).join(' ');
  
  const topics: EarningsAnalysis['keyTopics'] = [];
  
  Object.entries(TOPIC_KEYWORDS).forEach(([topic, keywords]) => {
    let count = 0;
    keywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'gi');
      const matches = allText.match(regex);
      if (matches) count += matches.length;
    });
    
    if (count > 0) {
      // Simple sentiment based on context
      const sentiment = count > 10 ? 0.5 : count > 5 ? 0.2 : 0;
      
      topics.push({
        topic,
        count,
        sentiment
      });
    }
  });
  
  return topics.sort((a, b) => b.count - a.count).slice(0, 10);
}

/**
 * Calculate sentiment shift between quarters
 */
function calculateSentimentShift(transcripts: Transcript[]): number {
  if (transcripts.length < 2) return 0;
  
  const current = calculateConfidenceScore(transcripts[0]) - calculateEvasivenessIndex(transcripts[0]);
  const previous = calculateConfidenceScore(transcripts[1]) - calculateEvasivenessIndex(transcripts[1]);
  
  return current - previous;
}

/**
 * Generate mock data when API is not available
 */
function generateMockData(ticker: string): EarningsAnalysis {
  const baseConfidence = 50 + Math.random() * 40;
  const baseEvasiveness = 10 + Math.random() * 30;
  
  return {
    ticker,
    timestamp: new Date().toISOString(),
    period: 'Last 4 quarters',
    
    tone: {
      evasivenessIndex: Math.round(baseEvasiveness),
      confidenceScore: Math.round(baseConfidence),
      sentimentShift: Math.round((Math.random() - 0.5) * 30),
      overallTone: baseConfidence > 70 ? 'confident' : baseConfidence > 50 ? 'cautious' : 'uncertain'
    },
    
    guidance: {
      companyGuidance: {
        eps: 0.85 + Math.random() * 0.3,
        revenue: 40 + Math.random() * 10
      },
      consensusEstimate: {
        eps: 0.80 + Math.random() * 0.3,
        revenue: 38 + Math.random() * 10
      },
      beat: Math.random() > 0.3,
      delta: (Math.random() - 0.3) * 10
    },
    
    keyTopics: [
      { topic: 'AI', count: 42, sentiment: 0.6 },
      { topic: 'Growth', count: 31, sentiment: 0.4 },
      { topic: 'Margins', count: 28, sentiment: 0.3 },
      { topic: 'Cloud', count: 24, sentiment: 0.5 }
    ],
    
    keyQuotes: [
      {
        speaker: 'CEO',
        title: 'Chief Executive Officer',
        text: 'We are exceptionally well-positioned for continued growth in the coming quarters.',
        confidence: 'high',
        quarter: 'Q4 2026'
      },
      {
        speaker: 'CFO',
        title: 'Chief Financial Officer',
        text: 'We expect margins to expand driven by operational efficiencies.',
        confidence: 'high',
        quarter: 'Q4 2026'
      }
    ],
    
    quarterlyTrend: [
      { quarter: 'Q1 2026', confidence: 65, evasiveness: 25, sentiment: 10 },
      { quarter: 'Q2 2026', confidence: 70, evasiveness: 22, sentiment: 15 },
      { quarter: 'Q3 2026', confidence: 75, evasiveness: 18, sentiment: 20 },
      { quarter: 'Q4 2026', confidence: 72, evasiveness: 20, sentiment: 18 }
    ],
    
    signal: 'bull',
    strength: 65,
    reasons: [
      'High confidence score (72/100)',
      'Low evasiveness (20/100)',
      'Positive sentiment shift (+18%)',
      'Guidance beat consensus'
    ]
  };
}

// ============ MAIN FUNCTION ============

/**
 * Perform earnings call analysis for a ticker
 */
export async function performEarningsCallAnalysis(ticker: string): Promise<EarningsAnalysis> {
  logger.info(`Starting earnings call analysis for ${ticker}`);
  
  // Check cache
  const cached = earningsCache[ticker];
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    logger.info(`Returning cached earnings analysis for ${ticker}`);
    return cached.data;
  }
  
  // Fetch transcripts
  const transcriptsList = await fetchTranscriptsList(ticker);
  
  if (transcriptsList.length === 0) {
    logger.warn(`No transcripts found for ${ticker}, using mock data`);
    const mockData = generateMockData(ticker);
    
    // Cache mock data
    earningsCache[ticker] = {
       mockData,
      timestamp: Date.now()
    };
    
    return mockData;
  }
  
  // Fetch full transcripts
  const transcripts: Transcript[] = [];
  for (const item of transcriptsList) {
    const transcript = await fetchTranscript(item.id);
    if (transcript) {
      transcripts.push(transcript);
    }
  }
  
  if (transcripts.length === 0) {
    logger.warn(`Failed to fetch transcripts for ${ticker}, using mock data`);
    return generateMockData(ticker);
  }
  
  // Analyze latest transcript
  const latestTranscript = transcripts[0];
  const quarter = `Q${latestTranscript.quarter} ${latestTranscript.year}`;
  
  // Calculate metrics
  const evasivenessIndex = calculateEvasivenessIndex(latestTranscript);
  const confidenceScore = calculateConfidenceScore(latestTranscript);
  const sentimentShift = calculateSentimentShift(transcripts);
  
  const overallTone = confidenceScore > 70 && evasivenessIndex < 20 
    ? 'confident' 
    : confidenceScore > 50 
      ? 'cautious' 
      : 'uncertain';
  
  // Extract key quotes
  const keyQuotes = extractKeyQuotes(latestTranscript, quarter);
  
  // Identify key topics
  const keyTopics = identifyKeyTopics(latestTranscript);
  
  // Calculate quarterly trend
  const quarterlyTrend = transcripts.map(t => ({
    quarter: `Q${t.quarter} ${t.year}`,
    confidence: calculateConfidenceScore(t),
    evasiveness: calculateEvasivenessIndex(t),
    sentiment: calculateConfidenceScore(t) - calculateEvasivenessIndex(t)
  }));
  
  // Mock guidance data (in production, fetch from earnings API)
  const guidance = {
    companyGuidance: {
      eps: 0.85 + Math.random() * 0.3,
      revenue: 40 + Math.random() * 10
    },
    consensusEstimate: {
      eps: 0.80 + Math.random() * 0.3,
      revenue: 38 + Math.random() * 10
    },
    beat: Math.random() > 0.3,
    delta: (Math.random() - 0.3) * 10
  };
  
  // Generate signal
  let score = 0;
  const reasons: string[] = [];
  
  if (confidenceScore > 70) {
    score += 30;
    reasons.push(`High confidence score (${confidenceScore.toFixed(0)}/100)`);
  } else if (confidenceScore > 50) {
    score += 15;
    reasons.push(`Moderate confidence (${confidenceScore.toFixed(0)}/100)`);
  }
  
  if (evasivenessIndex < 20) {
    score += 25;
    reasons.push(`Low evasiveness (${evasivenessIndex.toFixed(0)}/100)`);
  } else if (evasivenessIndex < 35) {
    score += 12;
    reasons.push(`Moderate evasiveness (${evasivenessIndex.toFixed(0)}/100)`);
  }
  
  if (guidance.beat && guidance.delta > 3) {
    score += 25;
    reasons.push(`Strong guidance beat (+${guidance.delta.toFixed(1)}%)`);
  } else if (guidance.beat) {
    score += 12;
    reasons.push(`Guidance beat consensus (+${guidance.delta.toFixed(1)}%)`);
  }
  
  if (sentimentShift > 10) {
    score += 20;
    reasons.push(`Positive sentiment shift (+${sentimentShift.toFixed(0)}%)`);
  } else if (sentimentShift < -10) {
    score -= 20;
    reasons.push(`Negative sentiment shift (${sentimentShift.toFixed(0)}%)`);
  }
  
  const signal = score >= 70 ? 'bull' : score <= 30 ? 'bear' : 'flat';
  const strength = signal === 'bull' ? score : signal === 'bear' ? 100 - score : 50;
  
  const analysis: EarningsAnalysis = {
    ticker,
    timestamp: new Date().toISOString(),
    period: `Last ${transcripts.length} quarters`,
    
    tone: {
      evasivenessIndex: Math.round(evasivenessIndex),
      confidenceScore: Math.round(confidenceScore),
      sentimentShift: Math.round(sentimentShift),
      overallTone
    },
    
    guidance,
    keyTopics,
    keyQuotes,
    quarterlyTrend,
    
    signal,
    strength: Math.round(strength),
    reasons
  };
  
  // Cache result
  earningsCache[ticker] = {
     analysis,
    timestamp: Date.now()
  };
  
  logger.info(`Earnings call analysis complete for ${ticker}: ${signal} signal (${strength.toFixed(0)}% strength)`);
  
  return analysis;
}

/**
 * Get cache status
 */
export function getEarningsCacheStatus() {
  return {
    cachedTickers: Object.keys(earningsCache),
    cacheSize: Object.keys(earningsCache).length
  };
}

/**
 * Clear earnings cache
 */
export function clearEarningsCache() {
  Object.keys(earningsCache).forEach(key => delete earningsCache[key]);
  logger.info('Earnings call analysis cache cleared');
}
