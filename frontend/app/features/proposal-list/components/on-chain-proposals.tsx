import { readContract } from '@wagmi/core';
import { useEffect, useState } from 'react';
import { config } from '@/core/config';
import contractABI from '@/core/contract/contract-abi.json';
import { env } from '@/core/env';
import { getOnChainStatus } from '../utils';
import ProposalCard from './proposal-card';

export default function OnChainProposals() {
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
        address: env.NEXT_PUBLIC_SMART_CONTRACT_ADDRESS as `0x${string}`,
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
        address: env.NEXT_PUBLIC_SMART_CONTRACT_ADDRESS as `0x${string}`,
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

  useEffect(() => {
    fetchTotalProposals();
  }, []);

  useEffect(() => {
    getProposals(currentPage);
  }, [currentPage, totalProposals]);

  return (
    <div className="flex flex-col gap-4">
      {!loading && proposals.length > 0 && proposals.map(proposal => (
        <ProposalCard
          key={proposal.proposalId}
          id={proposal.proposalId}
          address={proposal.proposer}
          description={proposal.proposalURI}
          status={getOnChainStatus(proposal.canceled, proposal.executed)}
          href={`/organization/dao/proposals/view?id=${proposal.proposalId}`}
        />
      ))}

      {loading && <div>Loading...</div>}

      {!loading && proposals.length === 0 && <div>No proposals found.</div>}
    </div>
  );
}
