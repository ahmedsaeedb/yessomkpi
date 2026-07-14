import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const config = {
  port: Number(process.env.PORT) || 4000,
  jwtSecret: process.env.JWT_SECRET || 'change-this-secret-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  adminUsername: process.env.ADMIN_USERNAME || 'admin',
  adminPassword: process.env.ADMIN_PASSWORD || 'Admin@12345',
  publicDashboardPassword: process.env.PUBLIC_DASHBOARD_PASSWORD || 'Public@12345',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  rootDir: path.resolve(__dirname, '..'),
  dataDir: path.resolve(__dirname, '..', 'data'),
  uploadsDir: path.resolve(__dirname, 'uploads'),
};
