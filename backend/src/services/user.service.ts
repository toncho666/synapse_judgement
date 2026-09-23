import prisma from '../utils/prisma.js';
import logger from '../utils/logger.js';

export class UserService {
  async getUserById(userId: string) {
    logger.debug('UserService: Getting user by id', { userId });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        plan: true,
        credits: true,
        referralCode: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async updateUser(userId: string, data: { name?: string; avatar?: string }) {
    logger.info('UserService: Updating user', { userId, data });

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        plan: true,
        credits: true,
        referralCode: true,
        createdAt: true,
      },
    });

    return user;
  }

  async getUserStats(userId: string) {
    logger.debug('UserService: Getting user stats', { userId });

    const sessions = await prisma.session.findMany({
      where: { userId, status: 'COMPLETED' },
    });

    const totalSessions = sessions.length;
    const totalSpent = sessions.reduce((sum, s) => sum + s.cost, 0);
    const avgConfidence = sessions.length > 0
      ? Math.round(sessions.reduce((sum, s) => sum + (s.confidence || 0), 0) / sessions.length)
      : 0;

    const agentUsage: Record<string, number> = {};
    sessions.forEach(s => {
      s.agents.forEach(a => {
        agentUsage[a] = (agentUsage[a] || 0) + 1;
      });
    });

    const verdictDistribution = {
      BUY: sessions.filter(s => s.verdict === 'BUY').length,
      HOLD: sessions.filter(s => s.verdict === 'HOLD').length,
      SELL: sessions.filter(s => s.verdict === 'SELL').length,
    };

    return {
      totalSessions,
      totalSpent,
      avgConfidence,
      agentUsage,
      verdictDistribution,
    };
  }
}

export const userService = new UserService();
