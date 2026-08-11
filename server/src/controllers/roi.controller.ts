import { z } from 'zod';
import type { Request, Response } from 'express';
import { db } from '../db/db.js';
import { AppError } from '../middleware/errorHandler.js';
import type { RoiEntryRow } from '../types/index.js';

const roiSchema = z.object({
  date: z.string().min(1, 'التاريخ مطلوب'),
  year: z.number().int(),
  quarter: z.enum(['Q1', 'Q2', 'Q3', 'Q4']),
  channel: z.string().min(1, 'قناة الاستثمار مطلوبة'),
  amount: z.number().default(0),
  spend: z.number().default(0),
  notes: z.string().optional().nullable(),
});

export async function listRoiEntries(req: Request, res: Response) {
  const { year, quarter } = req.query as { year?: string; quarter?: string };

  let query = 'SELECT * FROM roi_entries WHERE 1=1';
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

export async function createRoiEntry(req: Request, res: Response) {
  const data = roiSchema.parse(req.body);
  const info = db
    .prepare(
      `INSERT INTO roi_entries (date, year, quarter, channel, amount, spend, notes, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`
    )
    .run(data.date, data.year, data.quarter, data.channel, data.amount, data.spend, data.notes ?? null);

  const row = db.prepare('SELECT * FROM roi_entries WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(row);
}

export async function updateRoiEntry(req: Request, res: Response) {
  const existing = db.prepare('SELECT * FROM roi_entries WHERE id = ?').get(req.params.id) as
    | RoiEntryRow
    | undefined;
  if (!existing) throw new AppError('البند غير موجود', 404);

  const data = roiSchema.partial().parse(req.body);

  db.prepare(
    `UPDATE roi_entries SET
      date = COALESCE(?, date),
      year = COALESCE(?, year),
      quarter = COALESCE(?, quarter),
      channel = COALESCE(?, channel),
      amount = COALESCE(?, amount),
      spend = COALESCE(?, spend),
      notes = ?,
      updated_at = datetime('now')
    WHERE id = ?`
  ).run(
    data.date ?? null,
    data.year ?? null,
    data.quarter ?? null,
    data.channel ?? null,
    data.amount ?? null,
    data.spend ?? null,
    data.notes !== undefined ? data.notes : existing.notes,
    req.params.id
  );

  const row = db.prepare('SELECT * FROM roi_entries WHERE id = ?').get(req.params.id);
  res.json(row);
}

export async function deleteRoiEntry(req: Request, res: Response) {
  const existing = db.prepare('SELECT * FROM roi_entries WHERE id = ?').get(req.params.id);
  if (!existing) throw new AppError('البند غير موجود', 404);

  db.prepare('DELETE FROM roi_entries WHERE id = ?').run(req.params.id);
  res.status(204).send();
}
