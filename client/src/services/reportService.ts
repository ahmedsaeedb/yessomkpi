import { api } from '@/lib/axios';
import type { ReportFilters, ReportRow } from '@/types';

function buildParams(filters: ReportFilters) {
  const params: Record<string, string> = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params[key] = String(value);
  });
  return params;
}

export const reportService = {
  list: (filters: ReportFilters) =>
    api.get<ReportRow[]>('/reports', { params: buildParams(filters) }).then((r) => r.data),

  exportPdf: (filters: ReportFilters) =>
    api
      .get('/reports/export/pdf', { params: buildParams(filters), responseType: 'blob' })
      .then((r) => r.data as Blob),

  exportExcel: (filters: ReportFilters) =>
    api
      .get('/reports/export/excel', { params: buildParams(filters), responseType: 'blob' })
      .then((r) => r.data as Blob),
};

export function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
