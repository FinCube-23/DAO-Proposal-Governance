import type { Transaction } from '@/shared/types/transactions';
import { Clock, Copy, ExternalLink } from 'lucide-react';
import { Link } from 'react-router';
import { StatusBadge } from '@/shared/components/status-badge';
import { TimeDisplay } from '@/shared/components/time-display';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { formatAddress } from '@/shared/utils';

interface Props {
  transaction: Transaction;
}
export default function TransactionHeader({ transaction }: Props) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
      <div className="space-y-2 min-w-0 flex-1">
        <div className="flex items-center gap-3 flex-wrap">
          <StatusBadge status={transaction.status} showIcon />

          {transaction.status === 'pending' && (
            <Badge variant="outline" className="animate-pulse text-xs sm:text-sm">
              <Clock className="h-3 w-3 mr-1" />
              {transaction.confirmations || 0}
              {' '}
              confirmations
            </Badge>
          )}
        </div>

        <h1 className="text-xl sm:text-2xl font-bold font-mono break-all">
          {formatAddress(transaction.tx_hash, 16)}
        </h1>

        <div className="flex items-center gap-4 text-xs sm:text-sm text-muted-foreground">
          <TimeDisplay timestamp={transaction.block_timestamp} enableToggle />
        </div>
      </div>

      <div className="flex gap-2 flex-shrink-0 flex-wrap sm:flex-nowrap">
        <Button variant="outline" size="sm" className="text-xs sm:text-sm">
          <Copy className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
          <span className="hidden sm:inline">Copy Hash</span>
        </Button>
        <Link to={`${import.meta.env.VITE_TRX_EXPLORER}/${transaction.tx_hash}`} target="_blank">
          <Button variant="outline" size="sm" className="text-xs sm:text-sm whitespace-nowrap">
            <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
            <span className="hidden sm:inline">View on chain explorer</span>
            <span className="sm:hidden">Explorer</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
