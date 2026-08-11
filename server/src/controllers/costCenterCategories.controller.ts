import { z } from 'zod';
import type { Request, Response } from 'express';
import { db } from '../db/db.js';
import { AppError } from '../middleware/errorHandler.js';
import type { CostCenterCategoryRow } from '../types/index.js';

const categorySchema = z.object({
  name: z.string().min(1, 'اسم التصنيف مطلوب'),
  sortOrder: z.number().int().default(0),
});

export async function listCostCenterCategories(req: Request, res: Response) {
  const rows = db.prepare('SELECT * FROM cost_center_categories ORDER BY sort_order ASC, id ASC').all();
  res.json(rows);
}

export async function createCostCenterCategory(req: Request, res: Response) {
  const data = categorySchema.parse(req.body);
  const info = db
    .prepare(
      `INSERT INTO cost_center_categories (name, sort_order, updated_at) VALUES (?, ?, datetime('now'))`
    )
    .run(data.name, data.sortOrder);

  const row = db.prepare('SELECT * FROM cost_center_categories WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(row);
}

export async function updateCostCenterCategory(req: Request, res: Response) {
  const existing = db.prepare('SELECT * FROM cost_center_categories WHERE id = ?').get(req.params.id) as
    | CostCenterCategoryRow
    | undefined;
  if (!existing) throw new AppError('التصنيف غير موجود', 404);

  const data = categorySchema.partial().parse(req.body);

  db.prepare(
    `UPDATE cost_center_categories SET
      name = COALESCE(?, name),
      sort_order = COALESCE(?, sort_order),
      updated_at = datetime('now')
    WHERE id = ?`
  ).run(data.name ?? null, data.sortOrder ?? null, req.params.id);

  const row = db.prepare('SELECT * FROM cost_center_categories WHERE id = ?').get(req.params.id);
  res.json(row);
}

export async function deleteCostCenterCategory(req: Request, res: Response) {
  const existing = db.prepare('SELECT * FROM cost_center_categories WHERE id = ?').get(req.params.id);
  if (!existing) throw new AppError('التصنيف غير موجود', 404);

  db.prepare('DELETE FROM cost_center_categories WHERE id = ?').run(req.params.id);
  res.status(204).send();
}
