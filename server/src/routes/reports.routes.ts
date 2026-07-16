import { Router } from 'express';
import { listReportData, exportReportPdf, exportReportExcel } from '../controllers/reports.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.use(requireAuth, requireAdmin);
router.get('/', asyncHandler(listReportData));
router.get('/export/pdf', asyncHandler(exportReportPdf));
router.get('/export/excel', asyncHandler(exportReportExcel));

export default router;
