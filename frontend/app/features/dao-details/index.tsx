'use client';

import { AlertCircle, BarChart3, Clock, Plus, ScrollText } from 'lucide-react';
import WithLoader from '@/shared/components/with-loader';
import DetailsCard from './components/details-card';
import DetailsCardSkeleton from './components/details-card-skeleton';
import { useDaoInfo } from './hooks/use-dao-info';

export default function DaoDetails() {
  const { daoURI, version, votingPeriod, votingDelay, proposalCount, loading } = useDaoInfo({ debug: false });
  return (
    <WithLoader isLoading={loading} fallback={<DetailsCardSkeleton />}>
      <div className="flex flex-col lg:gap-6 gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{daoURI?.name}</h1>
                <p className="text-gray-400 text-sm">Decentralized Financial Governance</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span className="text-gray-300">
                  Voting Period:
                  {' '}
                  {votingPeriod}
                  {' '}
                  second(s)
                </span>
              </div>
              <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span className="text-gray-300">
                  Voting Delay:
                  {' '}
                  {votingDelay}
                  {' '}
                  second(s)
                </span>
              </div>
            </div>
          </div>
        </div>
        <DetailsCard description={daoURI?.description || ''} version={version} />

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <ScrollText className="w-5 h-5 text-gray-400" />
              <span className="text-white text-xl font-semibold">
                Total proposals:
                {' '}
                {proposalCount}
              </span>
            </div>
          </div>

          <button type="button" className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg shadow-emerald-500/25">
            <Plus className="w-5 h-5" />
            <span>New Proposal</span>
          </button>
        </div>
      </div>
    </WithLoader>
  );
}
