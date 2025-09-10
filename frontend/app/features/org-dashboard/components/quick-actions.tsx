import { getChainId } from '@wagmi/core';
import { ArrowUpRight, BookmarkPlus, Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useWalletClient } from 'wagmi';
import { config, tokenConfig } from '@/core/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

export default function QuickActions() {
  const { data: client } = useWalletClient();
  const chainId = getChainId(config);

  const handleAddToken = async () => {
    const tokenInfo
      = tokenConfig.usdc[chainId as keyof typeof tokenConfig.usdc];
    try {
      const success = await client?.watchAsset({
        type: 'ERC20',
        options: {
          address: tokenInfo.address,
          symbol: 'USDC',
          decimals: tokenInfo.decimals,
          image: tokenInfo.image,
        },
      });

      if (success) {
        toast.success('Token added successfully');
      }
    }
    catch (e) {
      console.error(e);
    }
  };

  const addSepoliaTestnet = async () => {
    try {
      // First try to switch to Sepolia if it already exists
      try {
        await client?.switchChain({ id: 11155111 });
        toast.success('Switched to Sepolia Testnet');
        return;
      }
      catch (switchError) {
        // If switching fails, continue with adding the network
        console.warn('Network not found, attempting to add:', switchError);
      }

      // Add the network if it doesn't exist
      const success = await client?.addChain({
        chain: {
          id: 11155111,
          name: 'Sepolia',
          nativeCurrency: {
            name: 'Sepolia Ether',
            symbol: 'ETH',
            decimals: 18,
          },
          rpcUrls: {
            default: {
              http: ['https://ethereum-sepolia-rpc.publicnode.com'],
            },
            public: {
              http: ['https://ethereum-sepolia-rpc.publicnode.com'],
            },
          },
          blockExplorers: {
            default: {
              name: 'Etherscan',
              url: 'https://sepolia.etherscan.io',
            },
          },
        },
      });

      if (success) {
        toast.success('Sepolia Testnet added successfully');
      }
    }
    catch (e: any) {
      console.error('Failed to add Sepolia testnet:', e);

      // Handle specific error cases
      if (e.message?.includes('already has added with the same chainId')) {
        toast.warning('Sepolia Testnet is already added to your wallet');
      }
      else if (e.message?.includes('User rejected')) {
        toast.warning('Network addition was cancelled');
      }
      else {
        toast.error('Failed to add Sepolia testnet');
      }
    }
  };

  // Utility to handle dynamic classNames for disabled state
  const getButtonClass = (disabled: boolean) =>
    [
      'w-full flex items-center justify-between p-3 bg-white/5 border border-white/10 hover:bg-gray-700 rounded-lg transition-colors',
      disabled ? 'cursor-not-allowed bg-gray-700 opacity-40 hover:bg-gray-700' : 'cursor-pointer',
    ].join(' ');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <button
            type="button"
            className={getButtonClass(false)}
            onClick={handleAddToken}
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <BookmarkPlus className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium text-white">Import USDC Token</span>
            </div>
            <ArrowUpRight className="w-4 h-4 text-gray-500" />
          </button>

          <button
            type="button"
            className={getButtonClass(false)}
            onClick={addSepoliaTestnet}
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Plus className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium text-white">Add Sepolia Testnet</span>
            </div>
            <ArrowUpRight className="w-4 h-4 text-gray-500" />
          </button>

          <button
            type="button"
            className={getButtonClass(true)}
            disabled
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-rose-500 rounded-lg">
                <Minus className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium text-white">Withdraw</span>
            </div>
            <ArrowUpRight className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
