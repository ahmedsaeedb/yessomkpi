import { Router } from 'express';
import {
  getSettings,
  getPublicSettings,
  updateSettings,
  uploadLogoHandler,
} from '../controllers/settings.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { uploadLogo } from '../middleware/upload.js';

const router = Router();

router.get('/public', asyncHandler(getPublicSettings));
router.get('/', requireAuth, asyncHandler(getSettings));
router.put('/', requireAuth, asyncHandler(updateSettings));
router.post('/logo', requireAuth, uploadLogo.single('logo'), asyncHandler(uploadLogoHandler));

export default router;
