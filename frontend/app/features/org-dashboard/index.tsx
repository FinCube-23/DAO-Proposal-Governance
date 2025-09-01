'use client';

import useAuthStore from '@/shared/stores/auth';
import LiquidityChart from './components/liquidity-chart';
import ProposalAllocation from './components/proposal-allocation';
import QuickActions from './components/quick-actions';
import RecentActivity from './components/recent-activity';
import StatProposalThreshold from './components/stat-proposal-threshold';
import StatTotalBalance from './components/stat-total-balance';
import StatTotalMembers from './components/stat-total-members';
import StatTotalProposals from './components/stat-total-proposals';
import TransactionVolume from './components/transaction-volume';

export default function OrganizationDashboard() {
  const authStore = useAuthStore(state => state);

  return (
    <div className="flex flex-col lg:gap-6 gap-4">
      <div>
        <h1 className="text-2xl font-bold my-1">
          Welcome back,
          {authStore.profile?.last_name || 'User'}
        </h1>
        <p className="text-muted-foreground">Here's what's happening with your organization today.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-6 gap-4">
        <StatTotalBalance />
        <StatTotalMembers />
        <StatTotalProposals />
        <StatProposalThreshold />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-6 gap-4">
        <ProposalAllocation />
        <QuickActions />
        <RecentActivity />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-6 gap-4">
        <LiquidityChart />
        <TransactionVolume />
      </div>
    </div>
  );
}
