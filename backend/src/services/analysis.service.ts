import prisma from '../utils/prisma.js';
import logger from '../utils/logger.js';
import { getStockData } from './stock.service.js';
import { fetchQuote } from './twelvedata.service.js';
import { performTechnicalAnalysis } from './technical-analysis.service.js';
import { performNewsAnalysis } from './news-analysis.service.js';
import { performEarningsCallAnalysis } from './earnings-call.service.js';

// Agent definitions (matching frontend)
const AGENTS = [
  { id: 'tech', name: 'Technical', price: 5 },
  { id: 'fund', name: 'Fundamental', price: 7 },
  { id: 'port', name: 'Portfolio', price: 6 },
  { id: 'news', name: 'News', price: 4 },
  { id: 'earn', name: 'Earning Calls', price: 8 },
];

const JUDGE_PRICE = 15;

export interface RunAnalysisInput {
  ticker: string;
  agents: string[];
  portfolio?: number;
}

export class AnalysisService {
  async runAnalysis(userId: string, input: RunAnalysisInput) {
    logger.info('AnalysisService: Starting analysis', { userId, ticker: input.ticker, agents: input.agents });

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Calculate cost
    const agentsCost = input.agents.reduce((sum, agentId) => {
      const agent = AGENTS.find(a => a.id === agentId);
      return sum + (agent?.price || 0);
    }, 0);

    const judgeCost = input.agents.length > 1 ? 0 : JUDGE_PRICE;
    const totalCost = agentsCost + judgeCost;

    logger.debug('AnalysisService: Cost calculated', { agentsCost, judgeCost, totalCost });

    // Check credits
    if (user.credits < totalCost) {
      logger.warn('AnalysisService: Insufficient credits', { userId, credits: user.credits, required: totalCost });
      throw new Error('Insufficient credits');
    }

    // Create session
    const session = await prisma.session.create({
      data: {
        userId,
        ticker: input.ticker.toUpperCase(),
        agents: input.agents,
        portfolio: input.portfolio,
        status: 'RUNNING',
        cost: totalCost,
      },
    });

    logger.info('AnalysisService: Session created', { sessionId: session.id });

    // Deduct credits
    await prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: totalCost } },
    });

    // Create transaction
    await prisma.transaction.create({
      data: {
        userId,
        type: 'ANALYSIS',
        amount: -totalCost,
        description: `Analysis for ${input.ticker}`,
        sessionId: session.id,
      },
    });

    // Simulate analysis (in production, this would call AI models)
    setTimeout(async () => {
      await this.completeAnalysis(session.id, input);
    }, 2000); // Simulate 2 second processing time

    return {
      sessionId: session.id,
      status: 'RUNNING',
      cost: totalCost,
      estimatedTime: 90,
    };
  }

  private async completeAnalysis(sessionId: string, input: RunAnalysisInput) {
    logger.info('AnalysisService: Completing analysis', { sessionId });

    try {
      // Resolve the current price for this ticker.
      // NEVER fall back to a made-up number (the old hardcoded $100 leaked into the UI
      // whenever the dashboard cache was empty). Priority:
      //   1. cached dashboard quote from stock.service (Twelve Data multi-symbol)
      //   2. direct single-symbol Twelve Data quote
      //   3. latest close from the technical analysis result (patched in further below)
      let basePrice = 0;
      let priceChange = 0;
      let dataSource = 'unknown';

      try {
        logger.info('AnalysisService: Fetching stock data', { ticker: input.ticker });
        const stockData = await getStockData();

        logger.debug('AnalysisService: Stock data received', {
          quotesCount: stockData.quotes.length,
          lastUpdated: stockData.lastUpdated
        });

        const stockQuote = stockData.quotes.find(q => q.symbol === input.ticker.toUpperCase());

        if (stockQuote) {
          basePrice = stockQuote.price;
          priceChange = stockQuote.changePercent;

          // stock.service returns only real Twelve Data quotes (or nothing) - there is no mock
          // generator, so any quote here is real. (The old heuristic mislabeled valid
          // prices as MOCK based on arbitrary price/change ranges.)
          dataSource = 'REAL';

          logger.info('AnalysisService: Stock price obtained', {
            ticker: input.ticker,
            price: basePrice,
            change: priceChange,
            source: dataSource,
            timestamp: stockQuote.timestamp
          });
        } else {
          logger.warn('AnalysisService: Ticker not present in dashboard cache, will try direct quote', {
            ticker: input.ticker,
            availableSymbols: stockData.quotes.map(q => q.symbol)
          });
        }
      } catch (error) {
        logger.warn('AnalysisService: Failed to fetch dashboard stock data, will use direct quote', {
          ticker: input.ticker,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      // Fallback: direct single-symbol Twelve Data quote (shared rate-limit queue spaces calls)
      if (basePrice <= 0) {
        try {
          const directQuote = await fetchQuote(input.ticker.toUpperCase());
          if (directQuote) {
            basePrice = directQuote.price;
            priceChange = directQuote.changePercent;
            dataSource = 'REAL_DIRECT';
            logger.info('AnalysisService: Stock price obtained via direct Twelve Data quote', {
              ticker: input.ticker,
              price: basePrice,
              change: priceChange
            });
          }
        } catch (error) {
          logger.warn('AnalysisService: Direct quote lookup failed', {
            ticker: input.ticker,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      // (final verdict/confidence/target price are computed from the weighted agent scores below)

      // Create agent verdicts - use real data for tech/news/earn, mock for fund/port
      type AgentVerdictResult = {
        agentId: string;
        signal: 'BULL' | 'BEAR' | 'FLAT';
        score: number;
        confidence: number;
        lines: string[];
        metrics: Array<{ label: string; value: string }>;
      };
      const agentVerdicts: AgentVerdictResult[] = await Promise.all(input.agents.map(async (agentId): Promise<AgentVerdictResult> => {
        // For Technical, News, and Earnings agents - use real API data
        if (agentId === 'tech') {
          try {
            console.log(`🔍 [AnalysisService] Fetching REAL technical analysis for ${input.ticker}`);
            logger.info(`Fetching REAL technical analysis for ${input.ticker}`);
            const techAnalysis = await performTechnicalAnalysis(input.ticker);
            console.log(`✅ [AnalysisService] Technical analysis completed for ${input.ticker}: ${techAnalysis.recommendation} (${techAnalysis.confidence}%)`);
            
            // Check if we got real data or "no data" response
            if (techAnalysis.confidence === 0 && techAnalysis.currentPrice === 0) {
              logger.warn(`⚠️  No data available for technical analysis of ${input.ticker}`);
              return {
                agentId,
                signal: 'FLAT',
                score: 0,
                confidence: 0,
                lines: [
                  'No data available',
                  'Twelve Data API did not return historical data',
                  'Please try again later or check API limits',
                ],
                metrics: [
                  { label: 'RSI', value: 'N/A' },
                  { label: 'MACD', value: 'N/A' },
                  { label: 'SMA 200', value: 'N/A' },
                ],
              };
            }
            
            return {
              agentId,
              signal: techAnalysis.recommendation === 'BUY' ? 'BULL' : 
                      techAnalysis.recommendation === 'SELL' ? 'BEAR' : 'FLAT',
              score: techAnalysis.confidence / 100,
              confidence: techAnalysis.confidence,
              lines: [
                `Price: $${techAnalysis.currentPrice.toFixed(2)}`,
                `Recommendation: ${techAnalysis.recommendation} (${Math.round(techAnalysis.confidence)}% confidence)`,
                `Support: $${techAnalysis.support?.toFixed(2) || 'N/A'}, Resistance: $${techAnalysis.resistance?.toFixed(2) || 'N/A'}`,
              ],
              metrics: [
                { label: 'RSI', value: techAnalysis.indicators.rsi14?.toFixed(1) || 'N/A' },
                { label: 'MACD', value: techAnalysis.indicators.macd?.histogram.toFixed(2) || 'N/A' },
                { label: 'SMA 200', value: techAnalysis.indicators.sma200 ? `$${techAnalysis.indicators.sma200.toFixed(2)}` : 'N/A' },
              ],
            };
          } catch (error) {
            logger.error(`Failed to fetch technical analysis for ${input.ticker}:`, error);
            return {
              agentId,
              signal: 'FLAT',
              score: 0,
              confidence: 0,
              lines: [
                'Error fetching technical analysis',
                'API request failed',
                'Please try again later',
              ],
              metrics: [
                { label: 'RSI', value: 'N/A' },
                { label: 'MACD', value: 'N/A' },
                { label: 'SMA 200', value: 'N/A' },
              ],
            };
          }
        }
        
        if (agentId === 'news') {
          try {
            console.log(`🔍 [AnalysisService] Fetching REAL news analysis for ${input.ticker}`);
            logger.info(`Fetching REAL news analysis for ${input.ticker}`);
            const newsAnalysis = await performNewsAnalysis(input.ticker);
            console.log(`✅ [AnalysisService] News analysis completed for ${input.ticker}: ${newsAnalysis.signal} (${newsAnalysis.strength}%)`);

            // No data: strength 50 is the neutral default - report confidence 0 so this agent
            // does not pollute the weighted composite (previously a "flat" no-news agent was
            // counted as 50% "data" and dragged every verdict toward BUY).
            if (newsAnalysis.statistics.totalNews === 0) {
              logger.warn(`No news data available for ${input.ticker}`);
              return {
                agentId,
                signal: 'FLAT',
                score: 0,
                confidence: 0,
                lines: [
                  'No recent news available',
                  'Alpha Vantage NEWS_SENTIMENT returned no articles (or API quota exceeded)',
                  'Check backend logs / try again later',
                ],
                metrics: [
                  { label: 'Sentiment', value: 'N/A' },
                  { label: 'Positivity Ratio', value: 'N/A' },
                  { label: 'Confidence', value: 'N/A' },
                ],
              };
            }

            return {
              agentId,
              signal: newsAnalysis.signal === 'bull' ? 'BULL' : 
                      newsAnalysis.signal === 'bear' ? 'BEAR' : 'FLAT',
              // Signed direction from sentiment score (-1..+1), NOT unsigned strength.
              score: Math.max(-1, Math.min(1, newsAnalysis.sentiment.score)),
              confidence: newsAnalysis.sentiment.confidence,
              lines: [
                `Sentiment: ${newsAnalysis.sentiment.label} (${newsAnalysis.sentiment.score.toFixed(2)})`,
                `Trend: ${newsAnalysis.sentiment.trend}`,
                `Total news: ${newsAnalysis.statistics.totalNews} (Positive: ${newsAnalysis.statistics.positive}, Negative: ${newsAnalysis.statistics.negative})`,
              ],
              metrics: [
                { label: 'Sentiment', value: `${(newsAnalysis.sentiment.score * 100).toFixed(0)}%` },
                { label: 'Positivity Ratio', value: newsAnalysis.statistics.positivityRatio.toFixed(2) },
                { label: 'Confidence', value: `${newsAnalysis.sentiment.confidence}%` },
              ],
            };
          } catch (error) {
            logger.error(`Failed to fetch news analysis for ${input.ticker}:`, error);
            return {
              agentId,
              signal: 'FLAT',
              score: 0,
              confidence: 0,
              lines: [
                'No data available',
                'News API did not return data',
                'Please try again later',
              ],
              metrics: [
                { label: 'Sentiment', value: 'N/A' },
                { label: 'Positivity Ratio', value: 'N/A' },
                { label: 'Confidence', value: 'N/A' },
              ],
            };
          }
        }
        
        if (agentId === 'earn') {
          try {
            console.log(`🔍 [AnalysisService] Fetching REAL earnings call analysis for ${input.ticker}`);
            logger.info(`Fetching REAL earnings call analysis for ${input.ticker}`);
            const earningsAnalysis = await performEarningsCallAnalysis(input.ticker);
            console.log(`✅ [AnalysisService] Earnings analysis completed for ${input.ticker}: ${earningsAnalysis.signal} (${earningsAnalysis.strength}%)`);
            
            return {
              agentId,
              signal: earningsAnalysis.signal === 'bull' ? 'BULL' : 
                      earningsAnalysis.signal === 'bear' ? 'BEAR' : 'FLAT',
              // Signed direction from tone/sentiment, not unsigned strength (avoids BUY bias)
              score: Math.max(-1, Math.min(1, earningsAnalysis.tone.sentimentShift / 100)),
              confidence: earningsAnalysis.strength,
              lines: [
                `Tone: ${earningsAnalysis.tone.overallTone} (Confidence: ${earningsAnalysis.tone.confidenceScore}/100)`,
                `Evasiveness: ${earningsAnalysis.tone.evasivenessIndex}/100`,
                `Guidance: ${earningsAnalysis.guidance.beat ? 'Beat' : 'Missed'} consensus by ${earningsAnalysis.guidance.delta.toFixed(1)}%`,
              ],
              metrics: [
                { label: 'Confidence', value: `${earningsAnalysis.tone.confidenceScore}/100` },
                { label: 'Evasiveness', value: `${earningsAnalysis.tone.evasivenessIndex}/100` },
                { label: 'Sentiment Shift', value: `${earningsAnalysis.tone.sentimentShift >= 0 ? '+' : ''}${earningsAnalysis.tone.sentimentShift}%` },
              ],
            };
          } catch (error) {
            logger.error(`Failed to fetch earnings analysis for ${input.ticker}:`, error);
            return {
              agentId,
              signal: 'FLAT',
              score: 0,
              confidence: 0,
              lines: [
                'No data available',
                'Earnings API did not return data',
                'Please try again later',
              ],
              metrics: [
                { label: 'Confidence', value: 'N/A' },
                { label: 'Evasiveness', value: 'N/A' },
                { label: 'Sentiment Shift', value: 'N/A' },
              ],
            };
          }
        }
        
        // For Fundamental and Portfolio agents - NO DATA AVAILABLE
        console.log(`⚠️  [AnalysisService] ${agentId} agent does not have real API integration yet`);
        logger.warn(`⚠️  ${agentId} agent does not have real API integration yet`);
        return {
          agentId,
          signal: 'FLAT',
          score: 0,
          confidence: 0,
          lines: [
            'No data available',
            'This agent does not have API integration yet',
            'Coming soon',
          ],
          metrics: [
            { label: 'Status', value: 'Not available' },
            { label: 'Data source', value: 'N/A' },
            { label: 'Confidence', value: 'N/A' },
          ],
        };
      }));

      // Fallback 3: if we still have no price (dashboard cache empty AND direct quote failed),
      // reuse the latest close from the technical analysis history instead of a fake number.
      if (basePrice <= 0) {
        const tech = agentVerdicts.find(v => v.agentId === 'tech');
        const priceLine = tech?.lines.find(l => l.startsWith('Price: $'));
        const parsed = priceLine ? parseFloat(priceLine.replace('Price: $', '')) : NaN;
        if (!Number.isNaN(parsed) && parsed > 0) {
          basePrice = parsed;
          dataSource = 'REAL_FROM_HISTORY';
          logger.info('AnalysisService: Using latest historical close as base price', {
            ticker: input.ticker,
            price: basePrice
          });
        } else {
          dataSource = 'NONE';
          logger.error('AnalysisService: No real price available for ticker', { ticker: input.ticker });
        }
      }

      // Calculate consensus from agent verdicts
      const consensusBull = agentVerdicts.filter(v => v.signal === 'BULL').length;
      const consensusFlat = agentVerdicts.filter(v => v.signal === 'FLAT').length;
      const consensusBear = agentVerdicts.filter(v => v.signal === 'BEAR').length;

      // Calculate weighted composite score based on agent confidence
      const totalConfidence = agentVerdicts.reduce((sum, v) => sum + v.confidence, 0);
      const weightedComposite = totalConfidence > 0
        ? agentVerdicts.reduce((sum, v) => {
            const weight = v.confidence / totalConfidence;
            return sum + (v.score * weight);
          }, 0)
        : 0; // no agent had real data -> neutral composite, not a random BUY/HOLD

      // Determine final verdict based on weighted composite
      const finalVerdict = weightedComposite >= 0.28 ? 'BUY' : 
                          weightedComposite <= -0.28 ? 'SELL' : 'HOLD';
      const finalVerdictWord = finalVerdict === 'BUY' ? 'Buy' : 
                              finalVerdict === 'SELL' ? 'Sell' : 'Hold';
      const finalConfidence = totalConfidence > 0
        ? Math.floor(50 + Math.abs(weightedComposite) * 40)
        : 0; // no real data -> report zero confidence instead of a fake 50+
      const finalTargetPrice = basePrice * (1 + weightedComposite * 0.3);

      // Determine data sources for rationale
      const agentsWithData = agentVerdicts.filter(v => v.confidence > 0);
      const agentsWithoutData = agentVerdicts.filter(v => v.confidence === 0);

      // Update session
      await prisma.session.update({
        where: { id: sessionId },
        data: {
          status: 'COMPLETED',
          verdict: finalVerdict,
          verdictWord: finalVerdictWord,
          confidence: finalConfidence,
          targetPrice: finalTargetPrice,
          basePrice,
          composite: weightedComposite,
          consensusBull,
          consensusFlat,
          consensusBear,
          rationale: [
            `${Math.max(consensusBull, consensusFlat, consensusBear)} of ${input.agents.length} agents on the same side.`,
            `Weighted composite signal: ${(weightedComposite * 100).toFixed(1)} pts out of 100.`,
            `Final confidence level: ${finalConfidence}%.`,
            agentsWithData.length > 0 ? 
              `Data available for: ${agentsWithData.map(v => v.agentId).join(', ')}` : 
              'No data available from any agent.',
            agentsWithoutData.length > 0 ? 
              `No data for: ${agentsWithoutData.map(v => v.agentId).join(', ')}` : 
              'All selected agents returned data.',
          ],
          completedAt: new Date(),
          agentVerdicts: {
            create: agentVerdicts,
          },
        },
      });

      logger.info('AnalysisService: Analysis completed', { 
        sessionId, 
        verdict: finalVerdict, 
        confidence: finalConfidence,
        agentsWithData: agentsWithData.length,
        agentsWithoutData: agentsWithoutData.length
      });
    } catch (error) {
      logger.error('AnalysisService: Analysis failed', { sessionId, error });
      await prisma.session.update({
        where: { id: sessionId },
        data: { status: 'FAILED' },
      });
    }
  }

  async getSession(sessionId: string, userId: string) {
    logger.debug('AnalysisService: Getting session', { sessionId, userId });

    const session = await prisma.session.findFirst({
      where: {
        id: sessionId,
        userId,
      },
      include: {
        agentVerdicts: true,
      },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    return session;
  }

  async getHistory(userId: string) {
    logger.debug('AnalysisService: Getting history', { userId });

    const sessions = await prisma.session.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        agentVerdicts: true,
      },
    });

    return sessions;
  }

}

export const analysisService = new AnalysisService();
