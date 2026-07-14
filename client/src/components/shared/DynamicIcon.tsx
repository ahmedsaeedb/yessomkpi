import { icons, HelpCircle, type LucideProps } from 'lucide-react';

interface DynamicIconProps extends LucideProps {
  name: string;
}

export function DynamicIcon({ name, ...props }: DynamicIconProps) {
  const Icon = (icons as Record<string, React.ComponentType<LucideProps>>)[name] ?? HelpCircle;
  return <Icon {...props} />;
}

export const ICON_OPTIONS = [
  'TrendingUp',
  'Target',
  'Wallet',
  'Award',
  'Users',
  'MessageSquare',
  'UserCheck',
  'FileText',
  'Heart',
  'Globe',
  'BarChart3',
  'PieChart',
  'LineChart',
  'Megaphone',
  'Star',
  'ThumbsUp',
  'Mail',
  'Phone',
  'Calendar',
  'Briefcase',
  'Building2',
  'Scale',
  'Gavel',
  'ShieldCheck',
  'Handshake',
  'Newspaper',
  'Share2',
  'Eye',
  'MousePointerClick',
  'DollarSign',
];
