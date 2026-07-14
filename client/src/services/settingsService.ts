import { api } from '@/lib/axios';
import type { Settings } from '@/types';

export interface SettingsInput {
  companyName?: string;
  systemName?: string;
  primaryColor?: string;
  secondaryColor?: string;
  successColor?: string;
  warningColor?: string;
  dangerColor?: string;
  defaultTheme?: 'light' | 'dark';
  publicDashboardEnabled?: boolean;
  publicDashboardPassword?: string;
}

export const settingsService = {
  get: () => api.get<Settings>('/settings').then((r) => r.data),

  getPublic: () => api.get<Settings>('/settings/public').then((r) => r.data),

  update: (data: SettingsInput) => api.put<Settings>('/settings', data).then((r) => r.data),

  uploadLogo: (file: File) => {
    const form = new FormData();
    form.append('logo', file);
    return api
      .post<Settings>('/settings/logo', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data);
  },
};
