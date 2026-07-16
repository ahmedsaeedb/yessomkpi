import bcrypt from 'bcrypt';
import { z } from 'zod';
import type { Request, Response } from 'express';
import { db } from '../db/db.js';
import { AppError } from '../middleware/errorHandler.js';
import type { UserRow } from '../types/index.js';

type PublicUser = Pick<UserRow, 'id' | 'username' | 'full_name' | 'role' | 'created_at' | 'updated_at'>;

const USER_COLUMNS = 'id, username, full_name, role, created_at, updated_at';

function countAdmins(excludingId?: number): number {
  const row = excludingId
    ? (db
        .prepare(`SELECT COUNT(*) as c FROM users WHERE role = 'admin' AND id != ?`)
        .get(excludingId) as { c: number })
    : (db.prepare(`SELECT COUNT(*) as c FROM users WHERE role = 'admin'`).get() as { c: number });
  return row.c;
}

export async function listUsers(_req: Request, res: Response) {
  const users = db
    .prepare(`SELECT ${USER_COLUMNS} FROM users ORDER BY created_at ASC`)
    .all() as PublicUser[];
  res.json(users);
}

const createUserSchema = z.object({
  username: z
    .string()
    .min(3, 'اسم المستخدم يجب أن يتكون من 3 أحرف على الأقل')
    .regex(/^[a-zA-Z0-9_.-]+$/, 'اسم المستخدم يجب أن يحتوي على أحرف إنجليزية وأرقام فقط'),
  password: z.string().min(6, 'كلمة المرور يجب أن تتكون من 6 أحرف على الأقل'),
  fullName: z.string().min(1, 'الاسم الكامل مطلوب'),
  role: z.enum(['admin', 'viewer']).default('viewer'),
});

export async function createUser(req: Request, res: Response) {
  const data = createUserSchema.parse(req.body);

  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(data.username);
  if (existing) throw new AppError('اسم المستخدم مستخدم بالفعل', 409);

  const passwordHash = await bcrypt.hash(data.password, 10);
  const info = db
    .prepare(`INSERT INTO users (username, password_hash, full_name, role) VALUES (?, ?, ?, ?)`)
    .run(data.username, passwordHash, data.fullName, data.role);

  const user = db
    .prepare(`SELECT ${USER_COLUMNS} FROM users WHERE id = ?`)
    .get(info.lastInsertRowid) as PublicUser;
  res.status(201).json(user);
}

const updateUserSchema = z.object({
  fullName: z.string().min(1).optional(),
  role: z.enum(['admin', 'viewer']).optional(),
  password: z.string().min(6, 'كلمة المرور يجب أن تتكون من 6 أحرف على الأقل').optional(),
});

export async function updateUser(req: Request, res: Response) {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow | undefined;
  if (!existing) throw new AppError('المستخدم غير موجود', 404);

  const data = updateUserSchema.parse(req.body);

  if (data.role === 'viewer' && existing.role === 'admin' && countAdmins(id) === 0) {
    throw new AppError('لا يمكن إزالة صلاحية المدير عن آخر مدير في النظام', 400);
  }

  const passwordHash = data.password ? await bcrypt.hash(data.password, 10) : null;

  db.prepare(
    `UPDATE users SET
      full_name = COALESCE(?, full_name),
      role = COALESCE(?, role),
      password_hash = COALESCE(?, password_hash),
      updated_at = datetime('now')
    WHERE id = ?`
  ).run(data.fullName ?? null, data.role ?? null, passwordHash, id);

  const user = db.prepare(`SELECT ${USER_COLUMNS} FROM users WHERE id = ?`).get(id) as PublicUser;
  res.json(user);
}

export async function deleteUser(req: Request, res: Response) {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow | undefined;
  if (!existing) throw new AppError('المستخدم غير موجود', 404);

  if (req.user!.sub === id) {
    throw new AppError('لا يمكنك حذف حسابك الخاص', 400);
  }

  if (existing.role === 'admin' && countAdmins(id) === 0) {
    throw new AppError('لا يمكن حذف آخر مدير في النظام', 400);
  }

  db.prepare('DELETE FROM users WHERE id = ?').run(id);
  res.status(204).send();
}
