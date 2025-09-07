import { Calendar, Clock, ClockAlert, Code, Link, Shield } from 'lucide-react';
import { useMemo } from 'react';
import { sepolia } from 'viem/chains';
import WithLoader from '@/shared/components/with-loader';
import DetailsCard from './components/details-card';
import DetailsCardSkeleton from './components/details-card-skeleton';
import GovernanceParameters from './components/governance-parameters';
import { useDaoInfo } from './hooks/use-dao-info';

export default function DaoDetails() {
  const { daoURI, version, votingPeriod, votingDelay, proposalCount, loading } = useDaoInfo({ debug: false });

  const infoItems = useMemo(() => [
    {
      label: 'Voting Period',
      value: votingPeriod,
      icon: Clock,
      description: 'Duration for active voting',
    },
    {
      label: 'Voting Delay',
      value: votingDelay,
      icon: ClockAlert,
      description: 'Delay before voting starts',
    },
    {
      label: 'Execution Delay',
      value: 0,
      icon: Shield,
      description: 'Timelock for proposal execution',
    },
    {
      label: 'Chain',
      value: 'Sepolia',
      icon: Link,
      description: `Chain ID: ${sepolia.id}`,
    },
    {
      label: 'Version',
      value: version,
      icon: Code,
      description: 'Current protocol version',
    },
    {
      label: 'Created',
      value: 'December 2023',
      icon: Calendar,
      description: 'DAO inception date',
    },
  ], [version, votingDelay, votingPeriod]);

  const governanceItems = useMemo(() => [
    {
      label: 'Total Members',
      value: '17',
      gradient: 'from-emerald-500 to-cyan-500',
    },
    {
      label: 'Proposal Count',
      value: proposalCount,
      gradient: 'from-cyan-500 to-blue-500',
    },
    {
      label: 'Quorum Threshold',
      value: '51%',
      gradient: 'from-blue-500 to-purple-500',
    },
    {
      label: 'Treasury Value',
      value: '0 USDC',
      gradient: 'from-purple-500 to-pink-500',
    },
  ], [proposalCount]);

  return (
    <WithLoader isLoading={loading} fallback={<DetailsCardSkeleton />}>
      <div className="flex flex-col gap-4 lg:gap-6">
        <DetailsCard
          title={daoURI?.name || 'fincube'}
          subtitle="Decentralized Financial Governance"
          description={daoURI?.description || 'A decentralized autonomous organization for managing community projects.'}
          infoItems={infoItems}
        />
        <GovernanceParameters governanceItems={governanceItems} />
      </div>
    </WithLoader>
  );
}
