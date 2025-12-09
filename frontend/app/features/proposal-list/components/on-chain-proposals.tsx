import { readContract } from '@wagmi/core';
import { useEffect, useMemo, useState } from 'react';
import { config } from '@/core/config';
import contractABI from '@/core/contract/contract-abi.json';
import { env } from '@/core/env';
import CustomPagination from '@/shared/components/custom-pagination';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { getOnChainStatus } from '../utils';
import ProposalCard from './proposal-card';

interface Props {
  search?: string;
}

export default function OnChainProposals({ search }: Props) {
  // State for total proposals and pagination
  const [totalProposals, setTotalProposals] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTotalProposals = async () => {
    try {
      const total = await readContract(config, {
        abi: contractABI,
        address: env.VITE_SMART_CONTRACT_ADDRESS as `0x${string}`,
        functionName: 'proposalCount',
      });
      const totalNum = Number(total);
      setTotalProposals(totalNum);
      setTotalPages(Math.ceil(totalNum / 5));
    }
    catch (e) {
      console.error(e);
    }
  };

  const getProposals = async (page: number) => {
    setLoading(true);
    try {
      const startIndex = Math.max(totalProposals - (page + 1) * 10, 0);
      const endIndex = totalProposals - page * 10;

      if (startIndex >= endIndex) {
        setProposals([]);
        return;
      }

      const response: any = await readContract(config, {
        abi: contractABI,
        address: env.VITE_SMART_CONTRACT_ADDRESS as `0x${string}`,
        functionName: 'getProposalsByPage',
        args: [startIndex, endIndex],
      });

      const filteredProposals = response[0]
        .filter(
          (proposal: any) =>
            proposal.proposer !== '0x0000000000000000000000000000000000000000',
        )
        .reverse();

      setProposals(filteredProposals);
      setLoading(false);
    }
    catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const filteredProposals = useMemo(() => {
    if (!search)
      return proposals;
    return proposals.filter(proposal =>
      proposal.proposalURI.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, proposals]);

  useEffect(() => {
    fetchTotalProposals();
  }, []);

  useEffect(() => {
    getProposals(currentPage);
  }, [currentPage, totalProposals]);

  return (
    <div className="flex flex-col gap-4">
      {!loading && filteredProposals.length > 0 && filteredProposals.map(proposal => (
        <ProposalCard
          key={proposal.proposalId}
          id={proposal.proposalId}
          address={proposal.proposer}
          description={proposal.proposalURI}
          status={getOnChainStatus(proposal.canceled, proposal.executed)}
          href={`/organization/dao/proposals/on-chain/${proposal.proposalId}`}
          vote={{ start: proposal.voteStart, duration: proposal.voteDuration, canceled: proposal.canceled }}
        />
      ))}

      {loading && (
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
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
              <Skeleton className="h-4 w-48" />
            </div>
          ))}
        </div>
      )}

      {!loading && proposals.length === 0 && (
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
          <h3 className="text-lg font-semibold text-foreground mb-1">No On-Chain Proposals</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            There are currently no on-chain proposals. Create a new proposal to get started.
          </p>
        </div>
      )}

      <CustomPagination
        total={totalPages}
        page={currentPage + 1}
        limit={5}
        onPageChange={(newPage) => {
          setCurrentPage(newPage - 1);
        }}
      />
    </div>
  );
}
