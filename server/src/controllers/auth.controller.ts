import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import type { Request, Response } from 'express';
import { db } from '../db/db.js';
import { config } from '../config.js';
import { AppError } from '../middleware/errorHandler.js';
import type { UserRow, SettingsRow } from '../types/index.js';

const loginSchema = z.object({
  username: z.string().min(1, 'اسم المستخدم مطلوب'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
});

export async function login(req: Request, res: Response) {
  const { username, password } = loginSchema.parse(req.body);

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as
    | UserRow
    | undefined;

  if (!user) {
    throw new AppError('اسم المستخدم أو كلمة المرور غير صحيحة', 401);
  }

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    throw new AppError('اسم المستخدم أو كلمة المرور غير صحيحة', 401);
  }

  const token = jwt.sign(
    { sub: user.id, username: user.username, role: user.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn } as jwt.SignOptions
  );

  res.json({
    token,
    user: { id: user.id, username: user.username, fullName: user.full_name, role: user.role },
  });
}

export async function me(req: Request, res: Response) {
  const user = db.prepare('SELECT id, username, full_name, role FROM users WHERE id = ?').get(
    req.user!.sub
  ) as Pick<UserRow, 'id' | 'username' | 'full_name' | 'role'> | undefined;

  if (!user) throw new AppError('المستخدم غير موجود', 404);

  res.json({ id: user.id, username: user.username, fullName: user.full_name, role: user.role });
}

const publicLoginSchema = z.object({
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
});

export async function publicLogin(req: Request, res: Response) {
  const { password } = publicLoginSchema.parse(req.body);

  const settings = db.prepare('SELECT * FROM settings WHERE id = 1').get() as SettingsRow | undefined;

  if (!settings || !settings.public_dashboard_enabled) {
    throw new AppError('اللوحة العامة غير متاحة حاليًا', 403);
  }

  if (!settings.public_dashboard_password_hash) {
    throw new AppError('لم يتم إعداد كلمة مرور للوحة العامة', 403);
  }

  const isValid = await bcrypt.compare(password, settings.public_dashboard_password_hash);
  if (!isValid) {
    throw new AppError('كلمة المرور غير صحيحة', 401);
  }

  const token = jwt.sign({ role: 'public' }, config.jwtSecret, { expiresIn: '12h' });
  res.json({ token });
}
