import type { IProposal } from '@/core/api/interfaces';
import { readContract } from '@wagmi/core';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { config } from '@/core/config';
import contractABI from '@/core/contract/contract-abi.json';
import { env } from '@/core/env';
import { ProposalStatCard } from './proposal-stat-card';
import ProposalViewCard from './proposal-view-card';

interface Props {
  onChainId?: string | number;
}

export default function ProposalBody({ onChainId }: Props) {
  const [proposal, setProposal] = useState<IProposal>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getProposalsById = async () => {
      setLoading(true);
      try {
        const response: any = await readContract(config, {
          abi: contractABI,
          address: env.VITE_SMART_CONTRACT_ADDRESS as `0x${string}`,
          functionName: 'getProposalsById',
          args: [onChainId],
        });

        setProposal(response);
      }
      catch (e) {
        toast.error('Failed to fetch proposal information');
        console.error('Failed to fetch proposal information:', e);
      }
      finally {
        setLoading(false);
      }
    };

    getProposalsById();
  }, [onChainId]);

  return (
    <div className="flex flex-col gap-6">
      {!loading && proposal
        ? (
            <>
              <ProposalViewCard proposal={proposal} proposalId={onChainId} />
              <div className="flex flex-col-reverse md:grid md:grid-cols-12">
                <div className="md:col-span-7">
                  <ProposalStatCard proposal={proposal} proposalId={onChainId} />
                </div>
                <div className="md:col-span-4"></div>
              </div>
            </>
          )
        : 'Loading...'}
    </div>
  );
}
