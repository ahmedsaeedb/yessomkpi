import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { usePublicSettings } from '@/hooks/useSettings';
import { hexToHslTriplet, contrastForeground } from '@/lib/utils';
import type { Settings } from '@/types';

const BrandContext = createContext<Settings | undefined>(undefined);

const COLOR_VAR_MAP: Array<[keyof Settings, string, string]> = [
  ['primaryColor', '--primary', '--primary-foreground'],
  ['secondaryColor', '--secondary', '--secondary-foreground'],
  ['successColor', '--success', '--success-foreground'],
  ['warningColor', '--warning', '--warning-foreground'],
  ['dangerColor', '--destructive', '--destructive-foreground'],
];

export function BrandProvider({ children }: { children: ReactNode }) {
  const { data: settings } = usePublicSettings();

  useEffect(() => {
    if (!settings) return;
    const root = document.documentElement;

    for (const [key, cssVar, foregroundVar] of COLOR_VAR_MAP) {
      const hex = settings[key] as string;
      const hsl = hexToHslTriplet(hex);
      if (hsl) {
        root.style.setProperty(cssVar, hsl);
        root.style.setProperty(foregroundVar, contrastForeground(hex));
      }
    }

    if (settings.systemName) {
      document.title = `${settings.systemName} | ${settings.companyName}`;
    }
  }, [settings]);

  return <BrandContext.Provider value={settings}>{children}</BrandContext.Provider>;
}

export function useBrand() {
  return useContext(BrandContext);
}
