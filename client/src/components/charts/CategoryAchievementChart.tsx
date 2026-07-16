import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { useTheme } from '@/context/ThemeContext';

interface CategoryAchievementChartProps {
  data: Array<{ name: string; achievementPercent: number }>;
  chartType?: 'bar' | 'donut';
}

const DONUT_PALETTE = ['#0B2545', '#C9A24B', '#15803D', '#D97706', '#DC2626', '#0369A1', '#7C3AED', '#0F766E'];

export function CategoryAchievementChart({ data, chartType = 'bar' }: CategoryAchievementChartProps) {
  const { theme } = useTheme();

  if (chartType === 'donut') {
    const options: ApexOptions = {
      chart: { type: 'donut', toolbar: { show: false }, fontFamily: 'Tajawal, sans-serif', background: 'transparent' },
      theme: { mode: theme },
      colors: DONUT_PALETTE,
      labels: data.map((d) => d.name),
      dataLabels: { enabled: true, formatter: (v: number) => `${Math.round(v)}%` },
      legend: { position: 'bottom', fontFamily: 'Tajawal' },
      stroke: { colors: [theme === 'dark' ? '#1a2332' : '#ffffff'] },
      tooltip: { theme, y: { formatter: (v) => `${v}%` } },
    };
    return (
      <Chart
        options={options}
        series={data.map((d) => d.achievementPercent)}
        type="donut"
        height={Math.max(280, data.length * 40)}
      />
    );
  }

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
