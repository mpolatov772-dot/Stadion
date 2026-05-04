import { Router } from 'express';

import {
  createManualBlock,
  getMyBlocks,
  getOwnerBlocks,
  updateOwnerBlockStatus,
} from '../controllers/blockController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { ROLES } from '../utils/constants.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(authenticate);
router.get('/me', asyncHandler(getMyBlocks));
router.get('/owner', requireRole(ROLES.STADIUM_OWNER, ROLES.ADMIN), asyncHandler(getOwnerBlocks));
router.post('/', requireRole(ROLES.STADIUM_OWNER, ROLES.ADMIN), asyncHandler(createManualBlock));
router.patch('/:id', requireRole(ROLES.STADIUM_OWNER, ROLES.ADMIN), asyncHandler(updateOwnerBlockStatus));

export default router;
