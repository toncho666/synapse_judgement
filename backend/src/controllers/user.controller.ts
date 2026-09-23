import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { userService } from '../services/user.service.js';
import logger from '../utils/logger.js';

export class UserController {
  async getMe(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      
      logger.info('UserController: Get me request', { userId });
      
      const user = await userService.getUserById(userId);
      
      logger.info('UserController: User retrieved', { userId });
      res.json(user);
    } catch (error) {
      logger.error('UserController: Get me failed', { error });
      res.status(404).json({ error: (error as Error).message });
    }
  }

  async updateMe(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      
      logger.info('UserController: Update me request', { userId, data: req.body });
      
      const user = await userService.updateUser(userId, req.body);
      
      logger.info('UserController: User updated', { userId });
      res.json(user);
    } catch (error) {
      logger.error('UserController: Update me failed', { error });
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getStats(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      
      logger.info('UserController: Get stats request', { userId });
      
      const stats = await userService.getUserStats(userId);
      
      logger.info('UserController: Stats retrieved', { userId });
      res.json(stats);
    } catch (error) {
      logger.error('UserController: Get stats failed', { error });
      res.status(500).json({ error: 'Failed to retrieve stats' });
    }
  }
}

export const userController = new UserController();
