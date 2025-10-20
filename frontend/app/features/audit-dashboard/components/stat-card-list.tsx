import { useQuery } from '@tanstack/react-query';
import { ActivityIcon, ClockIcon, CoinsIcon, TrendingUp } from 'lucide-react';
import { auditTrailApis } from '@/core/services/audit';
import StatCard from '@/shared/components/dashboard/stat-card';

export default function StatCardList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: auditTrailApis.getDashboardStats,
  });

  // Show loading state if data is still being fetched
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-6 gap-4">
        <StatCard title="Total Transactions" value="..." icon={ActivityIcon} variants="emrald" />
        <StatCard title="Pending Transactions" value="..." icon={ClockIcon} isFromOnChain variants="blue" />
        <StatCard title="Success Rate" value="..." icon={TrendingUp} variants="purple" />
        <StatCard title="Total Liquidity" value="..." icon={CoinsIcon} isFromOnChain variants="red" />
      </div>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-6 gap-4">
        <StatCard title="Total Transactions" value="Error" icon={ActivityIcon} variants="emrald" />
        <StatCard title="Pending Transactions" value="Error" icon={ClockIcon} isFromOnChain variants="blue" />
        <StatCard title="Success Rate" value="Error" icon={TrendingUp} variants="purple" />
        <StatCard title="Total Liquidity" value="Error" icon={CoinsIcon} isFromOnChain variants="red" />
      </div>
    );
  }

  // Calculate success rate from the data
  const successRate = data?.totalTransactions
    ? `${((data.confirmedTransactions / data.totalTransactions) * 100).toFixed(1)}%`
    : '0%';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-6 gap-4">
      <StatCard
        title="Total Transactions"
        value={data?.totalTransactions ?? 0}
        icon={ActivityIcon}
        variants="emrald"
      />
      <StatCard
        title="Pending Transactions"
        value={data?.pendingTransactions ?? 0}
        icon={ClockIcon}
        isFromOnChain
        variants="blue"
      />
      <StatCard
        title="Success Rate"
        value={successRate}
        icon={TrendingUp}
        variants="purple"
      />
      <StatCard
        title="Total Liquidity"
        value={data?.totalLiquidity ? `${data.totalLiquidity} USDC` : '0 USDC'}
        icon={CoinsIcon}
        isFromOnChain
        variants="red"
      />
    </div>
  );
}
