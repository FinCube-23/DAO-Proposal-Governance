import { useQuery } from '@tanstack/react-query';
import { proposalApis } from '@/core/services/proposal';
import ProposalCard from './proposal-card';

interface Props {
  filter?: string;
  search?: string;
}

export default function OffChainProposals({ filter, search }: Props) {
  const limit = 10;
  const page = 1;
  const { data: proposals } = useQuery({
    queryKey: ['off-chain-proposals', { filter, search, limit, page }],
    queryFn: () => proposalApis.getAllProposals({ limit, page, filter }),
  });

  return (
    <div className="flex flex-col gap-4">
      {proposals?.data.map(proposal => (
        <ProposalCard key={proposal.id} id={proposal.id} description={proposal.metadata} status={proposal.proposal_status} />
      ))}
    </div>
  );
}
