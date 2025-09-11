import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { proposalApis } from '@/core/services/proposal';
import CustomPagination from '@/shared/components/custom-pagination';
import ProposalCard from './proposal-card';

interface Props {
  filter?: string;
  search?: string;
}

export default function OffChainProposals({ filter, search }: Props) {
  const limit = 10;
  const [page, setPage] = useState(1);
  const { data: proposals } = useQuery({
    queryKey: ['off-chain-proposals', { filter, search, limit, page }],
    queryFn: () => proposalApis.getAllProposals({ limit, page, filter, search }),
  });

  return (
    <div className="flex flex-col gap-4">
      {proposals?.data.map(proposal => (
        <ProposalCard
          key={proposal.id}
          id={proposal.id}
          description={proposal.metadata}
          status={proposal.proposal_status}
          address={proposal.proposer_address}
          href={`/organization/dao/proposals/off-chain/${proposal.id}`}
        />
      ))}
      {proposals?.data.length === 0 && <div>No proposals found.</div>}
      <CustomPagination
        total={proposals?.total || 0}
        page={page}
        limit={limit}
        onPageChange={(newPage) => {
          setPage(newPage);
        }}
      />
    </div>
  );
}
