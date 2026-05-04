import { Router } from 'express';

import {
  getConversations,
  getThread,
  sendMessage,
} from '../controllers/messageController.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(authenticate);
router.get('/conversations', asyncHandler(getConversations));
router.get('/thread', asyncHandler(getThread));
router.post('/thread', asyncHandler(sendMessage));

export default router;
