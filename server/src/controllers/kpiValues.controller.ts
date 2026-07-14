import { z } from 'zod';
import type { Request, Response } from 'express';
import { db } from '../db/db.js';
import { AppError } from '../middleware/errorHandler.js';
import type { KpiValueRow } from '../types/index.js';
import { calculateKpiMetrics } from '../utils/calculations.js';

const kpiValueSchema = z.object({
  kpiId: z.number().int(),
  year: z.number().int(),
  quarter: z.enum(['Q1', 'Q2', 'Q3', 'Q4']),
  currentValue: z.number().default(0),
  previousValue: z.number().default(0),
  target: z.number().default(0),
  notes: z.string().optional().nullable(),
});

function withMetrics(row: KpiValueRow) {
  const metrics = calculateKpiMetrics(row.current_value, row.previous_value, row.target);
  return { ...row, ...metrics };
}

export async function listKpiValues(req: Request, res: Response) {
  const { kpiId, year, quarter, categoryId } = req.query as {
    kpiId?: string;
    year?: string;
    quarter?: string;
    categoryId?: string;
  };

  let query = `
    SELECT v.*, k.name as kpi_name, k.unit as kpi_unit, k.category_id, c.name as category_name
    FROM kpi_values v
    JOIN kpis k ON k.id = v.kpi_id
    JOIN categories c ON c.id = k.category_id
    WHERE 1=1
  `;
  const params: unknown[] = [];

  if (kpiId) {
    query += ' AND v.kpi_id = ?';
    params.push(kpiId);
  }
  if (year) {
    query += ' AND v.year = ?';
    params.push(year);
  }
  if (quarter) {
    query += ' AND v.quarter = ?';
    params.push(quarter);
  }
  if (categoryId) {
    query += ' AND k.category_id = ?';
    params.push(categoryId);
  }

  query += ' ORDER BY v.year DESC, v.quarter DESC, k.sort_order ASC';

  const rows = db.prepare(query).all(...params) as KpiValueRow[];
  res.json(rows.map(withMetrics));
}

export async function getKpiValue(req: Request, res: Response) {
  const value = db.prepare('SELECT * FROM kpi_values WHERE id = ?').get(req.params.id) as
    | KpiValueRow
    | undefined;
  if (!value) throw new AppError('البيانات الفصلية غير موجودة', 404);
  res.json(withMetrics(value));
}

export async function upsertKpiValue(req: Request, res: Response) {
  const data = kpiValueSchema.parse(req.body);

  const kpi = db.prepare('SELECT id FROM kpis WHERE id = ?').get(data.kpiId);
  if (!kpi) throw new AppError('المؤشر المحدد غير موجود', 422);

  const existing = db
    .prepare('SELECT id FROM kpi_values WHERE kpi_id = ? AND year = ? AND quarter = ?')
    .get(data.kpiId, data.year, data.quarter) as { id: number } | undefined;

  let id: number;
  if (existing) {
    db.prepare(
      `UPDATE kpi_values SET current_value = ?, previous_value = ?, target = ?, notes = ?, updated_at = datetime('now')
       WHERE id = ?`
    ).run(data.currentValue, data.previousValue, data.target, data.notes ?? null, existing.id);
    id = existing.id;
  } else {
    const info = db
      .prepare(
        `INSERT INTO kpi_values (kpi_id, year, quarter, current_value, previous_value, target, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(data.kpiId, data.year, data.quarter, data.currentValue, data.previousValue, data.target, data.notes ?? null);
    id = Number(info.lastInsertRowid);
  }

  const row = db.prepare('SELECT * FROM kpi_values WHERE id = ?').get(id) as KpiValueRow;
  res.status(existing ? 200 : 201).json(withMetrics(row));
}

export async function deleteKpiValue(req: Request, res: Response) {
  const existing = db.prepare('SELECT * FROM kpi_values WHERE id = ?').get(req.params.id);
  if (!existing) throw new AppError('البيانات الفصلية غير موجودة', 404);

  db.prepare('DELETE FROM kpi_values WHERE id = ?').run(req.params.id);
  res.status(204).send();
}
