import prisma from '../utils/prisma.js';
import logger from '../utils/logger.js';
import { getStockData } from './stock.service.js';

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
      // Get real stock data
      let basePrice = 100; // Default fallback
      let priceChange = 0;
      
      try {
        const stockData = await getStockData();
        const stockQuote = stockData.quotes.find(q => q.symbol === input.ticker.toUpperCase());
        
        if (stockQuote) {
          basePrice = stockQuote.price;
          priceChange = stockQuote.changePercent;
          logger.info('AnalysisService: Using real stock price', { 
            ticker: input.ticker, 
            price: basePrice, 
            change: priceChange 
          });
        } else {
          logger.warn('AnalysisService: Stock not found in data, using fallback price', { 
            ticker: input.ticker 
          });
        }
      } catch (error) {
        logger.warn('AnalysisService: Failed to fetch stock data, using fallback price', { 
          ticker: input.ticker, 
          error 
        });
      }

      // Generate analysis results based on real price and change
      const composite = priceChange > 0 ? Math.min(priceChange / 10, 1) : Math.max(priceChange / 10, -1);
      const verdict = composite >= 0.28 ? 'BUY' : composite <= -0.28 ? 'SELL' : 'HOLD';
      const verdictWord = verdict === 'BUY' ? 'Buy' : verdict === 'SELL' ? 'Sell' : 'Hold';
      const confidence = Math.floor(50 + Math.abs(composite) * 40);
      const targetPrice = basePrice * (1 + composite * 0.3);

      // Create agent verdicts based on real data
      const agentVerdicts = input.agents.map(agentId => {
        // Generate score based on price change with some randomness per agent
        const agentBias = (Math.random() - 0.5) * 0.3; // Random bias between -0.15 and 0.15
        const score = Math.max(-1, Math.min(1, composite + agentBias));
        const signal = score > 0.18 ? 'BULL' : score < -0.18 ? 'BEAR' : 'FLAT';
        const agentConfidence = Math.floor(54 + Math.random() * 41);

        // Generate realistic lines based on agent type and price movement
        const lines = this.generateAgentLines(agentId, score, basePrice, priceChange);
        const metrics = this.generateAgentMetrics(agentId, score, basePrice);

        return {
          agentId,
          signal,
          score,
          confidence: agentConfidence,
          lines,
          metrics,
        };
      });

      // Calculate consensus
      const consensusBull = agentVerdicts.filter(v => v.signal === 'BULL').length;
      const consensusFlat = agentVerdicts.filter(v => v.signal === 'FLAT').length;
      const consensusBear = agentVerdicts.filter(v => v.signal === 'BEAR').length;

      // Update session
      await prisma.session.update({
        where: { id: sessionId },
        data: {
          status: 'COMPLETED',
          verdict,
          verdictWord,
          confidence,
          targetPrice,
          basePrice,
          composite,
          consensusBull,
          consensusFlat,
          consensusBear,
          rationale: [
            `${Math.max(consensusBull, consensusFlat, consensusBear)} of ${input.agents.length} agents on the same side.`,
            `Composite signal ${(composite * 100).toFixed(1)} pts out of 100.`,
            `Confidence level: ${confidence}%.`,
          ],
          completedAt: new Date(),
          agentVerdicts: {
            create: agentVerdicts,
          },
        },
      });

      logger.info('AnalysisService: Analysis completed', { sessionId, verdict, confidence });
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

  // Helper method to generate realistic agent lines
  private generateAgentLines(agentId: string, score: number, price: number, change: number): string[] {
    const direction = score > 0 ? 'bullish' : score < 0 ? 'bearish' : 'neutral';
    const changeStr = change >= 0 ? `+${change.toFixed(2)}%` : `${change.toFixed(2)}%`;
    
    switch (agentId) {
      case 'tech':
        return [
          `Price action shows ${direction} momentum at $${price.toFixed(2)}`,
          `Technical indicators suggest ${score > 0.3 ? 'strong buying pressure' : score < -0.3 ? 'selling pressure' : 'consolidation'}`,
          `Daily change: ${changeStr}, trend alignment: ${Math.abs(score) > 0.5 ? 'strong' : 'moderate'}`,
        ];
      case 'fund':
        return [
          `Fundamental analysis at current price $${price.toFixed(2)}`,
          `Valuation metrics indicate ${score > 0 ? 'attractive entry' : score < 0 ? 'overvaluation risk' : 'fair value'}`,
          `Financial health score: ${(50 + score * 30).toFixed(0)}/100`,
        ];
      case 'port':
        return [
          `Portfolio impact analysis for $${price.toFixed(2)} position`,
          `Risk-adjusted return potential: ${score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral'}`,
          `Correlation with market: ${(0.5 + Math.abs(score) * 0.3).toFixed(2)}`,
        ];
      case 'news':
        return [
          `News sentiment analysis for current price action`,
          `Media coverage indicates ${score > 0.2 ? 'positive developments' : score < -0.2 ? 'concerns' : 'mixed signals'}`,
          `Sentiment score: ${(score * 100).toFixed(0)}/100`,
        ];
      case 'earn':
        return [
          `Earnings analysis at $${price.toFixed(2)}`,
          `Recent earnings ${score > 0 ? 'exceeded expectations' : score < 0 ? 'missed expectations' : 'met expectations'}`,
          `Forward guidance: ${score > 0.3 ? 'strong' : score < -0.3 ? 'weak' : 'stable'}`,
        ];
      default:
        return [
          `Analysis complete for ${agentId}`,
          `Score: ${score.toFixed(2)}`,
          `Price: $${price.toFixed(2)}`,
        ];
    }
  }

  // Helper method to generate realistic agent metrics
  private generateAgentMetrics(agentId: string, score: number, price: number): Array<{ label: string; value: string }> {
    switch (agentId) {
      case 'tech':
        return [
          { label: 'RSI', value: (30 + Math.abs(score) * 40).toFixed(1) },
          { label: 'MACD', value: (score * 2).toFixed(2) },
          { label: 'Volume', value: `${(50 + Math.random() * 50).toFixed(0)}%` },
        ];
      case 'fund':
        return [
          { label: 'P/E', value: (15 + Math.random() * 20).toFixed(1) },
          { label: 'P/B', value: (1 + Math.random() * 5).toFixed(2) },
          { label: 'ROE', value: `${(10 + score * 15).toFixed(1)}%` },
        ];
      case 'port':
        return [
          { label: 'Beta', value: (0.8 + Math.random() * 0.4).toFixed(2) },
          { label: 'Sharpe', value: (score * 2).toFixed(2) },
          { label: 'Volatility', value: `${(15 + Math.random() * 10).toFixed(1)}%` },
        ];
      case 'news':
        return [
          { label: 'Sentiment', value: `${(score * 100).toFixed(0)}%` },
          { label: 'Mentions', value: `${Math.floor(100 + Math.random() * 900)}` },
          { label: 'Impact', value: score > 0.3 ? 'High' : score < -0.3 ? 'High' : 'Medium' },
        ];
      case 'earn':
        return [
          { label: 'EPS Beat', value: `${(score * 10).toFixed(1)}%` },
          { label: 'Revenue', value: `${(score * 5).toFixed(1)}%` },
          { label: 'Guidance', value: score > 0 ? 'Up' : score < 0 ? 'Down' : 'Maintained' },
        ];
      default:
        return [
          { label: 'Score', value: score.toFixed(2) },
          { label: 'Confidence', value: `${(50 + Math.abs(score) * 30).toFixed(0)}%` },
        ];
    }
  }
}

export const analysisService = new AnalysisService();
