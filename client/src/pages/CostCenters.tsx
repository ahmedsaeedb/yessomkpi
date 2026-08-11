import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus, Pencil, Trash2, Wallet, Tags } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { DataTable } from '@/components/shared/DataTable';
import { CostCenterFormDialog } from '@/components/costCenters/CostCenterFormDialog';
import { CostCenterCategoryManagerDialog } from '@/components/costCenters/CostCenterCategoryManagerDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCostCenters, useDeleteCostCenter } from '@/hooks/useCostCenters';
import { formatNumber, formatPeriod, quarterLabel } from '@/lib/utils';
import type { CostCenter } from '@/types';

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - 4 + i);
const UNCATEGORIZED = 'بدون تصنيف';

export default function CostCenters() {
  const [year, setYear] = useState<string>('all');
  const [quarter, setQuarter] = useState<string>('all');

  const { data, isLoading, isError } = useCostCenters({
    year: year === 'all' ? undefined : Number(year),
    quarter: quarter === 'all' ? undefined : quarter,
  });
  const deleteMutation = useDeleteCostCenter();

  const [formOpen, setFormOpen] = useState(false);
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);
  const [editing, setEditing] = useState<CostCenter | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CostCenter | null>(null);

  function handleAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function handleEdit(row: CostCenter) {
    setEditing(row);
    setFormOpen(true);
  }

  const groups = useMemo(() => {
    const map = new Map<string, CostCenter[]>();
    (data ?? []).forEach((row) => {
      const key = row.category_name ?? UNCATEGORIZED;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(row);
    });
    return Array.from(map.entries());
  }, [data]);

  const columns = useMemo<ColumnDef<CostCenter, any>[]>(
    () => [
      { accessorKey: 'item', header: 'البند', cell: ({ row }) => <span className="font-semibold">{row.original.item}</span> },
      {
        accessorKey: 'amount',
        header: 'المبلغ',
        cell: ({ row }) => <span className="tabular-nums">{formatNumber(row.original.amount)}</span>,
      },
      {
        id: 'period',
        header: 'الفترة',
        cell: ({ row }) => <span className="text-sm">{formatPeriod(row.original.date_from, row.original.date_to)}</span>,
      },
      { accessorKey: 'year', header: 'السنة' },
      {
        accessorKey: 'quarter',
        header: 'الربع',
        cell: ({ row }) => <span>{quarterLabel(row.original.quarter)}</span>,
      },
      {
        id: 'notes',
        header: 'ملاحظات',
        cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.notes ?? '—'}</span>,
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-start gap-1">
            <Button variant="ghost" size="icon" onClick={() => handleEdit(row.original)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(row.original)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div>
      <PageHeader
        title="مراكز التكلفة"
        description="إدارة بنود التكلفة مجمّعة حسب التصنيف"
        actions={
          <div className="flex flex-wrap gap-2">
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="w-32">
                <SelectValue />
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
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأرباع</SelectItem>
                {(['Q1', 'Q2', 'Q3', 'Q4'] as const).map((q) => (
                  <SelectItem key={q} value={q}>
                    {quarterLabel(q)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => setCategoryManagerOpen(true)} className="gap-2">
              <Tags className="h-4 w-4" />
              إدارة التصنيفات
            </Button>
            <Button onClick={handleAdd} className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة بند
            </Button>
          </div>
        }
      />

      {isLoading && <TableSkeleton rows={5} cols={6} />}
      {isError && <EmptyState title="تعذر تحميل مراكز التكلفة" description="يرجى المحاولة مرة أخرى" />}
      {data && data.length === 0 && (
        <EmptyState
          icon={Wallet}
          title="لا توجد بنود بعد"
          description="ابدأ بإضافة أول بند لمركز التكلفة"
          actionLabel="إضافة بند"
          onAction={handleAdd}
        />
      )}

      {data && data.length > 0 && (
        <div className="space-y-6">
          {groups.map(([categoryName, rows]) => (
            <div key={categoryName}>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-muted-foreground">
                {categoryName}
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">{rows.length}</span>
              </h3>
              <Card>
                <CardContent className="p-5">
                  <DataTable columns={columns} data={rows} />
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}

      <CostCenterFormDialog open={formOpen} onOpenChange={setFormOpen} costCenter={editing} />
      <CostCenterCategoryManagerDialog open={categoryManagerOpen} onOpenChange={setCategoryManagerOpen} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="حذف البند"
        description={`هل أنت متأكد من حذف بند "${deleteTarget?.item}"؟`}
        isLoading={deleteMutation.isPending}
        onConfirm={async () => {
          if (deleteTarget) {
            await deleteMutation.mutateAsync(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
      />
    </div>
  );
}
