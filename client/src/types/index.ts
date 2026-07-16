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
  topCategories: Array<{ id: number; name: string; achievementPercent: number }>;
  topKpis: Array<{
    id: number;
    name: string;
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
}

export interface ReportFilters {
  categoryId?: string;
  kpiId?: string;
  year?: string;
  quarter?: string;
  status?: string;
  search?: string;
}
