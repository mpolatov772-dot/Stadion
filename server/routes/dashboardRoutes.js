import { Router } from 'express';

import { getSummary } from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/summary', authenticate, asyncHandler(getSummary));

export default router;
