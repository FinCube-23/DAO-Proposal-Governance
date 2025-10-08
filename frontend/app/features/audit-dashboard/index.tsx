import RecentTransactions from './components/recent-transactions';
import StatCardList from './components/stat-card-list';
import TopParticipants from './components/top-participants';
import TopResourceType from './components/top-resource-type';
import { DASHBOARD_STATS } from './mock-data/dashboard-stats';

export default function AuditDashboard() {
  return (
    <div className="flex flex-col lg:gap-6 gap-4">
      <StatCardList />

      <div className="grid gap-4 md:grid-cols-2 lg:gap-6">
        <TopResourceType topResourceKinds={DASHBOARD_STATS?.top_resource_kinds} />
        <TopParticipants topParticipants={DASHBOARD_STATS?.top_participants} />
      </div>
      <RecentTransactions />
    </div>
  );
}
