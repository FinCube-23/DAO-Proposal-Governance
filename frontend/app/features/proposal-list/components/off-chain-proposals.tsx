import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { proposalApis } from '@/core/services/proposal';
import CustomPagination from '@/shared/components/custom-pagination';
import { Skeleton } from '@/shared/components/ui/skeleton';
import ProposalCard from './proposal-card';

interface Props {
  filter?: string;
  search?: string;
}

export default function OffChainProposals({ filter, search }: Props) {
  const limit = 10;
  const [page, setPage] = useState(1);
  const { data: proposals, isLoading } = useQuery({
    queryKey: ['off-chain-proposals', { filter, search, limit, page }],
    queryFn: () => proposalApis.getAllProposals({ limit, page, filter, search }),
  });

  return (
    <div className="flex flex-col gap-4">
      {!isLoading && proposals?.data.map(proposal => (
        <ProposalCard
          key={proposal.id}
          id={proposal.id}
          description={proposal.description}
          status={proposal.proposal_status}
          address={proposal.proposer_address}
          href={`/organization/dao/proposals/off-chain/${proposal.id}`}
        />
      ))}

      {isLoading && (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <Skeleton className="h-4 w-full max-w-md" />
                </div>
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-4 w-48" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && proposals?.data.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">No Off-Chain Proposals</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            There are currently no off-chain proposals matching your search criteria.
          </p>
        </div>
      )}
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
