import { Router } from 'express';
import { listRoiEntries, createRoiEntry, updateRoiEntry, deleteRoiEntry } from '../controllers/roi.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.use(requireAuth);
router.get('/', asyncHandler(listRoiEntries));
router.post('/', requireAdmin, asyncHandler(createRoiEntry));
router.put('/:id', requireAdmin, asyncHandler(updateRoiEntry));
router.delete('/:id', requireAdmin, asyncHandler(deleteRoiEntry));

export default router;
