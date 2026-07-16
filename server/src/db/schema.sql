-- Marketing KPI Dashboard - Database Schema
-- يسوم للمحاماة | مؤشرات أداء قسم التسويق

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT 'مدير النظام',
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  company_name TEXT NOT NULL DEFAULT 'يسوم للمحاماة',
  system_name TEXT NOT NULL DEFAULT 'مؤشرات أداء قسم التسويق',
  logo_path TEXT,
  primary_color TEXT NOT NULL DEFAULT '#0B2545',
  secondary_color TEXT NOT NULL DEFAULT '#C9A24B',
  success_color TEXT NOT NULL DEFAULT '#15803D',
  warning_color TEXT NOT NULL DEFAULT '#D97706',
  danger_color TEXT NOT NULL DEFAULT '#DC2626',
  default_theme TEXT NOT NULL DEFAULT 'light',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS kpis (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  unit TEXT NOT NULL DEFAULT 'رقم',
  target REAL NOT NULL DEFAULT 0,
  color TEXT NOT NULL DEFAULT '#0B2545',
  icon TEXT NOT NULL DEFAULT 'TrendingUp',
  sort_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS kpi_values (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kpi_id INTEGER NOT NULL REFERENCES kpis(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  quarter TEXT NOT NULL CHECK (quarter IN ('Q1','Q2','Q3','Q4')),
  current_value REAL NOT NULL DEFAULT 0,
  previous_value REAL NOT NULL DEFAULT 0,
  target REAL NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (kpi_id, year, quarter)
);

CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'custom',
  filters_json TEXT,
  format TEXT NOT NULL DEFAULT 'pdf',
  created_by INTEGER REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_kpis_category ON kpis(category_id);
CREATE INDEX IF NOT EXISTS idx_kpi_values_kpi ON kpi_values(kpi_id);
CREATE INDEX IF NOT EXISTS idx_kpi_values_year_quarter ON kpi_values(year, quarter);
