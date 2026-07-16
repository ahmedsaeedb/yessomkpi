import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import './db/db.js';
import { seedDatabase } from './db/seed.js';
import authRoutes from './routes/auth.routes.js';
import categoriesRoutes from './routes/categories.routes.js';
import kpisRoutes from './routes/kpis.routes.js';
import kpiValuesRoutes from './routes/kpiValues.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import reportsRoutes from './routes/reports.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import usersRoutes from './routes/users.routes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

seedDatabase();

const app = express();

app.use(cors({ origin: config.clientOrigin, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(config.uploadsDir));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'yessom-kpi-api' }));

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/kpis', kpisRoutes);
app.use('/api/kpi-values', kpiValuesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/users', usersRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`✔ خادم مؤشرات أداء قسم التسويق يعمل على المنفذ ${config.port}`);
});
