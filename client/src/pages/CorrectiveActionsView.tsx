import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { RiskLevelBadge } from '@/components/correctiveActions/RiskLevelBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useCorrectiveActions } from '@/hooks/useCorrectiveActions';

export default function CorrectiveActionsView() {
  const { data, isLoading } = useCorrectiveActions();

  return (
    <div>
      <PageHeader title="الإجراءات التصحيحية" description="سجل المخاطر والإجراءات التصحيحية المرتبطة بها" />

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      )}

      {data && data.length === 0 && <EmptyState title="لا يوجد محتوى بعد" />}

      {data && data.length > 0 && (
        <div className="space-y-4">
          {data.map((action) => (
            <Card key={action.id}>
              <CardContent className="space-y-3 p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-lg font-bold text-primary">{action.risk_type}</h2>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>مستوى الخطر:</span>
                    <RiskLevelBadge level={action.risk_level} />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">الاحتمالية:</span>
                    <RiskLevelBadge level={action.probability} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">التأثير:</span>
                    <RiskLevelBadge level={action.impact} />
                  </div>
                  {action.treatment && (
                    <div className="sm:col-span-2">
                      <span className="text-muted-foreground">آلية المعالجة: </span>
                      <span className="font-medium">{action.treatment}</span>
                    </div>
                  )}
                  {action.responsible && (
                    <div className="sm:col-span-2">
                      <span className="text-muted-foreground">الجهة المسؤولة: </span>
                      <span className="font-medium">{action.responsible}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
