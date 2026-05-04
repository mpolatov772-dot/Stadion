import { Router } from 'express';

import {
  createNewStadium,
  getStadiumAvailability,
  getMyStadiums,
  getStadiumById,
  getStadiums,
  updateExistingStadium,
} from '../controllers/stadiumController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { ROLES } from '../utils/constants.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(getStadiums));
router.get('/mine/list', authenticate, requireRole(ROLES.STADIUM_OWNER, ROLES.ADMIN), asyncHandler(getMyStadiums));
router.get('/:id/availability', asyncHandler(getStadiumAvailability));
router.get('/:id', asyncHandler(getStadiumById));
router.post('/', authenticate, requireRole(ROLES.STADIUM_OWNER, ROLES.ADMIN), asyncHandler(createNewStadium));
router.put('/:id', authenticate, requireRole(ROLES.STADIUM_OWNER, ROLES.ADMIN), asyncHandler(updateExistingStadium));

export default router;
