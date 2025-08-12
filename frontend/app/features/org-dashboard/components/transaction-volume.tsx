import { LineChart } from '@/shared/components/chart/line-chart';

export default function TransactionVolume() {
  return (
    <LineChart
      title="Transaction Volume"
      subtitle="Total volume over time"
    />
  );
}
