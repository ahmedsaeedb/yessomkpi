import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus, Pencil, Trash2, Users as UsersIcon, ShieldCheck, Eye } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { DataTable } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UserFormDialog } from '@/components/users/UserFormDialog';
import { useUsers, useDeleteUser } from '@/hooks/useUsers';
import { useAuth } from '@/context/AuthContext';
import type { ManagedUser } from '@/types';
import { formatDate } from '@/lib/utils';

export default function Users() {
  const { user: currentUser } = useAuth();
  const { data, isLoading, isError } = useUsers();
  const deleteMutation = useDeleteUser();

  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ManagedUser | null>(null);

  function handleAdd() {
    setEditingUser(null);
    setFormOpen(true);
  }

  function handleEdit(user: ManagedUser) {
    setEditingUser(user);
    setFormOpen(true);
  }

  const columns = useMemo<ColumnDef<ManagedUser, any>[]>(
    () => [
      {
        accessorKey: 'full_name',
        header: 'المستخدم',
        cell: ({ row }) => (
          <div>
            <p className="font-semibold">{row.original.full_name}</p>
            <p className="text-xs text-muted-foreground" dir="ltr">
              @{row.original.username}
            </p>
          </div>
        ),
      },
      {
        accessorKey: 'role',
        header: 'الصلاحية',
        cell: ({ row }) =>
          row.original.role === 'admin' ? (
            <Badge variant="secondary" className="gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              مدير
            </Badge>
          ) : (
            <Badge variant="muted" className="gap-1">
              <Eye className="h-3.5 w-3.5" />
              مستخدم عرض
            </Badge>
          ),
      },
      {
        accessorKey: 'created_at',
        header: 'تاريخ الإنشاء',
        cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatDate(row.original.created_at)}</span>,
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => {
          const isSelf = row.original.id === currentUser?.id;
          return (
            <div className="flex justify-start gap-1">
              <Button variant="ghost" size="icon" onClick={() => handleEdit(row.original)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                disabled={isSelf}
                title={isSelf ? 'لا يمكنك حذف حسابك الخاص' : undefined}
                onClick={() => setDeleteTarget(row.original)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          );
        },
      },
    ],
    [currentUser?.id]
  );

  return (
    <div>
      <PageHeader
        title="إدارة المستخدمين"
        description="التحكم في حسابات الوصول لنظام إدارة المؤشرات وصفحة النتائج"
        actions={
          <Button onClick={handleAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            إضافة مستخدم
          </Button>
        }
      />

      <Card>
        <CardContent className="p-5">
          {isLoading && <TableSkeleton rows={4} cols={4} />}
          {isError && <EmptyState title="تعذر تحميل المستخدمين" description="يرجى المحاولة مرة أخرى" />}
          {data && data.length === 0 && (
            <EmptyState
              icon={UsersIcon}
              title="لا يوجد مستخدمون إضافيون بعد"
              description="أضف مستخدمين جدد وحدد صلاحياتهم (مدير أو مستخدم عرض)"
              actionLabel="إضافة مستخدم"
              onAction={handleAdd}
            />
          )}
          {data && data.length > 0 && <DataTable columns={columns} data={data} />}
        </CardContent>
      </Card>

      <UserFormDialog open={formOpen} onOpenChange={setFormOpen} user={editingUser} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="حذف المستخدم"
        description={`هل أنت متأكد من حذف المستخدم "${deleteTarget?.full_name}"؟ لن يتمكن بعدها من تسجيل الدخول.`}
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
