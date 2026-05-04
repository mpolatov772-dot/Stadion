import { Router } from 'express';

import {
  getOwnerUsers,
  getProfile,
  updatePreferences,
  updateProfile,
} from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(authenticate);
router.get('/me', asyncHandler(getProfile));
router.get('/owner/users', asyncHandler(getOwnerUsers));
router.put('/me', asyncHandler(updateProfile));
router.put('/me/preferences', asyncHandler(updatePreferences));

export default router;
