import { Router } from 'express';
import {
  listKpiValues,
  getKpiValue,
  upsertKpiValue,
  deleteKpiValue,
} from '../controllers/kpiValues.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.use(requireAuth, requireAdmin);
router.get('/', asyncHandler(listKpiValues));
router.get('/:id', asyncHandler(getKpiValue));
router.post('/', asyncHandler(upsertKpiValue));
router.delete('/:id', asyncHandler(deleteKpiValue));

export default router;
