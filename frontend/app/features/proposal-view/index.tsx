import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { proposalApis } from '@/core/services/proposal';
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
    return <div>Loading...</div>;
  }

  return (
    <ProposalBody onChainId={onChainId} />
  );
}
