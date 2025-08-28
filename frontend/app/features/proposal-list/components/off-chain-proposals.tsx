import { useQuery } from '@tanstack/react-query';
import { proposalApis } from '@/core/services/proposal';

interface Props {
  filter?: string;
  search?: string;
}

export default function OffChainProposals({ filter, search }: Props) {
  const { data: proposals, isLoading: isProposalLoading } = useQuery({
    queryKey: ['off-chain-proposals', { filter, search }],
    queryFn: () => proposalApis.getAllProposals({ filter, search }),
  });

  console.log(proposals, isProposalLoading);
  return (
    <div>off-chain-proposals</div>
  );
}
