import type { Request, Response } from 'express';
import { db } from '../db/db.js';
import { getReportData, type ReportFilters } from '../services/reportData.service.js';
import { generateReportPdf } from '../services/pdfService.js';
import { generateReportExcel } from '../services/excelService.js';
import type { SettingsRow } from '../types/index.js';
import path from 'node:path';
import { config } from '../config.js';

function extractFilters(req: Request): ReportFilters {
  const { categoryId, kpiId, year, quarter, status, search } = req.query as Record<string, string>;
  return { categoryId, kpiId, year, quarter, status, search };
}

function getSettings(): SettingsRow {
  return db.prepare('SELECT * FROM settings WHERE id = 1').get() as SettingsRow;
}

export async function listReportData(req: Request, res: Response) {
  const rows = getReportData(extractFilters(req));
  res.json(rows);
}

export async function exportReportPdf(req: Request, res: Response) {
  const rows = getReportData(extractFilters(req));
  const settings = getSettings();

  const logoPath = settings.logo_path ? path.join(config.uploadsDir, path.basename(settings.logo_path)) : null;

  const buffer = await generateReportPdf(rows, {
    companyName: settings.company_name,
    systemName: settings.system_name,
    logoPath,
  });

  logReportGeneration(req, 'pdf');

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="kpi-report.pdf"');
  res.send(buffer);
}

export async function exportReportExcel(req: Request, res: Response) {
  const rows = getReportData(extractFilters(req));
  const settings = getSettings();

  const buffer = await generateReportExcel(rows, {
    companyName: settings.company_name,
    systemName: settings.system_name,
  });

  logReportGeneration(req, 'excel');

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader('Content-Disposition', 'attachment; filename="kpi-report.xlsx"');
  res.send(buffer);
}

function logReportGeneration(req: Request, format: 'pdf' | 'excel') {
  try {
    db.prepare(
      `INSERT INTO reports (name, type, filters_json, format, created_by) VALUES (?, ?, ?, ?, ?)`
    ).run(
      `تقرير مؤشرات الأداء`,
      'kpi-report',
      JSON.stringify(req.query),
      format,
      req.user?.sub ?? null
    );
  } catch {
    // logging failures should not block export
  }
}
