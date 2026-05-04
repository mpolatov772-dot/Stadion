import { Router } from 'express';

import {
  createRequest,
  decideRequest,
  getCurrentUserActiveBlocks,
  getInboxRequests,
  getOutboxRequests,
} from '../controllers/unblockRequestController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { ROLES } from '../utils/constants.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(authenticate);
router.get('/inbox', requireRole(ROLES.STADIUM_OWNER, ROLES.ADMIN), asyncHandler(getInboxRequests));
router.get('/outbox', asyncHandler(getOutboxRequests));
router.get('/active-blocks', asyncHandler(getCurrentUserActiveBlocks));
router.post('/', asyncHandler(createRequest));
router.patch('/:id', requireRole(ROLES.STADIUM_OWNER, ROLES.ADMIN), asyncHandler(decideRequest));

export default router;
