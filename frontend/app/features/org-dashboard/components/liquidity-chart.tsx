import { BarChart } from '@/shared/components/chart/bar-chart';

const liquidityData = [
  { label: 'USDC', value: 75, color: 'bg-blue-500' },
  { label: 'ETH', value: 100, color: 'bg-purple-500' },
  { label: 'BTC', value: 60, color: 'bg-orange-500' },
  { label: 'USDT', value: 85, color: 'bg-green-500' },
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
