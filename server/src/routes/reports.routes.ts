import { Router } from 'express';
import { listReportData, exportReportPdf, exportReportExcel } from '../controllers/reports.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.use(requireAuth);
router.get('/', asyncHandler(listReportData));
router.get('/export/pdf', asyncHandler(exportReportPdf));
router.get('/export/excel', asyncHandler(exportReportExcel));

export default router;
