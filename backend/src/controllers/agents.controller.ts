import { Request, Response } from 'express';
import { agentsService } from '../services/agents.service.js';
import logger from '../utils/logger.js';

export class AgentsController {
  async getAllAgents(req: Request, res: Response) {
    try {
      logger.info('AgentsController: Get all agents request');
      
      const agents = agentsService.getAllAgents();
      
      logger.info('AgentsController: Agents retrieved', { count: agents.length });
      res.json(agents);
    } catch (error) {
      logger.error('AgentsController: Get all agents failed', { error });
      res.status(500).json({ error: 'Failed to retrieve agents' });
    }
  }

  async getAgentById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      logger.info('AgentsController: Get agent by id request', { id });
      
      const agent = agentsService.getAgentById(id);
      
      logger.info('AgentsController: Agent retrieved', { id });
      res.json(agent);
    } catch (error) {
      logger.error('AgentsController: Get agent by id failed', { error });
      res.status(404).json({ error: (error as Error).message });
    }
  }

  async getAgentProfile(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      logger.info('AgentsController: Get agent profile request', { id });
      
      const profile = agentsService.getAgentProfile(id);
      
      logger.info('AgentsController: Agent profile retrieved', { id });
      res.json(profile);
    } catch (error) {
      logger.error('AgentsController: Get agent profile failed', { error });
      res.status(404).json({ error: (error as Error).message });
    }
  }
}

export const agentsController = new AgentsController();
