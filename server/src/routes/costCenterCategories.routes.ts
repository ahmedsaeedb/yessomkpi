import { Router } from 'express';
import {
  listCostCenterCategories,
  createCostCenterCategory,
  updateCostCenterCategory,
  deleteCostCenterCategory,
} from '../controllers/costCenterCategories.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.use(requireAuth);
router.get('/', asyncHandler(listCostCenterCategories));
router.post('/', requireAdmin, asyncHandler(createCostCenterCategory));
router.put('/:id', requireAdmin, asyncHandler(updateCostCenterCategory));
router.delete('/:id', requireAdmin, asyncHandler(deleteCostCenterCategory));

export default router;
