import type { IProposal } from '@/core/api/interfaces';
import { readContract } from '@wagmi/core';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { config } from '@/core/config';
import contractABI from '@/core/contract/contract-abi.json';
import { env } from '@/core/env';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { ProposalStatCard } from './proposal-stat-card';
import ProposalViewCard from './proposal-view-card';

interface Props {
  onChainId?: string | number;
}

export default function ProposalBody({ onChainId }: Props) {
  const [proposal, setProposal] = useState<IProposal>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getProposalsById = async () => {
      setLoading(true);
      try {
        const response: any = await readContract(config, {
          abi: contractABI,
          address: env.VITE_SMART_CONTRACT_ADDRESS as `0x${string}`,
          functionName: 'getProposalsById',
          args: [onChainId],
        });

        setProposal(response);
      }
      catch (e) {
        toast.error('Failed to fetch proposal information');
        console.error('Failed to fetch proposal information:', e);
      }
      finally {
        setLoading(false);
      }
    };

    getProposalsById();
  }, [onChainId]);

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {!loading && proposal
        ? (
            <>
              <ProposalViewCard proposal={proposal} proposalId={onChainId} />
              <div className="flex flex-col-reverse gap-4 md:gap-0 md:grid md:grid-cols-12">
                <div className="md:col-span-7">
                  <ProposalStatCard proposal={proposal} proposalId={onChainId} />
                </div>
                <div className="md:col-span-4"></div>
              </div>
            </>
          )
        : (
            <>
              {/* Proposal header skeleton */}
              <div className="border border-border rounded-lg p-4 sm:p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-10 w-24" />
                </div>
                <div className="space-y-2 pt-4 border-t">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>

              {/* Stats skeleton */}
              <div className="flex flex-col-reverse gap-4 md:gap-0 md:grid md:grid-cols-12">
                <div className="md:col-span-7 space-y-4">
                  <div className="border border-border rounded-lg p-4 sm:p-6 space-y-4">
                    <Skeleton className="h-6 w-32" />
                    <div className="space-y-3">
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
    </div>
  );
}
