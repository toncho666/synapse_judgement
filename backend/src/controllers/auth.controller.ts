import { Request, Response } from 'express';
import { authService } from '../services/auth.service.js';
import logger from '../utils/logger.js';

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      logger.info('AuthController: Register request', { email: req.body.email });
      
      const { email, name, password } = req.body;
      const result = await authService.register({ email, name, password });
      
      logger.info('AuthController: Register successful', { email });
      res.status(201).json(result);
    } catch (error) {
      logger.error('AuthController: Register failed', { error });
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      logger.info('AuthController: Login request', { email: req.body.email });
      
      const { email, password } = req.body;
      const result = await authService.login({ email, password });
      
      logger.info('AuthController: Login successful', { email });
      res.json(result);
    } catch (error) {
      logger.error('AuthController: Login failed', { error });
      res.status(401).json({ error: (error as Error).message });
    }
  }

  async logout(req: Request, res: Response) {
    logger.info('AuthController: Logout request');
    res.json({ message: 'Logged out successfully' });
  }
}

export const authController = new AuthController();
