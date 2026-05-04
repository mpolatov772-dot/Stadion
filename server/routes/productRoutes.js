import { Router } from 'express';

import {
  createNewProduct,
  getMyProducts,
  getProductById,
  getProducts,
  updateExistingProduct,
} from '../controllers/productController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { ROLES } from '../utils/constants.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(getProducts));
router.get('/mine/list', authenticate, requireRole(ROLES.SELLER, ROLES.ADMIN), asyncHandler(getMyProducts));
router.get('/:id', asyncHandler(getProductById));
router.post('/', authenticate, requireRole(ROLES.SELLER, ROLES.ADMIN), asyncHandler(createNewProduct));
router.put('/:id', authenticate, requireRole(ROLES.SELLER, ROLES.ADMIN), asyncHandler(updateExistingProduct));

export default router;
