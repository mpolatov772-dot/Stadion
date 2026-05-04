import { Router } from 'express';

import { createPost, getFeed } from '../controllers/feedController.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(getFeed));
router.post('/', authenticate, asyncHandler(createPost));

export default router;
