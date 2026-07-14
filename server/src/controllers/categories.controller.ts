import { z } from 'zod';
import type { Request, Response } from 'express';
import { db } from '../db/db.js';
import { AppError } from '../middleware/errorHandler.js';
import type { CategoryRow } from '../types/index.js';

const categorySchema = z.object({
  name: z.string().min(1, 'اسم الفئة مطلوب'),
  description: z.string().optional().nullable(),
  status: z.enum(['active', 'inactive']).default('active'),
  sortOrder: z.number().int().default(0),
});

export async function listCategories(req: Request, res: Response) {
  const { search, status } = req.query as { search?: string; status?: string };

  let query = `
    SELECT c.*, COUNT(k.id) as kpi_count
    FROM categories c
    LEFT JOIN kpis k ON k.category_id = c.id
    WHERE 1=1
  `;
  const params: unknown[] = [];

  if (search) {
    query += ' AND (c.name LIKE ? OR c.description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  if (status) {
    query += ' AND c.status = ?';
    params.push(status);
  }

  query += ' GROUP BY c.id ORDER BY c.sort_order ASC, c.id ASC';

  const rows = db.prepare(query).all(...params);
  res.json(rows);
}

export async function getCategory(req: Request, res: Response) {
  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id) as
    | CategoryRow
    | undefined;
  if (!category) throw new AppError('الفئة غير موجودة', 404);
  res.json(category);
}

export async function createCategory(req: Request, res: Response) {
  const data = categorySchema.parse(req.body);
  const info = db
    .prepare(
      `INSERT INTO categories (name, description, status, sort_order, updated_at) VALUES (?, ?, ?, ?, datetime('now'))`
    )
    .run(data.name, data.description ?? null, data.status, data.sortOrder);

  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(category);
}

export async function updateCategory(req: Request, res: Response) {
  const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id) as
    | CategoryRow
    | undefined;
  if (!existing) throw new AppError('الفئة غير موجودة', 404);

  const data = categorySchema.partial().parse(req.body);

  db.prepare(
    `UPDATE categories SET
      name = COALESCE(?, name),
      description = COALESCE(?, description),
      status = COALESCE(?, status),
      sort_order = COALESCE(?, sort_order),
      updated_at = datetime('now')
    WHERE id = ?`
  ).run(
    data.name ?? null,
    data.description ?? null,
    data.status ?? null,
    data.sortOrder ?? null,
    req.params.id
  );

  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
  res.json(category);
}

export async function deleteCategory(req: Request, res: Response) {
  const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
  if (!existing) throw new AppError('الفئة غير موجودة', 404);

  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  res.status(204).send();
}
