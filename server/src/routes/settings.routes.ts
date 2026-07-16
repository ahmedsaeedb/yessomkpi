import { Router } from 'express';
import {
  getSettings,
  getPublicSettings,
  updateSettings,
  uploadLogoHandler,
} from '../controllers/settings.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { uploadLogo } from '../middleware/upload.js';

const router = Router();

router.get('/public', asyncHandler(getPublicSettings));
router.get('/', requireAuth, requireAdmin, asyncHandler(getSettings));
router.put('/', requireAuth, requireAdmin, asyncHandler(updateSettings));
router.post('/logo', requireAuth, requireAdmin, uploadLogo.single('logo'), asyncHandler(uploadLogoHandler));

export default router;
