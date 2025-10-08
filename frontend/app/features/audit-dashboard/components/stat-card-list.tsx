import { ActivityIcon, ClockIcon, CoinsIcon, TrendingUp } from 'lucide-react';
import StatCard from '@/shared/components/dashboard/stat-card';

export default function StatCardList() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-6 gap-4">
      <StatCard title="Transactions (24h)" value={100} icon={ActivityIcon} variants="emrald" />
      <StatCard title="Pending Transactions" value={20} icon={ClockIcon} isFromOnChain variants="blue" />
      <StatCard title="Success Rate" value="99%" icon={TrendingUp} variants="purple" />
      <StatCard title="Total Liquidity" value="1000 USDC" icon={CoinsIcon} isFromOnChain variants="red" />
    </div>
  );
}
