import prisma from '../utils/prisma.js';
import logger from '../utils/logger.js';

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
      // Generate mock analysis results
      const basePrice = 100 + Math.random() * 900;
      const composite = (Math.random() - 0.5) * 2; // -1 to 1
      const verdict = composite >= 0.28 ? 'BUY' : composite <= -0.28 ? 'SELL' : 'HOLD';
      const verdictWord = verdict === 'BUY' ? 'Buy' : verdict === 'SELL' ? 'Sell' : 'Hold';
      const confidence = Math.floor(50 + Math.abs(composite) * 40);
      const targetPrice = basePrice * (1 + composite * 0.3);

      // Create agent verdicts
      const agentVerdicts = input.agents.map(agentId => {
        const score = (Math.random() - 0.5) * 2;
        const signal = score > 0.18 ? 'BULL' : score < -0.18 ? 'BEAR' : 'FLAT';
        const agentConfidence = Math.floor(54 + Math.random() * 41);

        return {
          agentId,
          signal,
          score,
          confidence: agentConfidence,
          lines: [
            `Analysis line 1 for ${agentId}`,
            `Analysis line 2 for ${agentId}`,
            `Analysis line 3 for ${agentId}`,
          ],
          metrics: [
            { label: 'Metric 1', value: (Math.random() * 100).toFixed(1) },
            { label: 'Metric 2', value: (Math.random() * 100).toFixed(1) },
          ],
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
}

export const analysisService = new AnalysisService();
