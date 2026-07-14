import { z } from 'zod';
import type { Request, Response } from 'express';
import { db } from '../db/db.js';
import { AppError } from '../middleware/errorHandler.js';
import type { KpiRow } from '../types/index.js';
import { calculateKpiMetrics, currentYear } from '../utils/calculations.js';

const kpiSchema = z.object({
  categoryId: z.number().int(),
  name: z.string().min(1, 'اسم المؤشر مطلوب'),
  description: z.string().optional().nullable(),
  unit: z.string().min(1).default('رقم'),
  target: z.number().default(0),
  color: z.string().default('#0B2545'),
  icon: z.string().default('TrendingUp'),
  sortOrder: z.number().int().default(0),
  status: z.enum(['active', 'inactive']).default('active'),
  notes: z.string().optional().nullable(),
});

function attachLatestValue(kpi: KpiRow) {
  const latest = db
    .prepare(
      `SELECT * FROM kpi_values WHERE kpi_id = ? AND year = ? ORDER BY
        CASE quarter WHEN 'Q4' THEN 4 WHEN 'Q3' THEN 3 WHEN 'Q2' THEN 2 ELSE 1 END DESC
        LIMIT 1`
    )
    .get(kpi.id, currentYear()) as
    | { current_value: number; previous_value: number; target: number; quarter: string }
    | undefined;

  const metrics = latest
    ? calculateKpiMetrics(latest.current_value, latest.previous_value, latest.target || kpi.target)
    : calculateKpiMetrics(0, 0, kpi.target);

  return {
    ...kpi,
    latestValue: latest?.current_value ?? null,
    latestQuarter: latest?.quarter ?? null,
    ...metrics,
  };
}

export async function listKpis(req: Request, res: Response) {
  const { search, status, categoryId } = req.query as {
    search?: string;
    status?: string;
    categoryId?: string;
  };

  let query = `SELECT k.*, c.name as category_name FROM kpis k
    JOIN categories c ON c.id = k.category_id WHERE 1=1`;
  const params: unknown[] = [];

  if (search) {
    query += ' AND (k.name LIKE ? OR k.description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  if (status) {
    query += ' AND k.status = ?';
    params.push(status);
  }
  if (categoryId) {
    query += ' AND k.category_id = ?';
    params.push(categoryId);
  }

  query += ' ORDER BY k.sort_order ASC, k.id ASC';

  const rows = db.prepare(query).all(...params) as KpiRow[];
  res.json(rows.map(attachLatestValue));
}

export async function getKpi(req: Request, res: Response) {
  const kpi = db.prepare('SELECT * FROM kpis WHERE id = ?').get(req.params.id) as
    | KpiRow
    | undefined;
  if (!kpi) throw new AppError('المؤشر غير موجود', 404);
  res.json(attachLatestValue(kpi));
}

export async function createKpi(req: Request, res: Response) {
  const data = kpiSchema.parse(req.body);

  const category = db.prepare('SELECT id FROM categories WHERE id = ?').get(data.categoryId);
  if (!category) throw new AppError('الفئة المحددة غير موجودة', 422);

  const info = db
    .prepare(
      `INSERT INTO kpis (category_id, name, description, unit, target, color, icon, sort_order, status, notes, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
    )
    .run(
      data.categoryId,
      data.name,
      data.description ?? null,
      data.unit,
      data.target,
      data.color,
      data.icon,
      data.sortOrder,
      data.status,
      data.notes ?? null
    );

  const kpi = db.prepare('SELECT * FROM kpis WHERE id = ?').get(info.lastInsertRowid) as KpiRow;
  res.status(201).json(attachLatestValue(kpi));
}

export async function updateKpi(req: Request, res: Response) {
  const existing = db.prepare('SELECT * FROM kpis WHERE id = ?').get(req.params.id) as
    | KpiRow
    | undefined;
  if (!existing) throw new AppError('المؤشر غير موجود', 404);

  const data = kpiSchema.partial().parse(req.body);

  if (data.categoryId) {
    const category = db.prepare('SELECT id FROM categories WHERE id = ?').get(data.categoryId);
    if (!category) throw new AppError('الفئة المحددة غير موجودة', 422);
  }

  db.prepare(
    `UPDATE kpis SET
      category_id = COALESCE(?, category_id),
      name = COALESCE(?, name),
      description = COALESCE(?, description),
      unit = COALESCE(?, unit),
      target = COALESCE(?, target),
      color = COALESCE(?, color),
      icon = COALESCE(?, icon),
      sort_order = COALESCE(?, sort_order),
      status = COALESCE(?, status),
      notes = COALESCE(?, notes),
      updated_at = datetime('now')
    WHERE id = ?`
  ).run(
    data.categoryId ?? null,
    data.name ?? null,
    data.description ?? null,
    data.unit ?? null,
    data.target ?? null,
    data.color ?? null,
    data.icon ?? null,
    data.sortOrder ?? null,
    data.status ?? null,
    data.notes ?? null,
    req.params.id
  );

  const kpi = db.prepare('SELECT * FROM kpis WHERE id = ?').get(req.params.id) as KpiRow;
  res.json(attachLatestValue(kpi));
}

export async function deleteKpi(req: Request, res: Response) {
  const existing = db.prepare('SELECT * FROM kpis WHERE id = ?').get(req.params.id);
  if (!existing) throw new AppError('المؤشر غير موجود', 404);

  db.prepare('DELETE FROM kpis WHERE id = ?').run(req.params.id);
  res.status(204).send();
}

export { attachLatestValue };
