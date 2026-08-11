import { Router } from 'express';
import {
  listCorrectiveActions,
  createCorrectiveAction,
  updateCorrectiveAction,
  deleteCorrectiveAction,
} from '../controllers/correctiveActions.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.use(requireAuth);
router.get('/', asyncHandler(listCorrectiveActions));
router.post('/', requireAdmin, asyncHandler(createCorrectiveAction));
router.put('/:id', requireAdmin, asyncHandler(updateCorrectiveAction));
router.delete('/:id', requireAdmin, asyncHandler(deleteCorrectiveAction));

export default router;
