import { Router } from 'express';

import {
  createNewBooking,
  getBookingFinanceSummary,
  getMyBookings,
  getOwnerBookings,
  markBookingAsNoShow,
  updateBookingStatus,
} from '../controllers/bookingController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { ROLES } from '../utils/constants.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(authenticate);
router.post('/', asyncHandler(createNewBooking));
router.get('/me', asyncHandler(getMyBookings));
router.get('/owner', requireRole(ROLES.STADIUM_OWNER, ROLES.ADMIN), asyncHandler(getOwnerBookings));
router.get('/finance/summary', requireRole(ROLES.ADMIN), asyncHandler(getBookingFinanceSummary));
router.patch('/:id/status', asyncHandler(updateBookingStatus));
router.post('/:id/no-show', requireRole(ROLES.STADIUM_OWNER, ROLES.ADMIN), asyncHandler(markBookingAsNoShow));

export default router;
