import { readContract } from '@wagmi/core';
import { CoinsIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { config } from '@/core/config';
import StableCoinABI from '@/core/contract/stablecoin-abi.json';
import StatCard from './stat-card';

export default function StatTotalBalance() {
  const { address, isConnected } = useAccount();
  const [coinBalance, setCoinBalance] = useState<string | null>(null);

  async function getUSDCBalance() {
    try {
      const response: any = await readContract(config, {
        abi: StableCoinABI,
        address: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582',
        functionName: 'balanceOf',
        args: [address],
      });
      const result = response.toString();
      setCoinBalance(result);
    }
    catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      getUSDCBalance();
    }
  }, [isConnected && address]);

  return (
    <StatCard
      title="Total Balance"
      value={`${coinBalance || '0'} USDC`}
      icon={CoinsIcon}
      variants="emrald"
      isFromOnChain
    />
  );
}
