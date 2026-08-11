import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus, Pencil, Trash2, ShieldAlert } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { DataTable } from '@/components/shared/DataTable';
import { CorrectiveActionFormDialog } from '@/components/correctiveActions/CorrectiveActionFormDialog';
import { RiskLevelBadge } from '@/components/correctiveActions/RiskLevelBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCorrectiveActions, useDeleteCorrectiveAction } from '@/hooks/useCorrectiveActions';
import type { CorrectiveAction } from '@/types';

export default function CorrectiveActions() {
  const { data, isLoading, isError } = useCorrectiveActions();
  const deleteMutation = useDeleteCorrectiveAction();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CorrectiveAction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CorrectiveAction | null>(null);

  function handleAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function handleEdit(row: CorrectiveAction) {
    setEditing(row);
    setFormOpen(true);
  }

  const columns = useMemo<ColumnDef<CorrectiveAction, any>[]>(
    () => [
      { accessorKey: 'risk_type', header: 'نوع الخطر', cell: ({ row }) => <span className="font-semibold">{row.original.risk_type}</span> },
      { accessorKey: 'probability', header: 'الاحتمالية', cell: ({ row }) => <RiskLevelBadge level={row.original.probability} /> },
      { accessorKey: 'impact', header: 'التأثير', cell: ({ row }) => <RiskLevelBadge level={row.original.impact} /> },
      { accessorKey: 'risk_level', header: 'مستوى الخطر', cell: ({ row }) => <RiskLevelBadge level={row.original.risk_level} /> },
      { accessorKey: 'treatment', header: 'آلية المعالجة', cell: ({ row }) => <span className="text-sm">{row.original.treatment ?? '—'}</span> },
      { accessorKey: 'responsible', header: 'الجهة المسؤولة', cell: ({ row }) => <span className="text-sm">{row.original.responsible ?? '—'}</span> },
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
        title="الإجراءات التصحيحية"
        description="سجل المخاطر والإجراءات التصحيحية المرتبطة بها"
        actions={
          <Button onClick={handleAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            إضافة إجراء
          </Button>
        }
      />

      <Card>
        <CardContent className="p-5">
          {isLoading && <TableSkeleton rows={5} cols={6} />}
          {isError && <EmptyState title="تعذر تحميل الإجراءات التصحيحية" description="يرجى المحاولة مرة أخرى" />}
          {data && data.length === 0 && (
            <EmptyState
              icon={ShieldAlert}
              title="لا توجد إجراءات بعد"
              description="ابدأ بإضافة أول إجراء تصحيحي"
              actionLabel="إضافة إجراء"
              onAction={handleAdd}
            />
          )}
          {data && data.length > 0 && <DataTable columns={columns} data={data} />}
        </CardContent>
      </Card>

      <CorrectiveActionFormDialog open={formOpen} onOpenChange={setFormOpen} action={editing} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="حذف الإجراء"
        description={`هل أنت متأكد من حذف الإجراء المتعلق بـ "${deleteTarget?.risk_type}"؟`}
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
