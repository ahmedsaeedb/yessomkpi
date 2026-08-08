import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePlanItems } from '@/hooks/usePlanItems';
import type { PlanSection } from '@/types';

interface PlanItemsViewProps {
  section: PlanSection;
  title: string;
  description: string;
}

export function PlanItemsView({ section, title, description }: PlanItemsViewProps) {
  const { data, isLoading } = usePlanItems(section);

  return (
    <div>
      <PageHeader title={title} description={description} />

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      )}

      {data && data.length === 0 && <EmptyState title="لا يوجد محتوى بعد" />}

      {data && data.length > 0 && (
        <div className="space-y-4">
          {data.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <h2 className="text-lg font-bold text-primary">{item.title}</h2>
                {item.details && (
                  <p className="mt-2 whitespace-pre-wrap leading-relaxed text-foreground/90">{item.details}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
