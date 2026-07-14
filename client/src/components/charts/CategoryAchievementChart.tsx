import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { useTheme } from '@/context/ThemeContext';

interface CategoryAchievementChartProps {
  data: Array<{ name: string; achievementPercent: number }>;
}

export function CategoryAchievementChart({ data }: CategoryAchievementChartProps) {
  const { theme } = useTheme();

  const options: ApexOptions = {
    chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'Tajawal, sans-serif', background: 'transparent' },
    theme: { mode: theme },
    colors: ['#C9A24B'],
    plotOptions: {
      bar: { borderRadius: 6, horizontal: true, barHeight: '55%' },
    },
    dataLabels: { enabled: true, formatter: (v) => `${v}%`, style: { fontFamily: 'Tajawal' } },
    grid: { borderColor: theme === 'dark' ? '#2a3441' : '#eef1f5', strokeDashArray: 4 },
    xaxis: { categories: data.map((d) => d.name), labels: { formatter: (v) => `${v}%`, style: { fontFamily: 'Tajawal' } } },
    tooltip: { theme, y: { formatter: (v) => `${v}%` } },
  };

  const series = [{ name: 'نسبة الإنجاز', data: data.map((d) => d.achievementPercent) }];

  return <Chart options={options} series={series} type="bar" height={Math.max(220, data.length * 55)} />;
}
