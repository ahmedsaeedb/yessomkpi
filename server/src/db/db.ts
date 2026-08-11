import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { config } from '../config.js';

if (!fs.existsSync(config.dataDir)) {
  fs.mkdirSync(config.dataDir, { recursive: true });
}
if (!fs.existsSync(config.uploadsDir)) {
  fs.mkdirSync(config.uploadsDir, { recursive: true });
}

const dbPath = path.join(config.dataDir, 'kpi-dashboard.sqlite');
export const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const schemaPath = path.join(config.rootDir, 'src', 'db', 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf-8');
db.exec(schema);

/**
 * `CREATE TABLE IF NOT EXISTS` only applies to brand-new databases - it never
 * retroactively adds columns to a database that already exists from a previous
 * version of the app. This keeps existing installs (and their data) working
 * after additive schema changes, without a full migration framework.
 */
function ensureColumn(table: string, column: string, definition: string) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
  const exists = columns.some((c) => c.name === column);
  if (!exists) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

/** Drops a column that an older schema version required but the app no longer uses. */
function ensureColumnDropped(table: string, column: string) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
  const exists = columns.some((c) => c.name === column);
  if (exists) {
    db.exec(`ALTER TABLE ${table} DROP COLUMN ${column}`);
  }
}

ensureColumn('settings', 'results_config', 'TEXT');
ensureColumn('cost_centers', 'category_id', 'INTEGER REFERENCES cost_center_categories(id) ON DELETE SET NULL');
ensureColumn('cost_centers', 'date_from', 'TEXT');
ensureColumn('cost_centers', 'date_to', 'TEXT');
// Replaced by date_from/date_to. The old column still had a NOT NULL constraint
// from its original CREATE TABLE, which breaks every insert since the app no
// longer supplies it.
ensureColumnDropped('cost_centers', 'date');

// Must run after the ensureColumn() calls above: an index on an additively-added
// column can't be created until that column actually exists on upgraded databases.
db.exec('CREATE INDEX IF NOT EXISTS idx_cost_centers_category ON cost_centers(category_id)');

export default db;
