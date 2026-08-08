import type { Request, Response } from 'express';
import { db } from '../db/db.js';
import { calculateKpiMetrics, currentQuarter, currentYear, QUARTERS } from '../utils/calculations.js';
import type { CostCenterRow } from '../types/index.js';

interface ValueJoinRow {
  id: number;
  kpi_id: number;
  kpi_name: string;
  category_id: number;
  category_name: string;
  unit: string;
  color: string;
  icon: string;
  year: number;
  quarter: string;
  current_value: number;
  previous_value: number;
  target: number;
  updated_at: string;
}

const baseValueQuery = `
  SELECT v.id, v.kpi_id, k.name as kpi_name, k.category_id, c.name as category_name,
         k.unit, k.color, k.icon, v.year, v.quarter, v.current_value, v.previous_value,
         v.target, v.updated_at
  FROM kpi_values v
  JOIN kpis k ON k.id = v.kpi_id
  JOIN categories c ON c.id = k.category_id
`;

export async function dashboardSummary(req: Request, res: Response) {
  const year = Number(req.query.year) || currentYear();
  const quarter = (req.query.quarter as string) || currentQuarter();

  const categoriesCount = (
    db.prepare(`SELECT COUNT(*) as c FROM categories WHERE status = 'active'`).get() as { c: number }
  ).c;
  const kpisCount = (
    db.prepare(`SELECT COUNT(*) as c FROM kpis WHERE status = 'active'`).get() as { c: number }
  ).c;

  const currentValues = db
    .prepare(`${baseValueQuery} WHERE v.year = ? AND v.quarter = ?`)
    .all(year, quarter) as ValueJoinRow[];

  const metricsFor = (v: ValueJoinRow) => calculateKpiMetrics(v.current_value, v.previous_value, v.target);

  const achievementAvg = currentValues.length
    ? currentValues.reduce((sum, v) => sum + metricsFor(v).achievementPercent, 0) / currentValues.length
    : 0;
  const growthAvg = currentValues.length
    ? currentValues.reduce((sum, v) => sum + metricsFor(v).growthPercent, 0) / currentValues.length
    : 0;

  // Quarter comparison for the selected year
  const quarterComparison = QUARTERS.map((q) => {
    const rows = db.prepare(`${baseValueQuery} WHERE v.year = ? AND v.quarter = ?`).all(year, q) as ValueJoinRow[];
    const avgAchievement = rows.length
      ? rows.reduce((s, v) => s + metricsFor(v).achievementPercent, 0) / rows.length
      : 0;
    const avgGrowth = rows.length
      ? rows.reduce((s, v) => s + metricsFor(v).growthPercent, 0) / rows.length
      : 0;
    return { quarter: q, achievementPercent: Number(avgAchievement.toFixed(2)), growthPercent: Number(avgGrowth.toFixed(2)) };
  });

  // Year comparison - last 4 years including current
  const years = Array.from({ length: 4 }, (_, i) => year - 3 + i);
  const yearComparison = years.map((y) => {
    const rows = db.prepare(`${baseValueQuery} WHERE v.year = ?`).all(y) as ValueJoinRow[];
    const avgAchievement = rows.length
      ? rows.reduce((s, v) => s + metricsFor(v).achievementPercent, 0) / rows.length
      : 0;
    return { year: y, achievementPercent: Number(avgAchievement.toFixed(2)) };
  });

  // Top categories by achievement
  const categoriesWithValues = new Map<number, { name: string; values: ValueJoinRow[] }>();
  for (const v of currentValues) {
    if (!categoriesWithValues.has(v.category_id)) {
      categoriesWithValues.set(v.category_id, { name: v.category_name, values: [] });
    }
    categoriesWithValues.get(v.category_id)!.values.push(v);
  }
  const topCategories = Array.from(categoriesWithValues.entries())
    .map(([id, { name, values }]) => ({
      id,
      name,
      achievementPercent: Number(
        (values.reduce((s, v) => s + metricsFor(v).achievementPercent, 0) / values.length).toFixed(2)
      ),
      growthPercent: Number(
        (values.reduce((s, v) => s + metricsFor(v).growthPercent, 0) / values.length).toFixed(2)
      ),
      kpiCount: values.length,
    }))
    .sort((a, b) => b.achievementPercent - a.achievementPercent);

  // Top KPIs by achievement
  const topKpis = currentValues
    .map((v) => ({
      id: v.kpi_id,
      name: v.kpi_name,
      categoryId: v.category_id,
      categoryName: v.category_name,
      unit: v.unit,
      color: v.color,
      icon: v.icon,
      currentValue: v.current_value,
      target: v.target,
      ...metricsFor(v),
    }))
    .sort((a, b) => b.achievementPercent - a.achievementPercent);

  // Latest updates across all KPIs
  const latestUpdates = db
    .prepare(`${baseValueQuery} ORDER BY v.updated_at DESC LIMIT 8`)
    .all() as ValueJoinRow[];

  const costCenters = db
    .prepare('SELECT * FROM cost_centers ORDER BY year DESC, quarter DESC, date DESC, id DESC')
    .all() as CostCenterRow[];

  res.json({
    year,
    quarter,
    totals: {
      categories: categoriesCount,
      kpis: kpisCount,
      achievementPercent: Number(achievementAvg.toFixed(2)),
      growthPercent: Number(growthAvg.toFixed(2)),
    },
    quarterComparison,
    yearComparison,
    topCategories,
    topKpis,
    latestUpdates: latestUpdates.map((v) => ({
      kpiId: v.kpi_id,
      kpiName: v.kpi_name,
      categoryId: v.category_id,
      categoryName: v.category_name,
      year: v.year,
      quarter: v.quarter,
      currentValue: v.current_value,
      unit: v.unit,
      updatedAt: v.updated_at,
      ...metricsFor(v),
    })),
    costCenters: costCenters.map((c) => ({
      id: c.id,
      item: c.item,
      amount: c.amount,
      date: c.date,
      year: c.year,
      quarter: c.quarter,
      notes: c.notes,
    })),
  });
}

