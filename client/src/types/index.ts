export type Status = 'active' | 'inactive';
export type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';
export type KpiStatus = 'excellent' | 'on-track' | 'at-risk' | 'behind';
export type UserRole = 'admin' | 'viewer';

export interface User {
  id: number;
  username: string;
  fullName: string;
  role: UserRole;
}

export interface ManagedUser {
  id: number;
  username: string;
  full_name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
  status: Status;
  sort_order: number;
  kpi_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Kpi {
  id: number;
  category_id: number;
  category_name?: string;
  name: string;
  description: string | null;
  unit: string;
  target: number;
  color: string;
  icon: string;
  sort_order: number;
  status: Status;
  notes: string | null;
  latestValue: number | null;
  latestQuarter: Quarter | null;
  growthPercent: number;
  achievementPercent: number;
  difference: number;
  created_at: string;
  updated_at: string;
}

export interface KpiValue {
  id: number;
  kpi_id: number;
  kpi_name?: string;
  kpi_unit?: string;
  category_id?: number;
  category_name?: string;
  year: number;
  quarter: Quarter;
  current_value: number;
  previous_value: number;
  target: number;
  notes: string | null;
  growthPercent: number;
  achievementPercent: number;
  difference: number;
  status: KpiStatus;
  updated_at: string;
}

export interface DashboardSummary {
  year: number;
  quarter: Quarter;
  totals: {
    categories: number;
    kpis: number;
    achievementPercent: number;
    growthPercent: number;
  };
  quarterComparison: Array<{ quarter: Quarter; achievementPercent: number; growthPercent: number }>;
  yearComparison: Array<{ year: number; achievementPercent: number }>;
  topCategories: Array<{ id: number; name: string; achievementPercent: number; growthPercent: number; kpiCount: number }>;
  topKpis: Array<{
    id: number;
    name: string;
    categoryId: number;
    categoryName: string;
    unit: string;
    color: string;
    icon: string;
    currentValue: number;
    target: number;
    growthPercent: number;
    achievementPercent: number;
    difference: number;
    status: KpiStatus;
  }>;
  latestUpdates: Array<{
    kpiId: number;
    kpiName: string;
    categoryId: number;
    categoryName: string;
    year: number;
    quarter: Quarter;
    currentValue: number;
    unit: string;
    updatedAt: string;
    growthPercent: number;
    achievementPercent: number;
    status: KpiStatus;
  }>;
  costCenters: Array<{
    id: number;
    item: string;
    amount: number;
    date: string;
    year: number;
    quarter: Quarter;
    notes: string | null;
  }>;
}

export interface CostCenter {
  id: number;
  item: string;
  amount: number;
  date: string;
  year: number;
  quarter: Quarter;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type PlanSection = 'general_plan' | 'corrective_actions';

export interface PlanItem {
  id: number;
  section: PlanSection;
  title: string;
  details: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ReportRow {
  id: number;
  categoryName: string;
  kpiName: string;
  unit: string;
  year: number;
  quarter: Quarter;
  currentValue: number;
  previousValue: number;
  target: number;
  growthPercent: number;
  achievementPercent: number;
  difference: number;
  status: KpiStatus;
  updatedAt: string;
}

export type WidgetType = 'stat' | 'trend' | 'category' | 'kpi' | 'radial' | 'updates' | 'text' | 'costCenters';

export interface BaseWidget {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  title?: string;
}

export interface StatWidget extends BaseWidget {
  type: 'stat';
  metric: 'categoriesCount' | 'kpisCount' | 'avgAchievement' | 'avgGrowth' | 'kpiValue' | 'categoryValue';
  kpiId?: number;
  kpiField?: 'current' | 'target' | 'achievement' | 'growth' | 'difference';
  categoryId?: number;
  color?: string;
  icon?: string;
  showTrend?: boolean;
}

export interface TrendWidget extends BaseWidget {
  type: 'trend';
  timeframe: 'quarterly' | 'yearly';
  chartType: 'area' | 'line' | 'bar';
  metrics: Array<'achievement' | 'growth'>;
  scope: 'all' | 'category' | 'kpi';
  categoryId?: number;
  kpiId?: number;
}

export interface CategoryWidget extends BaseWidget {
  type: 'category';
  chartType: 'bar' | 'donut';
  mode: 'autoTop' | 'autoBottom' | 'manual';
  count?: number;
  categoryIds?: number[];
  metric: 'achievement' | 'growth' | 'kpiCount';
}

export interface KpiWidget extends BaseWidget {
  type: 'kpi';
  display: 'cards' | 'table';
  mode: 'autoTop' | 'autoBottom' | 'manual' | 'byCategory';
  count?: number;
  kpiIds?: number[];
  categoryId?: number;
  columns?: Array<'name' | 'category' | 'current' | 'target' | 'achievement' | 'growth' | 'status' | 'updatedAt'>;
}

export interface RadialWidget extends BaseWidget {
  type: 'radial';
  source: 'overall' | 'category' | 'kpi';
  categoryId?: number;
  kpiId?: number;
  color?: string;
}

export interface UpdatesWidget extends BaseWidget {
  type: 'updates';
  count: number;
  categoryId?: number;
}

export interface TextWidget extends BaseWidget {
  type: 'text';
  text: string;
  align: 'right' | 'center' | 'left';
  size: 'sm' | 'md' | 'lg' | 'xl';
}

export interface CostCentersWidget extends BaseWidget {
  type: 'costCenters';
  display: 'table' | 'cards';
  scope: 'all' | 'year' | 'quarter';
  year?: number;
  quarter?: Quarter;
  sortBy: 'date' | 'amount';
  limit?: number;
}

export type Widget =
  | StatWidget
  | TrendWidget
  | CategoryWidget
  | KpiWidget
  | RadialWidget
  | UpdatesWidget
  | TextWidget
  | CostCentersWidget;

export interface ResultsConfig {
  widgets: Widget[];
}

export interface Settings {
  companyName: string;
  systemName: string;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  successColor: string;
  warningColor: string;
  dangerColor: string;
  defaultTheme: 'light' | 'dark';
  resultsConfig: ResultsConfig;
}

export interface ReportFilters {
  categoryId?: string;
  kpiId?: string;
  year?: string;
  quarter?: string;
  status?: string;
  search?: string;
}
