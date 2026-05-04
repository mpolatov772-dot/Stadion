import { Router } from 'express';

import { checkoutProduct, getMyPayments } from '../controllers/paymentController.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(authenticate);
router.get('/me', asyncHandler(getMyPayments));
router.post('/product-checkout', asyncHandler(checkoutProduct));

export default router;
