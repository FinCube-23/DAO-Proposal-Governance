import type { IProposal } from '@/core/api/interfaces';
import { readContract } from '@wagmi/core';
import { useEffect, useState } from 'react';
import { config } from '@/core/config';
import contractABI from '@/core/contract/contract-abi.json';
import { env } from '@/core/env';
import { getOnChainStatus } from '../utils';
import ProposalCard from './proposal-card';

export default function OngoingProposals() {
  const [proposals, setProposals] = useState<IProposal[]>([]);
  const [loading, setLoading] = useState(false);

  const getOngoingProposals = async () => {
    setLoading(true);
    try {
      const response: any = await readContract(config, {
        abi: contractABI,
        address: env.VITE_SMART_CONTRACT_ADDRESS as `0x${string}`,
        functionName: 'getOngoingProposals',
      });

      const filteredProposals = response.filter(
        (proposal: any) =>
          proposal.proposer !== '0x0000000000000000000000000000000000000000',
      );

      setProposals(filteredProposals);
      setLoading(false);
    }
    catch (e) {
      console.error(e);
      setLoading(false); // Ensure loading state is reset on error
    }
  };

  useEffect(() => {
    getOngoingProposals();
  }, []);
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
          vote={{ start: proposal.voteStart, duration: proposal.voteDuration, canceled: proposal.canceled }}
        />
      ))}

      {loading && <div>Loading...</div>}

      {!loading && proposals.length === 0 && <div>No proposals found.</div>}
    </div>

  );
}
