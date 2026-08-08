import { Router } from 'express';
import {
  listPlanItems,
  createPlanItem,
  updatePlanItem,
  deletePlanItem,
} from '../controllers/planItems.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.use(requireAuth);
router.get('/', asyncHandler(listPlanItems));
router.post('/', requireAdmin, asyncHandler(createPlanItem));
router.put('/:id', requireAdmin, asyncHandler(updatePlanItem));
router.delete('/:id', requireAdmin, asyncHandler(deletePlanItem));

export default router;