/**
 * Scoped trend series for a single trend widget: overall, one category, or one KPI,
 * across the 4 quarters of a year, or the last 4 years.
 */
export async function dashboardTrend(req: Request, res: Response) {
  const timeframe = (req.query.timeframe as string) === 'yearly' ? 'yearly' : 'quarterly';
  const scope = (req.query.scope as string) || 'all';
  const id = req.query.id ? Number(req.query.id) : undefined;
  const year = Number(req.query.year) || currentYear();

  const metricsFor = (v: ValueJoinRow) => calculateKpiMetrics(v.current_value, v.previous_value, v.target);

  let scopeClause = '';
  const scopeParams: unknown[] = [];
  if (scope === 'category' && id) {
    scopeClause = ' AND k.category_id = ?';
    scopeParams.push(id);
  } else if (scope === 'kpi' && id) {
    scopeClause = ' AND v.kpi_id = ?';
    scopeParams.push(id);
  }

  if (timeframe === 'quarterly') {
    const series = QUARTERS.map((q) => {
      const rows = db
        .prepare(`${baseValueQuery} WHERE v.year = ? AND v.quarter = ?${scopeClause}`)
        .all(year, q, ...scopeParams) as ValueJoinRow[];
      const avgAchievement = rows.length
        ? rows.reduce((s, v) => s + metricsFor(v).achievementPercent, 0) / rows.length
        : 0;
      const avgGrowth = rows.length
        ? rows.reduce((s, v) => s + metricsFor(v).growthPercent, 0) / rows.length
        : 0;
      return { label: q, achievementPercent: Number(avgAchievement.toFixed(2)), growthPercent: Number(avgGrowth.toFixed(2)) };
    });
    return res.json({ series });
  }

  const years = Array.from({ length: 4 }, (_, i) => year - 3 + i);
  const series = years.map((y) => {
    const rows = db
      .prepare(`${baseValueQuery} WHERE v.year = ?${scopeClause}`)
      .all(y, ...scopeParams) as ValueJoinRow[];
    const avgAchievement = rows.length
      ? rows.reduce((s, v) => s + metricsFor(v).achievementPercent, 0) / rows.length
      : 0;
    const avgGrowth = rows.length
      ? rows.reduce((s, v) => s + metricsFor(v).growthPercent, 0) / rows.length
      : 0;
    return { label: String(y), achievementPercent: Number(avgAchievement.toFixed(2)), growthPercent: Number(avgGrowth.toFixed(2)) };
  });
  res.json({ series });
}
