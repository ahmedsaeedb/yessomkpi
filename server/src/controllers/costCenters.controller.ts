import { z } from 'zod';
import type { Request, Response } from 'express';
import { db } from '../db/db.js';
import { AppError } from '../middleware/errorHandler.js';
import type { CostCenterRow } from '../types/index.js';

const costCenterSchema = z.object({
  item: z.string().min(1, 'اسم البند مطلوب'),
  amount: z.number().default(0),
  date: z.string().min(1, 'التاريخ مطلوب'),
  year: z.number().int(),
  quarter: z.enum(['Q1', 'Q2', 'Q3', 'Q4']),
  notes: z.string().optional().nullable(),
});

export async function listCostCenters(req: Request, res: Response) {
  const { year, quarter } = req.query as { year?: string; quarter?: string };

  let query = 'SELECT * FROM cost_centers WHERE 1=1';
  const params: unknown[] = [];

  if (year) {
    query += ' AND year = ?';
    params.push(year);
  }
  if (quarter) {
    query += ' AND quarter = ?';
    params.push(quarter);
  }

  query += ' ORDER BY year DESC, quarter DESC, date DESC, id DESC';

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
      `INSERT INTO cost_centers (item, amount, date, year, quarter, notes, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`
    )
    .run(data.item, data.amount, data.date, data.year, data.quarter, data.notes ?? null);

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
      item = COALESCE(?, item),
      amount = COALESCE(?, amount),
      date = COALESCE(?, date),
      year = COALESCE(?, year),
      quarter = COALESCE(?, quarter),
      notes = ?,
      updated_at = datetime('now')
    WHERE id = ?`
  ).run(
    data.item ?? null,
    data.amount ?? null,
    data.date ?? null,
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
