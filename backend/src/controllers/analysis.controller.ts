import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { analysisService } from '../services/analysis.service.js';
import logger from '../utils/logger.js';

export class AnalysisController {
  async runAnalysis(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      logger.info('AnalysisController: Run analysis request', { userId, ticker: req.body.ticker });

      const { ticker, agents, portfolio } = req.body;
      const result = await analysisService.runAnalysis(userId, { ticker, agents, portfolio });

      logger.info('AnalysisController: Analysis started', { sessionId: result.sessionId });
      res.status(201).json(result);
    } catch (error) {
      logger.error('AnalysisController: Run analysis failed', { error });
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getSession(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      
      logger.info('AnalysisController: Get session request', { userId, sessionId: id });
      
      const session = await analysisService.getSession(id, userId);
      
      logger.info('AnalysisController: Session retrieved', { sessionId: id });
      res.json(session);
    } catch (error) {
      logger.error('AnalysisController: Get session failed', { error });
      res.status(404).json({ error: (error as Error).message });
    }
  }

  async getHistory(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      
      logger.info('AnalysisController: Get history request', { userId });
      
      const sessions = await analysisService.getHistory(userId);
      
      logger.info('AnalysisController: History retrieved', { count: sessions.length });
      res.json(sessions);
    } catch (error) {
      logger.error('AnalysisController: Get history failed', { error });
      res.status(500).json({ error: 'Failed to retrieve history' });
    }
  }
}

export const analysisController = new AnalysisController();
