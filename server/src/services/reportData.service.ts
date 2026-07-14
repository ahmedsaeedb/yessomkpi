import { db } from '../db/db.js';
import { calculateKpiMetrics } from '../utils/calculations.js';

export interface ReportFilters {
  categoryId?: string;
  kpiId?: string;
  year?: string;
  quarter?: string;
  status?: string;
  search?: string;
}

export interface ReportRow {
  id: number;
  categoryName: string;
  kpiName: string;
  unit: string;
  year: number;
  quarter: string;
  currentValue: number;
  previousValue: number;
  target: number;
  growthPercent: number;
  achievementPercent: number;
  difference: number;
  status: string;
  updatedAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  excellent: 'ممتاز',
  'on-track': 'على المسار',
  'at-risk': 'بحاجة لمتابعة',
  behind: 'متأخر',
};

export function getReportData(filters: ReportFilters): ReportRow[] {
  let query = `
    SELECT v.id, c.name as category_name, k.name as kpi_name, k.unit,
           v.year, v.quarter, v.current_value, v.previous_value, v.target, v.updated_at
    FROM kpi_values v
    JOIN kpis k ON k.id = v.kpi_id
    JOIN categories c ON c.id = k.category_id
    WHERE 1=1
  `;
  const params: unknown[] = [];

  if (filters.categoryId) {
    query += ' AND k.category_id = ?';
    params.push(filters.categoryId);
  }
  if (filters.kpiId) {
    query += ' AND v.kpi_id = ?';
    params.push(filters.kpiId);
  }
  if (filters.year) {
    query += ' AND v.year = ?';
    params.push(filters.year);
  }
  if (filters.quarter) {
    query += ' AND v.quarter = ?';
    params.push(filters.quarter);
  }
  if (filters.search) {
    query += ' AND (k.name LIKE ? OR c.name LIKE ?)';
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  query += ' ORDER BY v.year DESC, v.quarter DESC, c.name ASC, k.name ASC';

  const rows = db.prepare(query).all(...params) as Array<{
    id: number;
    category_name: string;
    kpi_name: string;
    unit: string;
    year: number;
    quarter: string;
    current_value: number;
    previous_value: number;
    target: number;
    updated_at: string;
  }>;

  const mapped = rows.map((r) => {
    const metrics = calculateKpiMetrics(r.current_value, r.previous_value, r.target);
    return {
      id: r.id,
      categoryName: r.category_name,
      kpiName: r.kpi_name,
      unit: r.unit,
      year: r.year,
      quarter: r.quarter,
      currentValue: r.current_value,
      previousValue: r.previous_value,
      target: r.target,
      updatedAt: r.updated_at,
      ...metrics,
    };
  });

  if (filters.status) {
    return mapped.filter((m) => m.status === filters.status);
  }

  return mapped;
}

export function statusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}
