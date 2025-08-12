import { readContract } from '@wagmi/core';
import { InfinityIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { config } from '@/core/config';
import ContractABI from '@/core/contract/contract-abi.json';
import { env } from '@/core/env';
import StatCard from './stat-card';

export default function StatProposalThreshold() {
  const { address, isConnected } = useAccount();
  const [proposalThreshold, setProposalThreshold] = useState<string | null>(null);

  async function fetchProposalThreshold() {
    try {
      const response: any = await readContract(config, {
        abi: ContractABI,
        address: env.NEXT_PUBLIC_SMART_CONTRACT_ADDRESS as any,
        functionName: 'proposalThreshold',
      });

      const result = response.toString();
      setProposalThreshold(result);
    }
    catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      fetchProposalThreshold();
    }
  }, [isConnected && address]);

  return (
    <StatCard
      title="Proposal Threshold"
      value={proposalThreshold || '0'}
      icon={InfinityIcon}
      isFromOnChain
    />
  );
}
