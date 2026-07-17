import { Router } from 'express';
import { dashboardSummary, dashboardTrend } from '../controllers/dashboard.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.get('/summary', requireAuth, asyncHandler(dashboardSummary));
router.get('/trend', requireAuth, asyncHandler(dashboardTrend));

export default router;
