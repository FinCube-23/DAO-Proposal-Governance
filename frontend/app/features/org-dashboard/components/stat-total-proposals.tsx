import { readContract } from '@wagmi/core';
import { ScrollTextIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { config } from '@/core/config';
import ContractABI from '@/core/contract/contract-abi.json';
import { env } from '@/core/env';
import StatCard from '../../../shared/components/dashboard/stat-card';

export default function StatTotalProposals() {
  const { address, isConnected } = useAccount();
  const [proposalCount, setProposalCount] = useState<string | null>(null);

  async function fetchProposalCount() {
    try {
      const response: any = await readContract(config, {
        abi: ContractABI,
        address: env.VITE_SMART_CONTRACT_ADDRESS as any,
        functionName: 'proposalCount',
      });
      const result = response.toString();

      setProposalCount(result);
    }
    catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      fetchProposalCount();
    }
  }, [isConnected && address]);

  return (
    <StatCard
      title="Total Proposals"
      value={proposalCount || '0'}
      icon={ScrollTextIcon}
      variants="purple"
      isFromOnChain
    />
  );
}
