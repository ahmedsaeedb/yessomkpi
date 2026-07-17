import { LogOut, Moon, Scale, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardGridSkeleton } from '@/components/shared/TableSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { WidgetShell } from '@/components/widgets/WidgetShell';
import { WidgetRenderer } from '@/components/widgets/WidgetRenderer';
import { useDashboard } from '@/hooks/useDashboard';
import { useBrand } from '@/context/BrandContext';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { DEFAULT_RESULTS_CONFIG, GRID_COLS, GRID_ROW_HEIGHT } from '@/lib/resultsConfig';

export default function Results() {
  const brand = useBrand();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { data, isLoading } = useDashboard();

  const widgets = brand?.resultsConfig?.widgets ?? DEFAULT_RESULTS_CONFIG.widgets;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/90 px-6 py-4 backdrop-blur">
        <div className="flex items-center gap-3">
          {brand?.logoUrl ? (
            <img src={brand.logoUrl} alt={brand.companyName} className="h-9 w-9 rounded-lg object-contain" />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Scale className="h-5 w-5" />
            </div>
          )}
          <div>
            <p className="text-sm font-bold">{brand?.companyName}</p>
            <p className="text-xs text-muted-foreground">{brand?.systemName} · صفحة النتائج</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden text-sm text-muted-foreground sm:inline">{user?.fullName}</span>
          <Button variant="ghost" size="icon" onClick={toggleTheme} title="تبديل المظهر">
            {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={logout} title="تسجيل الخروج">
            <LogOut className="h-4.5 w-4.5" />
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {isLoading && <CardGridSkeleton count={4} />}

        {data && widgets.length === 0 && <EmptyState title="لم يتم تصميم صفحة النتائج بعد" />}

        {data && widgets.length > 0 && (
          <div
            className="grid gap-3"
            style={{
              gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`,
              gridAutoRows: `${GRID_ROW_HEIGHT}px`,
            }}
          >
            {widgets.map((w) => (
              <div
                key={w.id}
                style={{
                  gridColumn: `${w.x + 1} / span ${w.w}`,
                  gridRow: `${w.y + 1} / span ${w.h}`,
                }}
              >
                {w.type === 'text' ? (
                  <WidgetRenderer widget={w} data={data} />
                ) : (
                  <WidgetShell title={w.title}>
                    <WidgetRenderer widget={w} data={data} />
                  </WidgetShell>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
