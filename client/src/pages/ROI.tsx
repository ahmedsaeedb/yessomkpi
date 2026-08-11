import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus, Pencil, Trash2, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { DataTable } from '@/components/shared/DataTable';
import { RoiFormDialog } from '@/components/roi/RoiFormDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRoiEntries, useDeleteRoiEntry } from '@/hooks/useRoi';
import { cn, formatDate, formatNumber, quarterLabel } from '@/lib/utils';
import type { RoiEntry } from '@/types';

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - 4 + i);

function roiPercent(amount: number, spend: number): number | null {
  return spend ? ((amount - spend) / spend) * 100 : null;
}

export default function ROI() {
  const [year, setYear] = useState<string>('all');
  const [quarter, setQuarter] = useState<string>('all');

  const { data, isLoading, isError } = useRoiEntries({
    year: year === 'all' ? undefined : Number(year),
    quarter: quarter === 'all' ? undefined : quarter,
  });
  const deleteMutation = useDeleteRoiEntry();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<RoiEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RoiEntry | null>(null);

  function handleAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function handleEdit(row: RoiEntry) {
    setEditing(row);
    setFormOpen(true);
  }

  const columns = useMemo<ColumnDef<RoiEntry, any>[]>(
    () => [
      { accessorKey: 'channel', header: 'قناة الاستثمار', cell: ({ row }) => <span className="font-semibold">{row.original.channel}</span> },
      { accessorKey: 'amount', header: 'العائد', cell: ({ row }) => <span className="tabular-nums">{formatNumber(row.original.amount)}</span> },
      { accessorKey: 'spend', header: 'المبلغ المدفوع', cell: ({ row }) => <span className="tabular-nums">{formatNumber(row.original.spend)}</span> },
      {
        id: 'roi',
        header: 'نسبة العائد',
        cell: ({ row }) => {
          const pct = roiPercent(row.original.amount, row.original.spend);
          if (pct === null) return <span className="text-muted-foreground">—</span>;
          return (
            <span className={cn('font-bold tabular-nums', pct >= 0 ? 'text-success' : 'text-destructive')}>
              {pct.toFixed(2)}%
            </span>
          );
        },
      },
      { accessorKey: 'date', header: 'التاريخ', cell: ({ row }) => <span className="text-sm">{formatDate(row.original.date)}</span> },
      { accessorKey: 'quarter', header: 'الربع', cell: ({ row }) => <span>{quarterLabel(row.original.quarter)}</span> },
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
        title="العائد من الاستثمار"
        description="متابعة العائد على الاستثمار حسب قناة الاستثمار والفترة"
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
          {isLoading && <TableSkeleton rows={5} cols={7} />}
          {isError && <EmptyState title="تعذر تحميل بيانات العائد على الاستثمار" description="يرجى المحاولة مرة أخرى" />}
          {data && data.length === 0 && (
            <EmptyState
              icon={TrendingUp}
              title="لا توجد بنود بعد"
              description="ابدأ بإضافة أول بند للعائد على الاستثمار"
              actionLabel="إضافة بند"
              onAction={handleAdd}
            />
          )}
          {data && data.length > 0 && <DataTable columns={columns} data={data} />}
        </CardContent>
      </Card>

      <RoiFormDialog open={formOpen} onOpenChange={setFormOpen} entry={editing} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="حذف البند"
        description={`هل أنت متأكد من حذف بند "${deleteTarget?.channel}"؟`}
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
