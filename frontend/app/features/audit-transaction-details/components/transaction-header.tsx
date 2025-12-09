import type { GetOneTrxResponse } from '@/core/api/types';
import { Check, Copy, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';

import { StatusBadge } from '@/shared/components/status-badge';
import { TimeDisplay } from '@/shared/components/time-display';
import { Button } from '@/shared/components/ui/button';
import { formatAddress } from '@/shared/utils';

interface Props {
  transaction: GetOneTrxResponse;
}
export default function TransactionHeader({ transaction }: Props) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyHash = async () => {
    try {
      await navigator.clipboard.writeText(transaction.trx_hash);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
    catch {
      toast.error('Failed to copy transaction hash');
    }
  };
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
      <div className="space-y-2 min-w-0 flex-1">
        <div className="flex items-center gap-3 flex-wrap">
          <StatusBadge
            status={transaction.trx_status === 1 ? 'success' : 'failed'}
            showIcon
          />
        </div>

        <h1 className="text-xl sm:text-2xl font-bold font-mono break-all">
          {formatAddress(transaction.trx_hash, 16)}
        </h1>

        <div className="flex items-center gap-4 text-xs sm:text-sm text-muted-foreground">
          <TimeDisplay timestamp={transaction.updated_at} enableToggle />
        </div>
      </div>

      <div className="flex gap-2 flex-shrink-0 flex-wrap sm:flex-nowrap">
        <Button variant="outline" size="sm" className="text-xs sm:text-sm" onClick={handleCopyHash}>
          {isCopied
            ? (
                <Check className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2 text-green-500" />
              )
            : (
                <Copy className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
              )}
          <span className="hidden sm:inline">{isCopied ? 'Copied!' : 'Copy Hash'}</span>
        </Button>
        <Link
          to={`${import.meta.env.VITE_TRX_EXPLORER}/${transaction.trx_hash}`}
          target="_blank"
        >
          <Button
            variant="outline"
            size="sm"
            className="text-xs sm:text-sm whitespace-nowrap"
          >
            <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
            <span className="hidden sm:inline">View on chain explorer</span>
            <span className="sm:hidden">Explorer</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
