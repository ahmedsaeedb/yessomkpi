import { z } from 'zod';
import type { Request, Response } from 'express';
import { db } from '../db/db.js';
import { AppError } from '../middleware/errorHandler.js';
import type { CorrectiveActionRow } from '../types/index.js';

const RISK_LEVELS = ['low', 'medium', 'high'] as const;

const correctiveActionSchema = z.object({
  riskType: z.string().min(1, 'نوع الخطر مطلوب'),
  probability: z.enum(RISK_LEVELS),
  impact: z.enum(RISK_LEVELS),
  riskLevel: z.enum(RISK_LEVELS),
  treatment: z.string().optional().nullable(),
  responsible: z.string().optional().nullable(),
  sortOrder: z.number().int().default(0),
});

export async function listCorrectiveActions(req: Request, res: Response) {
  const rows = db.prepare('SELECT * FROM corrective_actions ORDER BY sort_order ASC, id ASC').all();
  res.json(rows);
}

export async function createCorrectiveAction(req: Request, res: Response) {
  const data = correctiveActionSchema.parse(req.body);

  const maxOrder = db.prepare('SELECT MAX(sort_order) as m FROM corrective_actions').get() as { m: number | null };
  const sortOrder = data.sortOrder || (maxOrder.m ?? -1) + 1;

  const info = db
    .prepare(
      `INSERT INTO corrective_actions (risk_type, probability, impact, risk_level, treatment, responsible, sort_order, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`
    )
    .run(
      data.riskType,
      data.probability,
      data.impact,
      data.riskLevel,
      data.treatment ?? null,
      data.responsible ?? null,
      sortOrder
    );

  const row = db.prepare('SELECT * FROM corrective_actions WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(row);
}

export async function updateCorrectiveAction(req: Request, res: Response) {
  const existing = db.prepare('SELECT * FROM corrective_actions WHERE id = ?').get(req.params.id) as
    | CorrectiveActionRow
    | undefined;
  if (!existing) throw new AppError('البند غير موجود', 404);

  const data = correctiveActionSchema.partial().parse(req.body);

  db.prepare(
    `UPDATE corrective_actions SET
      risk_type = COALESCE(?, risk_type),
      probability = COALESCE(?, probability),
      impact = COALESCE(?, impact),
      risk_level = COALESCE(?, risk_level),
      treatment = ?,
      responsible = ?,
      sort_order = COALESCE(?, sort_order),
      updated_at = datetime('now')
    WHERE id = ?`
  ).run(
    data.riskType ?? null,
    data.probability ?? null,
    data.impact ?? null,
    data.riskLevel ?? null,
    data.treatment !== undefined ? data.treatment : existing.treatment,
    data.responsible !== undefined ? data.responsible : existing.responsible,
    data.sortOrder ?? null,
    req.params.id
  );

  const row = db.prepare('SELECT * FROM corrective_actions WHERE id = ?').get(req.params.id);
  res.json(row);
}

export async function deleteCorrectiveAction(req: Request, res: Response) {
  const existing = db.prepare('SELECT * FROM corrective_actions WHERE id = ?').get(req.params.id);
  if (!existing) throw new AppError('البند غير موجود', 404);

  db.prepare('DELETE FROM corrective_actions WHERE id = ?').run(req.params.id);
  res.status(204).send();
}
