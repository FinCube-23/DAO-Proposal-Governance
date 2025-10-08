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
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <StatusBadge status={transaction.status} showIcon />

          {transaction.status === 'pending' && (
            <Badge variant="outline" className="animate-pulse">
              <Clock className="h-3 w-3 mr-1" />
              {transaction.confirmations || 0}
              {' '}
              confirmations
            </Badge>
          )}
        </div>

        <h1 className="text-2xl font-bold font-mono">
          {formatAddress(transaction.tx_hash, 16)}
        </h1>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <TimeDisplay timestamp={transaction.block_timestamp} enableToggle />
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          <Copy className="h-4 w-4 mr-2" />
          Copy Hash
        </Button>
        <Link to={`${import.meta.env.VITE_TRX_EXPLORER}/${transaction.tx_hash}`} target="_blank">
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            View on chain explorer
          </Button>
        </Link>
      </div>
    </div>
  );
}
