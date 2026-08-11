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
  results_config TEXT,
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

CREATE TABLE IF NOT EXISTS cost_center_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS cost_centers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER REFERENCES cost_center_categories(id) ON DELETE SET NULL,
  item TEXT NOT NULL,
  amount REAL NOT NULL DEFAULT 0,
  date_from TEXT,
  date_to TEXT,
  year INTEGER NOT NULL,
  quarter TEXT NOT NULL CHECK (quarter IN ('Q1','Q2','Q3','Q4')),
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS roi_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  year INTEGER NOT NULL,
  quarter TEXT NOT NULL CHECK (quarter IN ('Q1','Q2','Q3','Q4')),
  channel TEXT NOT NULL,
  amount REAL NOT NULL DEFAULT 0,
  spend REAL NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS corrective_actions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  risk_type TEXT NOT NULL,
  probability TEXT NOT NULL CHECK (probability IN ('low','medium','high')),
  impact TEXT NOT NULL CHECK (impact IN ('low','medium','high')),
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low','medium','high')),
  treatment TEXT,
  responsible TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS plan_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  section TEXT NOT NULL CHECK (section IN ('general_plan','corrective_actions')),
  title TEXT NOT NULL,
  details TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_kpis_category ON kpis(category_id);
CREATE INDEX IF NOT EXISTS idx_kpi_values_kpi ON kpi_values(kpi_id);
CREATE INDEX IF NOT EXISTS idx_kpi_values_year_quarter ON kpi_values(year, quarter);
CREATE INDEX IF NOT EXISTS idx_cost_centers_year_quarter ON cost_centers(year, quarter);
CREATE INDEX IF NOT EXISTS idx_cost_centers_category ON cost_centers(category_id);
CREATE INDEX IF NOT EXISTS idx_roi_entries_year_quarter ON roi_entries(year, quarter);
CREATE INDEX IF NOT EXISTS idx_corrective_actions_sort ON corrective_actions(sort_order);
CREATE INDEX IF NOT EXISTS idx_plan_items_section ON plan_items(section, sort_order);
