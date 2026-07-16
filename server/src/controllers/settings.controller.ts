import { z } from 'zod';
import type { Request, Response } from 'express';
import { db } from '../db/db.js';
import { AppError } from '../middleware/errorHandler.js';
import type { SettingsRow } from '../types/index.js';

function getSettingsRow(): SettingsRow {
  const settings = db.prepare('SELECT * FROM settings WHERE id = 1').get() as SettingsRow | undefined;
  if (!settings) throw new AppError('لم يتم العثور على إعدادات النظام', 404);
  return settings;
}

function toPublicShape(s: SettingsRow) {
  return {
    companyName: s.company_name,
    systemName: s.system_name,
    logoUrl: s.logo_path,
    primaryColor: s.primary_color,
    secondaryColor: s.secondary_color,
    successColor: s.success_color,
    warningColor: s.warning_color,
    dangerColor: s.danger_color,
    defaultTheme: s.default_theme,
  };
}

export async function getSettings(_req: Request, res: Response) {
  res.json(toPublicShape(getSettingsRow()));
}

export async function getPublicSettings(_req: Request, res: Response) {
  res.json(toPublicShape(getSettingsRow()));
}

const updateSettingsSchema = z.object({
  companyName: z.string().min(1).optional(),
  systemName: z.string().min(1).optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  successColor: z.string().optional(),
  warningColor: z.string().optional(),
  dangerColor: z.string().optional(),
  defaultTheme: z.enum(['light', 'dark']).optional(),
});

export async function updateSettings(req: Request, res: Response) {
  const data = updateSettingsSchema.parse(req.body);

  db.prepare(
    `UPDATE settings SET
      company_name = COALESCE(?, company_name),
      system_name = COALESCE(?, system_name),
      primary_color = COALESCE(?, primary_color),
      secondary_color = COALESCE(?, secondary_color),
      success_color = COALESCE(?, success_color),
      warning_color = COALESCE(?, warning_color),
      danger_color = COALESCE(?, danger_color),
      default_theme = COALESCE(?, default_theme),
      updated_at = datetime('now')
    WHERE id = 1`
  ).run(
    data.companyName ?? null,
    data.systemName ?? null,
    data.primaryColor ?? null,
    data.secondaryColor ?? null,
    data.successColor ?? null,
    data.warningColor ?? null,
    data.dangerColor ?? null,
    data.defaultTheme ?? null
  );

  res.json(toPublicShape(getSettingsRow()));
}

export async function uploadLogoHandler(req: Request, res: Response) {
  if (!req.file) throw new AppError('لم يتم إرفاق ملف الشعار', 422);

  const logoUrl = `/uploads/${req.file.filename}`;
  db.prepare(`UPDATE settings SET logo_path = ?, updated_at = datetime('now') WHERE id = 1`).run(logoUrl);

  res.json(toPublicShape(getSettingsRow()));
}
