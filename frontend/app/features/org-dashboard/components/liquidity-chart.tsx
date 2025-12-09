import { BarChart } from '@/shared/components/chart/bar-chart';

const liquidityData = [
  { label: 'USDC', value: 75, color: 'bg-blue-500/50' },
  { label: 'ETH', value: 100, color: 'bg-purple-500/50' },
  { label: 'BTC', value: 60, color: 'bg-red-500/50' },
  { label: 'USDT', value: 85, color: 'bg-emerald-500/50' },
];

export default function LiquidityChart() {
  return (
    <BarChart
      data={liquidityData}
      title="Token Distribution"
      subtitle="Current portfolio breakdown"
    />
  );
}
