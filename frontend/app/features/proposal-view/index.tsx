import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { proposalApis } from '@/core/services/proposal';
import { Skeleton } from '@/shared/components/ui/skeleton';
import ProposalBody from './components/proposal-body';

interface Props {
  pid?: string;
  source?: string;
}

export default function ProposalView({ pid, source }: Props) {
  const [onChainId, setOnChainId] = useState<number | string | undefined>(undefined);

  const getProposal = useMutation({
    mutationKey: ['get-proposal-by-id', pid],
    mutationFn: proposalApis.getProposalById,
    onSuccess: (data) => {
      if (data) {
        setOnChainId(data.proposal_onchain_id);
      }
      else {
        toast.error('Proposal not found');
      }
    },
    onError: (error) => {
      console.error('Failed to fetch proposal information:', error);
      toast.error('Failed to fetch proposal information');
    },
  });

  useEffect(() => {
    if (source === 'off-chain' && pid) {
      getProposal.mutate(+pid);
    }
    else {
      // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
      setOnChainId(pid);
    }
  }, [pid, source]);

  if (!onChainId) {
    return (
      <div className="flex flex-col gap-4 sm:gap-6">
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
      </div>
    );
  }

  return (
    <ProposalBody onChainId={onChainId} />
  );
}
