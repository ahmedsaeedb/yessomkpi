import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { useTheme } from '@/context/ThemeContext';

interface RadialGaugeProps {
  value: number;
  label: string;
  color?: string;
}

export function RadialGauge({ value, label, color = '#0B2545' }: RadialGaugeProps) {
  const { theme } = useTheme();
  const clamped = Math.min(150, Math.max(0, value));

  const options: ApexOptions = {
    chart: { type: 'radialBar', fontFamily: 'Tajawal, sans-serif', background: 'transparent' },
    theme: { mode: theme },
    colors: [color],
    plotOptions: {
      radialBar: {
        hollow: { size: '65%' },
        track: { background: theme === 'dark' ? '#2a3441' : '#eef1f5' },
        dataLabels: {
          name: { fontSize: '13px', fontFamily: 'Tajawal', color: theme === 'dark' ? '#cbd5e1' : '#64748b' },
          value: {
            fontSize: '24px',
            fontWeight: 700,
            fontFamily: 'Tajawal',
            formatter: () => `${value}%`,
          },
        },
      },
    },
    labels: [label],
  };

  return <Chart options={options} series={[clamped]} type="radialBar" height={260} />;
}
