import { z } from 'zod';

const baseWidgetSchema = z.object({
  id: z.string(),
  x: z.number().int().min(0),
  y: z.number().int().min(0),
  w: z.number().int().min(1),
  h: z.number().int().min(1),
  title: z.string().optional(),
});

const statWidgetSchema = baseWidgetSchema.extend({
  type: z.literal('stat'),
  metric: z.enum(['categoriesCount', 'kpisCount', 'avgAchievement', 'avgGrowth', 'kpiValue', 'categoryValue']),
  kpiId: z.number().optional(),
  kpiField: z.enum(['current', 'target', 'achievement', 'growth', 'difference']).optional(),
  categoryId: z.number().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  showTrend: z.boolean().optional(),
});

const trendWidgetSchema = baseWidgetSchema.extend({
  type: z.literal('trend'),
  timeframe: z.enum(['quarterly', 'yearly']),
  chartType: z.enum(['area', 'line', 'bar']),
  metrics: z.array(z.enum(['achievement', 'growth'])).min(1),
  scope: z.enum(['all', 'category', 'kpi']),
  categoryId: z.number().optional(),
  kpiId: z.number().optional(),
});

const categoryWidgetSchema = baseWidgetSchema.extend({
  type: z.literal('category'),
  chartType: z.enum(['bar', 'donut']),
  mode: z.enum(['autoTop', 'autoBottom', 'manual']),
  count: z.number().int().min(1).max(50).optional(),
  categoryIds: z.array(z.number()).optional(),
  metric: z.enum(['achievement', 'growth', 'kpiCount']),
});

const kpiWidgetSchema = baseWidgetSchema.extend({
  type: z.literal('kpi'),
  display: z.enum(['cards', 'table']),
  mode: z.enum(['autoTop', 'autoBottom', 'manual', 'byCategory']),
  count: z.number().int().min(1).max(50).optional(),
  kpiIds: z.array(z.number()).optional(),
  categoryId: z.number().optional(),
  columns: z
    .array(z.enum(['name', 'category', 'current', 'target', 'achievement', 'growth', 'status', 'updatedAt']))
    .optional(),
});

const radialWidgetSchema = baseWidgetSchema.extend({
  type: z.literal('radial'),
  source: z.enum(['overall', 'category', 'kpi']),
  categoryId: z.number().optional(),
  kpiId: z.number().optional(),
  color: z.string().optional(),
});

const updatesWidgetSchema = baseWidgetSchema.extend({
  type: z.literal('updates'),
  count: z.number().int().min(1).max(30),
  categoryId: z.number().optional(),
});

const textWidgetSchema = baseWidgetSchema.extend({
  type: z.literal('text'),
  text: z.string(),
  align: z.enum(['right', 'center', 'left']),
  size: z.enum(['sm', 'md', 'lg', 'xl']),
});

const widgetSchema = z.discriminatedUnion('type', [
  statWidgetSchema,
  trendWidgetSchema,
  categoryWidgetSchema,
  kpiWidgetSchema,
  radialWidgetSchema,
  updatesWidgetSchema,
  textWidgetSchema,
]);

export const resultsConfigSchema = z.object({
  widgets: z.array(widgetSchema),
});

export type Widget = z.infer<typeof widgetSchema>;
export type ResultsConfig = z.infer<typeof resultsConfigSchema>;

export const DEFAULT_RESULTS_CONFIG: ResultsConfig = {
  widgets: [
    { id: 'w1', type: 'stat', x: 0, y: 0, w: 3, h: 2, title: 'عدد الفئات النشطة', metric: 'categoriesCount', color: '#0B2545', icon: 'FolderKanban' },
    { id: 'w2', type: 'stat', x: 3, y: 0, w: 3, h: 2, title: 'عدد المؤشرات النشطة', metric: 'kpisCount', color: '#C9A24B', icon: 'Gauge' },
    { id: 'w3', type: 'stat', x: 6, y: 0, w: 3, h: 2, title: 'متوسط نسبة الإنجاز', metric: 'avgAchievement', color: '#15803D', icon: 'Target', showTrend: true },
    { id: 'w4', type: 'stat', x: 9, y: 0, w: 3, h: 2, title: 'متوسط نسبة النمو', metric: 'avgGrowth', color: '#D97706', icon: 'TrendingUp', showTrend: true },
    { id: 'w5', type: 'trend', x: 0, y: 2, w: 8, h: 6, title: 'مقارنة الأداء الفصلي', timeframe: 'quarterly', chartType: 'area', metrics: ['achievement', 'growth'], scope: 'all' },
    { id: 'w6', type: 'radial', x: 8, y: 2, w: 4, h: 6, title: 'الأداء العام', source: 'overall' },
    { id: 'w7', type: 'trend', x: 0, y: 8, w: 6, h: 6, title: 'مقارنة الأداء السنوي', timeframe: 'yearly', chartType: 'bar', metrics: ['achievement'], scope: 'all' },
    { id: 'w8', type: 'category', x: 6, y: 8, w: 6, h: 6, title: 'أفضل الفئات أداءً', chartType: 'bar', mode: 'autoTop', count: 5, metric: 'achievement' },
    { id: 'w9', type: 'kpi', x: 0, y: 14, w: 12, h: 6, title: 'أفضل المؤشرات أداءً', display: 'cards', mode: 'autoTop', count: 6 },
  ],
};

export function parseResultsConfig(raw: string | null): ResultsConfig {
  if (!raw) return DEFAULT_RESULTS_CONFIG;
  try {
    return resultsConfigSchema.parse(JSON.parse(raw));
  } catch {
    return DEFAULT_RESULTS_CONFIG;
  }
}
