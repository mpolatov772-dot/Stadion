import { Router } from 'express';

import { getOwnerReport } from '../controllers/reportController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { ROLES } from '../utils/constants.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/owner', authenticate, requireRole(ROLES.STADIUM_OWNER, ROLES.ADMIN), asyncHandler(getOwnerReport));

export default router;
