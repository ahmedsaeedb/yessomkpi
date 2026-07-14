export type Status = 'active' | 'inactive';
export type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export interface UserRow {
  id: number;
  username: string;
  password_hash: string;
  full_name: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface SettingsRow {
  id: number;
  company_name: string;
  system_name: string;
  logo_path: string | null;
  primary_color: string;
  secondary_color: string;
  success_color: string;
  warning_color: string;
  danger_color: string;
  default_theme: string;
  public_dashboard_enabled: number;
  public_dashboard_password_hash: string | null;
  updated_at: string;
}

export interface CategoryRow {
  id: number;
  name: string;
  description: string | null;
  status: Status;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface KpiRow {
  id: number;
  category_id: number;
  name: string;
  description: string | null;
  unit: string;
  target: number;
  color: string;
  icon: string;
  sort_order: number;
  status: Status;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface KpiValueRow {
  id: number;
  kpi_id: number;
  year: number;
  quarter: Quarter;
  current_value: number;
  previous_value: number;
  target: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthTokenPayload {
  sub: number;
  username: string;
  role: string;
}

export interface PublicTokenPayload {
  role: 'public';
}
