import { Router } from 'express';
import { dashboardSummary } from '../controllers/dashboard.controller.js';
import { requirePublicOrAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.get('/summary', requirePublicOrAuth, asyncHandler(dashboardSummary));

export default router;
