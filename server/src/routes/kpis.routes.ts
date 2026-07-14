import { Router } from 'express';
import { listKpis, getKpi, createKpi, updateKpi, deleteKpi } from '../controllers/kpis.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.use(requireAuth);
router.get('/', asyncHandler(listKpis));
router.get('/:id', asyncHandler(getKpi));
router.post('/', asyncHandler(createKpi));
router.put('/:id', asyncHandler(updateKpi));
router.delete('/:id', asyncHandler(deleteKpi));

export default router;
