import multer from 'multer';
import path from 'node:path';
import { config } from '../config.js';
import { AppError } from './errorHandler.js';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, config.uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `logo-${Date.now()}${ext}`);
  },
});

const ALLOWED = new Set(['.png', '.jpg', '.jpeg', '.svg', '.webp']);

export const uploadLogo = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED.has(ext)) {
      cb(new AppError('صيغة الملف غير مدعومة، الرجاء رفع صورة PNG أو JPG أو SVG أو WEBP', 422));
      return;
    }
    cb(null, true);
  },
});
