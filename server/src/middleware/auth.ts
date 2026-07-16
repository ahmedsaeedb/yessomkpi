import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import type { AuthTokenPayload } from '../types/index.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'يجب تسجيل الدخول للوصول إلى هذا المورد' });
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, config.jwtSecret) as unknown as AuthTokenPayload;
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ message: 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجددًا' });
  }
}

/** Must run after requireAuth. Restricts a route to users with role === 'admin'. */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'هذا الإجراء متاح لمدير النظام فقط' });
  }
  next();
}
