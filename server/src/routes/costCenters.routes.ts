import { Router } from 'express';
import {
  listCostCenters,
  getCostCenter,
  createCostCenter,
  updateCostCenter,
  deleteCostCenter,
} from '../controllers/costCenters.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.use(requireAuth);
router.get('/', asyncHandler(listCostCenters));
router.get('/:id', asyncHandler(getCostCenter));
router.post('/', requireAdmin, asyncHandler(createCostCenter));
router.put('/:id', requireAdmin, asyncHandler(updateCostCenter));
router.delete('/:id', requireAdmin, asyncHandler(deleteCostCenter));

export default router;
