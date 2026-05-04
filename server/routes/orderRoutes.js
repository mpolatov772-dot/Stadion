import { Router } from 'express';

import { createMarketOrder, getMyOrders, getSellerOrders } from '../controllers/orderController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ROLES } from '../utils/constants.js';

const router = Router();

router.use(authenticate);
router.post('/market', asyncHandler(createMarketOrder));
router.get('/me', asyncHandler(getMyOrders));
router.get('/seller', requireRole(ROLES.SELLER, ROLES.ADMIN), asyncHandler(getSellerOrders));

export default router;
