import { Router } from 'express';
import { listUsers, createUser, updateUser, deleteUser } from '../controllers/users.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.use(requireAuth, requireAdmin);
router.get('/', asyncHandler(listUsers));
router.post('/', asyncHandler(createUser));
router.put('/:id', asyncHandler(updateUser));
router.delete('/:id', asyncHandler(deleteUser));

export default router;
