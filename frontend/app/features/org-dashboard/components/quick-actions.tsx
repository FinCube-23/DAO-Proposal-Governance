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
              <span className="font-medium text-white">Add USDC Token</span>
            </div>
            <ArrowUpRight className="w-4 h-4 text-gray-500" />
          </button>

          <button
            type="button"
            className={getButtonClass(true)}
            disabled
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Plus className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium text-white">Add Fund</span>
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
