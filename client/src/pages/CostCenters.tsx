import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus, Pencil, Trash2, Wallet } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { DataTable } from '@/components/shared/DataTable';
import { CostCenterFormDialog } from '@/components/costCenters/CostCenterFormDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCostCenters, useDeleteCostCenter } from '@/hooks/useCostCenters';
import { formatDate, formatNumber, quarterLabel } from '@/lib/utils';
import type { CostCenter } from '@/types';

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - 4 + i);

export default function CostCenters() {
  const [year, setYear] = useState<string>('all');
  const [quarter, setQuarter] = useState<string>('all');

  const { data, isLoading, isError } = useCostCenters({
    year: year === 'all' ? undefined : Number(year),
    quarter: quarter === 'all' ? undefined : quarter,
  });
  const deleteMutation = useDeleteCostCenter();

  const [formOpen, setFormOpen] = useState(false);
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

  const columns = useMemo<ColumnDef<CostCenter, any>[]>(
    () => [
      { accessorKey: 'item', header: 'البند', cell: ({ row }) => <span className="font-semibold">{row.original.item}</span> },
      {
        accessorKey: 'amount',
        header: 'المبلغ',
        cell: ({ row }) => <span className="tabular-nums">{formatNumber(row.original.amount)}</span>,
      },
      {
        accessorKey: 'date',
        header: 'التاريخ',
        cell: ({ row }) => <span className="text-sm">{formatDate(row.original.date)}</span>,
      },
      { accessorKey: 'year', header: 'السنة' },
      {
        accessorKey: 'quarter',
        header: 'الربع',
        cell: ({ row }) => <span>{quarterLabel(row.original.quarter)}</span>,
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
        description="إدارة بنود التكلفة حسب السنة والربع"
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
            <Button onClick={handleAdd} className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة بند
            </Button>
          </div>
        }
      />

      <Card>
        <CardContent className="p-5">
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
          {data && data.length > 0 && <DataTable columns={columns} data={data} />}
        </CardContent>
      </Card>

      <CostCenterFormDialog open={formOpen} onOpenChange={setFormOpen} costCenter={editing} />

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
