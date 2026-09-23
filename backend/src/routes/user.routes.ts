import { Router } from 'express';
import { z } from 'zod';
import { userController } from '../controllers/user.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  avatar: z.string().optional(),
});

router.get('/me', authMiddleware, userController.getMe);
router.put('/me', authMiddleware, validate(updateSchema), userController.updateMe);
router.get('/me/stats', authMiddleware, userController.getStats);

export default router;
