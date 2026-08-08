import { z } from 'zod';
import type { Request, Response } from 'express';
import { db } from '../db/db.js';
import { AppError } from '../middleware/errorHandler.js';
import type { PlanItemRow } from '../types/index.js';

const SECTIONS = ['general_plan', 'corrective_actions'] as const;

const planItemSchema = z.object({
  section: z.enum(SECTIONS),
  title: z.string().min(1, 'عنوان البند مطلوب'),
  details: z.string().optional().nullable(),
  sortOrder: z.number().int().default(0),
});

export async function listPlanItems(req: Request, res: Response) {
  const { section } = req.query as { section?: string };
  if (!section || !SECTIONS.includes(section as (typeof SECTIONS)[number])) {
    throw new AppError('قسم غير صالح', 422);
  }

  const rows = db
    .prepare('SELECT * FROM plan_items WHERE section = ? ORDER BY sort_order ASC, id ASC')
    .all(section);
  res.json(rows);
}

export async function createPlanItem(req: Request, res: Response) {
  const data = planItemSchema.parse(req.body);

  const maxOrder = db
    .prepare('SELECT MAX(sort_order) as m FROM plan_items WHERE section = ?')
    .get(data.section) as { m: number | null };
  const sortOrder = data.sortOrder || (maxOrder.m ?? -1) + 1;

  const info = db
    .prepare(
      `INSERT INTO plan_items (section, title, details, sort_order, updated_at)
       VALUES (?, ?, ?, ?, datetime('now'))`
    )
    .run(data.section, data.title, data.details ?? null, sortOrder);

  const row = db.prepare('SELECT * FROM plan_items WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(row);
}

export async function updatePlanItem(req: Request, res: Response) {
  const existing = db.prepare('SELECT * FROM plan_items WHERE id = ?').get(req.params.id) as
    | PlanItemRow
    | undefined;
  if (!existing) throw new AppError('البند غير موجود', 404);

  const data = planItemSchema.partial().parse(req.body);

  db.prepare(
    `UPDATE plan_items SET
      title = COALESCE(?, title),
      details = ?,
      sort_order = COALESCE(?, sort_order),
      updated_at = datetime('now')
    WHERE id = ?`
  ).run(
    data.title ?? null,
    data.details !== undefined ? data.details : existing.details,
    data.sortOrder ?? null,
    req.params.id
  );

  const row = db.prepare('SELECT * FROM plan_items WHERE id = ?').get(req.params.id);
  res.json(row);
}

export async function deletePlanItem(req: Request, res: Response) {
  const existing = db.prepare('SELECT * FROM plan_items WHERE id = ?').get(req.params.id);
  if (!existing) throw new AppError('البند غير موجود', 404);

  db.prepare('DELETE FROM plan_items WHERE id = ?').run(req.params.id);
  res.status(204).send();
}
