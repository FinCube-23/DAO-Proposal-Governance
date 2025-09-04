import { useQuery } from '@tanstack/react-query';
import { proposalApis } from '@/core/services/proposal';

interface Props {
  filter?: string;
  search?: string;
}

export default function OffChainProposals({ filter, search }: Props) {
  const limit = 10;
  const page = 1;
  const { data: proposals, isLoading: isProposalLoading } = useQuery({
    queryKey: ['off-chain-proposals', { filter, search, limit, page }],
    queryFn: () => proposalApis.getAllProposals({ limit, page, filter }),
  });

  return (
    <div>off-chain-proposals</div>
  );
}
