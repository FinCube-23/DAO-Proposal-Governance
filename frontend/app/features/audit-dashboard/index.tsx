import { useQuery } from '@tanstack/react-query';
import { auditTrailApis } from '@/core/services/audit';
import RecentTransactions from './components/recent-transactions';
import StatCardList from './components/stat-card-list';
import TopParticipants from './components/top-participants';
import TopResourceType from './components/top-resource-type';
import TransactionHistoryChart from './components/transaction-history-chart';

export default function AuditDashboardChart() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: auditTrailApis.getDashboardStats,
  });

  return (
    <>
      {isLoading
        ? (
            <div>Loading dashboard...</div>
          )
        : error
          ? (
              <div>Error loading dashboard data.</div>
            )
          : (
              <div className="flex flex-col lg:gap-6 gap-4">
                <StatCardList data={data?.overallStats} isLoading={isLoading} error={error} />
                <TransactionHistoryChart chartData={data?.timeSeries ?? []} />
                <div className="grid gap-4 md:grid-cols-2 lg:gap-6">
                  <TopResourceType topResourceTypes={data?.resourceTypeStats ?? ({} as Record<string, number>)} />
                  <TopParticipants topParticipants={data?.topParticipants ?? []} />
                </div>
                <RecentTransactions />
              </div>
            )}
    </>
  );
}
