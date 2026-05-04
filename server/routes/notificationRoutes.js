import { Router } from 'express';

import {
  deleteNotificationById,
  getMyNotifications,
  markAllNotificationsRead,
} from '../controllers/notificationController.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(authenticate);
router.get('/', asyncHandler(getMyNotifications));
router.post('/mark-all-read', asyncHandler(markAllNotificationsRead));
router.delete('/:id', asyncHandler(deleteNotificationById));

export default router;
