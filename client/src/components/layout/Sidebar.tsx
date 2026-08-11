import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FolderKanban,
  Gauge,
  CalendarRange,
  FileBarChart,
  Settings as SettingsIcon,
  Users as UsersIcon,
  LayoutGrid,
  Wallet,
  ClipboardList,
  ShieldAlert,
  TrendingUp,
  LogOut,
  Scale,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useBrand } from '@/context/BrandContext';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';

const NAV_ITEMS = [
  { to: '/', label: 'الرئيسية', icon: LayoutDashboard, end: true },
  { to: '/general-plan-settings', label: 'الخطة العامة', icon: ClipboardList },
  { to: '/quarter-data', label: 'البيانات السنوية', icon: CalendarRange },
  { to: '/categories', label: 'الفئات', icon: FolderKanban },
  { to: '/kpis', label: 'المؤشرات', icon: Gauge },
  { to: '/cost-centers', label: 'مراكز التكلفة', icon: Wallet },
  { to: '/roi', label: 'العائد من الاستثمار', icon: TrendingUp },
  { to: '/reports', label: 'التقارير', icon: FileBarChart },
  { to: '/corrective-actions-settings', label: 'الإجراءات التصحيحية', icon: ShieldAlert },
  { to: '/settings', label: 'الإعدادات', icon: SettingsIcon },
  { to: '/display-settings', label: 'تخصيص العرض', icon: LayoutGrid },
  { to: '/users', label: 'المستخدمين', icon: UsersIcon },
];

export function Sidebar({ className }: { className?: string }) {
  const { user, logout } = useAuth();
  const brand = useBrand();

  return (
    <aside
      className={cn(
        'flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground border-l border-sidebar-border',
        className
      )}
    >
      <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-5">
        {brand?.logoUrl ? (
          <img src={brand.logoUrl} alt={brand.companyName} className="h-10 w-10 rounded-lg object-contain bg-white/10 p-1" />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/20 text-secondary">
            <Scale className="h-5 w-5" />
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{brand?.companyName ?? 'يسوم للمحاماة'}</p>
          <p className="truncate text-xs text-sidebar-foreground/60">{brand?.systemName ?? 'مؤشرات أداء التسويق'}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-thin px-3 py-4">
        {NAV_ITEMS.map((item, index) => (
          <motion.div
            key={item.to}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: index * 0.04 }}
          >
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-white shadow-sm'
                    : 'text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-white'
                )
              }
            >
              <item.icon className="h-4.5 w-4.5 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          </motion.div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <Avatar className="h-9 w-9">
            <AvatarImage src="" alt={user?.fullName} />
            <AvatarFallback className="bg-secondary/20 text-secondary">
              {user?.fullName?.charAt(0) ?? 'م'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{user?.fullName}</p>
            <p className="truncate text-xs text-sidebar-foreground/60">مدير النظام</p>
          </div>
          <button
            onClick={logout}
            title="تسجيل الخروج"
            className="flex h-8 w-8 items-center justify-center rounded-md text-sidebar-foreground/70 transition-colors hover:bg-destructive/20 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
