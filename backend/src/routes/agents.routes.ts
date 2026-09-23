import { Router } from 'express';
import { agentsController } from '../controllers/agents.controller.js';

const router = Router();

router.get('/', agentsController.getAllAgents);
router.get('/:id', agentsController.getAgentById);
router.get('/:id/profile', agentsController.getAgentProfile);

export default router;
