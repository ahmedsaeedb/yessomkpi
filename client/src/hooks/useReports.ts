import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { downloadBlob, reportService } from '@/services/reportService';
import { extractErrorMessage } from '@/lib/axios';
import type { ReportFilters } from '@/types';

export function useReportData(filters: ReportFilters) {
  return useQuery({
    queryKey: ['reports', filters],
    queryFn: () => reportService.list(filters),
  });
}

export function useExportReport() {
  return useMutation({
    mutationFn: async ({ filters, format }: { filters: ReportFilters; format: 'pdf' | 'excel' }) => {
      const blob = format === 'pdf' ? await reportService.exportPdf(filters) : await reportService.exportExcel(filters);
      const ext = format === 'pdf' ? 'pdf' : 'xlsx';
      downloadBlob(blob, `تقرير-مؤشرات-الأداء.${ext}`);
    },
    onSuccess: () => toast.success('تم تصدير التقرير بنجاح'),
    onError: (error) => toast.error(extractErrorMessage(error, 'تعذر تصدير التقرير')),
  });
}
