import { useQuery } from '@tanstack/react-query';
import { ActivityIcon, ClockIcon, TimerIcon, TrendingUp } from 'lucide-react';
import { auditTrailApis } from '@/core/services/audit';
import StatCard from '@/shared/components/dashboard/stat-card';

// Utility function to convert milliseconds to human-readable format
function formatTimeFromMs(milliseconds: number): string {
  if (milliseconds < 1000) {
    return `${milliseconds}ms`;
  }

  const seconds = Math.floor(milliseconds / 1000);
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

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
        <StatCard title="Pending Transactions" value="..." icon={ClockIcon} variants="blue" />
        <StatCard title="Success Rate" value="..." icon={TrendingUp} variants="purple" />
        <StatCard title="Avg Confirmation Time" value="..." icon={TimerIcon} variants="red" />
      </div>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-6 gap-4">
        <StatCard title="Total Transactions" value="Error" icon={ActivityIcon} variants="emrald" />
        <StatCard title="Pending Transactions" value="Error" icon={ClockIcon} variants="blue" />
        <StatCard title="Success Rate" value="Error" icon={TrendingUp} variants="purple" />
        <StatCard title="Avg Confirmation Time" value="Error" icon={TimerIcon} variants="red" />
      </div>
    );
  }

  // Calculate success rate from the data
  const successRate = data?.totalTransactions
    ? `${((data.confirmedTransactions / data.totalTransactions) * 100).toFixed(1)}%`
    : '0%';

  // Format average confirmation time from milliseconds
  const formattedConfirmationTime = data?.averageConfirmationTime
    ? formatTimeFromMs(data.averageConfirmationTime)
    : 'N/A';

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
        variants="blue"
      />
      <StatCard
        title="Success Rate"
        value={successRate}
        icon={TrendingUp}
        variants="purple"
      />
      <StatCard
        title="Avg Confirmation Time"
        value={formattedConfirmationTime}
        icon={TimerIcon}
        variants="red"
      />
    </div>
  );
}
