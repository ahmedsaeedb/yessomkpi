import type { ResultsConfig } from '@/types';

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

export const GRID_COLS = 12;
export const GRID_ROW_HEIGHT = 32;
