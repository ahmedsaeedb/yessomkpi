import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { FileDown, FileSpreadsheet, Printer, Search, FileBarChart } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCategories } from '@/hooks/useCategories';
import { useKpis } from '@/hooks/useKpis';
import { useExportReport, useReportData } from '@/hooks/useReports';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDate, formatNumber, quarterLabel } from '@/lib/utils';
import type { Quarter, ReportRow } from '@/types';

const QUARTERS: Quarter[] = ['Q1', 'Q2', 'Q3', 'Q4'];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - 3 + i);

export default function Reports() {
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('all');
  const [kpiId, setKpiId] = useState('all');
  const [year, setYear] = useState('all');
  const [quarter, setQuarter] = useState('all');
  const [status, setStatus] = useState('all');
  const debouncedSearch = useDebounce(search);

  const filters = {
    search: debouncedSearch || undefined,
    categoryId: categoryId === 'all' ? undefined : categoryId,
    kpiId: kpiId === 'all' ? undefined : kpiId,
    year: year === 'all' ? undefined : year,
    quarter: quarter === 'all' ? undefined : quarter,
    status: status === 'all' ? undefined : status,
  };

  const { data: categories } = useCategories();
  const { data: kpis } = useKpis({ categoryId: categoryId === 'all' ? undefined : categoryId });
  const { data, isLoading, isError } = useReportData(filters);
  const exportMutation = useExportReport();

  const columns = useMemo<ColumnDef<ReportRow, any>[]>(
    () => [
      { accessorKey: 'categoryName', header: 'الفئة' },
      { accessorKey: 'kpiName', header: 'المؤشر' },
      {
        id: 'period',
        header: 'الفترة',
        accessorFn: (row) => `${quarterLabel(row.quarter)} ${row.year}`,
      },
      {
        accessorKey: 'currentValue',
        header: 'القيمة الحالية',
        cell: ({ row }) => (
          <span className="tabular-nums">
            {formatNumber(row.original.currentValue)} {row.original.unit}
          </span>
        ),
      },
      {
        accessorKey: 'target',
        header: 'المستهدف',
        cell: ({ row }) => (
          <span className="tabular-nums">
            {formatNumber(row.original.target)} {row.original.unit}
          </span>
        ),
      },
      {
        accessorKey: 'growthPercent',
        header: 'نسبة النمو',
        cell: ({ row }) => <span className="tabular-nums">{formatNumber(row.original.growthPercent)}%</span>,
      },
      {
        accessorKey: 'achievementPercent',
        header: 'نسبة الإنجاز',
        cell: ({ row }) => <span className="tabular-nums font-semibold">{formatNumber(row.original.achievementPercent)}%</span>,
      },
      {
        accessorKey: 'status',
        header: 'الحالة',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'updatedAt',
        header: 'آخر تحديث',
        cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatDate(row.original.updatedAt)}</span>,
      },
    ],
    []
  );

  return (
    <div>
      <PageHeader
        title="التقارير"
        description="تقرير تفاعلي شامل لجميع مؤشرات الأداء مع إمكانية التصفية والتصدير"
        actions={
          <div className="flex flex-wrap gap-2 print:hidden">
            <Button variant="outline" className="gap-2" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              طباعة
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              disabled={exportMutation.isPending}
              onClick={() => exportMutation.mutate({ filters, format: 'excel' })}
            >
              <FileSpreadsheet className="h-4 w-4" />
              تصدير Excel
            </Button>
            <Button
              className="gap-2"
              disabled={exportMutation.isPending}
              onClick={() => exportMutation.mutate({ filters, format: 'pdf' })}
            >
              <FileDown className="h-4 w-4" />
              تصدير PDF
            </Button>
          </div>
        }
      />

      <Card className="mb-4 print:hidden">
        <CardContent className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 lg:grid-cols-6">
          <div className="relative lg:col-span-2">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="بحث..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-9" />
          </div>

          <Select value={categoryId} onValueChange={(v) => { setCategoryId(v); setKpiId('all'); }}>
            <SelectTrigger>
              <SelectValue placeholder="الفئة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الفئات</SelectItem>
              {categories?.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={kpiId} onValueChange={setKpiId}>
            <SelectTrigger>
              <SelectValue placeholder="المؤشر" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المؤشرات</SelectItem>
              {kpis?.map((k) => (
                <SelectItem key={k.id} value={String(k.id)}>
                  {k.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={year} onValueChange={setYear}>
            <SelectTrigger>
              <SelectValue placeholder="السنة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع السنوات</SelectItem>
              {YEARS.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={quarter} onValueChange={setQuarter}>
            <SelectTrigger>
              <SelectValue placeholder="الربع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الأرباع</SelectItem>
              {QUARTERS.map((q) => (
                <SelectItem key={q} value={q}>
                  {quarterLabel(q)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value="excellent">ممتاز</SelectItem>
              <SelectItem value="on-track">على المسار</SelectItem>
              <SelectItem value="at-risk">بحاجة لمتابعة</SelectItem>
              <SelectItem value="behind">متأخر</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          {isLoading && <TableSkeleton rows={6} cols={9} />}
          {isError && <EmptyState title="تعذر تحميل التقرير" description="يرجى المحاولة مرة أخرى" />}
          {data && data.length === 0 && (
            <EmptyState icon={FileBarChart} title="لا توجد بيانات مطابقة" description="جرّب تعديل عوامل التصفية للحصول على نتائج" />
          )}
          {data && data.length > 0 && <DataTable columns={columns} data={data} />}
        </CardContent>
      </Card>
    </div>
  );
}
