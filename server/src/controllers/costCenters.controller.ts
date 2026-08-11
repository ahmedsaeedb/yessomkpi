import { z } from 'zod';
import type { Request, Response } from 'express';
import { db } from '../db/db.js';
import { AppError } from '../middleware/errorHandler.js';
import type { CostCenterRow } from '../types/index.js';

const costCenterSchema = z.object({
  categoryId: z.number().int().optional().nullable(),
  item: z.string().min(1, 'اسم البند مطلوب'),
  amount: z.number().default(0),
  dateFrom: z.string().optional().nullable(),
  dateTo: z.string().optional().nullable(),
  year: z.number().int(),
  quarter: z.enum(['Q1', 'Q2', 'Q3', 'Q4']),
  notes: z.string().optional().nullable(),
});

export async function listCostCenters(req: Request, res: Response) {
  const { year, quarter, categoryId } = req.query as { year?: string; quarter?: string; categoryId?: string };

  let query = `
    SELECT c.*, cc.name as category_name
    FROM cost_centers c
    LEFT JOIN cost_center_categories cc ON cc.id = c.category_id
    WHERE 1=1
  `;
  const params: unknown[] = [];

  if (year) {
    query += ' AND c.year = ?';
    params.push(year);
  }
  if (quarter) {
    query += ' AND c.quarter = ?';
    params.push(quarter);
  }
  if (categoryId) {
    query += ' AND c.category_id = ?';
    params.push(categoryId);
  }

  query += ' ORDER BY c.year DESC, c.quarter DESC, c.id DESC';

  const rows = db.prepare(query).all(...params);
  res.json(rows);
}

export async function getCostCenter(req: Request, res: Response) {
  const row = db.prepare('SELECT * FROM cost_centers WHERE id = ?').get(req.params.id) as
    | CostCenterRow
    | undefined;
  if (!row) throw new AppError('البند غير موجود', 404);
  res.json(row);
}

export async function createCostCenter(req: Request, res: Response) {
  const data = costCenterSchema.parse(req.body);
  const info = db
    .prepare(
      `INSERT INTO cost_centers (category_id, item, amount, date_from, date_to, year, quarter, notes, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
    )
    .run(
      data.categoryId ?? null,
      data.item,
      data.amount,
      data.dateFrom ?? null,
      data.dateTo ?? null,
      data.year,
      data.quarter,
      data.notes ?? null
    );

  const row = db.prepare('SELECT * FROM cost_centers WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(row);
}

export async function updateCostCenter(req: Request, res: Response) {
  const existing = db.prepare('SELECT * FROM cost_centers WHERE id = ?').get(req.params.id) as
    | CostCenterRow
    | undefined;
  if (!existing) throw new AppError('البند غير موجود', 404);

  const data = costCenterSchema.partial().parse(req.body);

  db.prepare(
    `UPDATE cost_centers SET
      category_id = ?,
      item = COALESCE(?, item),
      amount = COALESCE(?, amount),
      date_from = ?,
      date_to = ?,
      year = COALESCE(?, year),
      quarter = COALESCE(?, quarter),
      notes = ?,
      updated_at = datetime('now')
    WHERE id = ?`
  ).run(
    data.categoryId !== undefined ? data.categoryId : existing.category_id,
    data.item ?? null,
    data.amount ?? null,
    data.dateFrom !== undefined ? data.dateFrom : existing.date_from,
    data.dateTo !== undefined ? data.dateTo : existing.date_to,
    data.year ?? null,
    data.quarter ?? null,
    data.notes !== undefined ? data.notes : existing.notes,
    req.params.id
  );

  const row = db.prepare('SELECT * FROM cost_centers WHERE id = ?').get(req.params.id);
  res.json(row);
}

export async function deleteCostCenter(req: Request, res: Response) {
  const existing = db.prepare('SELECT * FROM cost_centers WHERE id = ?').get(req.params.id);
  if (!existing) throw new AppError('البند غير موجود', 404);

  db.prepare('DELETE FROM cost_centers WHERE id = ?').run(req.params.id);
  res.status(204).send();
}
