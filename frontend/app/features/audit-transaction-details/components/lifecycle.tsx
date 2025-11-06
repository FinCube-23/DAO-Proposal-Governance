import type { Transaction } from '@/shared/types/transactions';
import { Clock } from 'lucide-react';
import { STATUS_CONFIG } from '@/features/audit-transactions/constants/chains';
import { StatusBadge } from '@/shared/components/status-badge';
import { TimeDisplay } from '@/shared/components/time-display';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { cn, formatFee } from '@/shared/utils';

interface Props {
  transaction: Transaction;
}

export default function TransactionLifeCycle({ transaction }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
          Transaction Lifecycle
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 sm:space-y-4">
          {/* Timeline of transaction lifecycle */}
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-3 sm:left-4 top-0 bottom-0 w-0.5 bg-border"></div>

            {/* First Seen */}
            <div className="relative flex items-start gap-3 sm:gap-4 pb-3 sm:pb-4">
              <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-600 rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <h3 className="text-xs sm:text-sm font-medium">First Detected</h3>
                  <TimeDisplay
                    timestamp={transaction.first_seen_at}
                    className="text-xs text-muted-foreground"
                    enableToggle
                  />
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Transaction first detected by indexer
                </p>
              </div>
            </div>

            {/* Submitted to Mempool */}
            <div className="relative flex items-start gap-3 sm:gap-4 pb-3 sm:pb-4">
              <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-amber-600 rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <h3 className="text-xs sm:text-sm font-medium">Submitted to Mempool</h3>
                  <TimeDisplay
                    timestamp={transaction.first_seen_at}
                    className="text-xs text-muted-foreground"
                    enableToggle
                  />
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Transaction entered the mempool and is pending confirmation
                </p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    Gas Price:
                    {' '}
                    {transaction.gas_price
                      ? `${(BigInt(transaction.gas_price) / BigInt(10 ** 9)).toString()} gwei`
                      : 'N/A'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Block Inclusion */}
            {transaction.block_number && (
              <div className="relative flex items-start gap-3 sm:gap-4 pb-3 sm:pb-4">
                <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-600 rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <h3 className="text-xs sm:text-sm font-medium">Included in Block</h3>
                    <TimeDisplay
                      timestamp={transaction.block_timestamp}
                      className="text-xs text-muted-foreground"
                      enableToggle
                    />
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">
                    Transaction included in block #
                    {transaction.block_number.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      Block:
                      {' '}
                      {transaction.block_number.toLocaleString()}
                    </Badge>
                    {transaction.gas_used && (
                      <Badge variant="outline" className="text-xs">
                        Gas Used:
                        {' '}
                        {transaction.gas_used.toLocaleString()}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Confirmation Status */}
            <div className="relative flex items-start gap-3 sm:gap-4 pb-3 sm:pb-4">
              <div className={cn(
                'flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center',
                transaction.status === 'success'
                  ? 'bg-green-100 dark:bg-green-900'
                  : transaction.status === 'failed' || transaction.status === 'reverted'
                    ? 'bg-red-100 dark:bg-red-900'
                    : 'bg-amber-100 dark:bg-amber-900',
              )}
              >
                <div className={cn(
                  'w-2 h-2 sm:w-3 sm:h-3 rounded-full',
                  transaction.status === 'success'
                    ? 'bg-green-600'
                    : transaction.status === 'failed' || transaction.status === 'reverted'
                      ? 'bg-red-600'
                      : 'bg-amber-600',
                )}
                >
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <h3 className="text-xs sm:text-sm font-medium">
                    {transaction.status === 'success'
                      ? 'Execution Successful'
                      : transaction.status === 'failed'
                        ? 'Execution Failed'
                        : transaction.status === 'reverted'
                          ? 'Transaction Reverted'
                          : transaction.status === 'pending'
                            ? 'Awaiting Confirmation'
                            : 'Status Updated'}
                  </h3>
                  <TimeDisplay
                    timestamp={transaction.last_observed_at}
                    className="text-xs text-muted-foreground"
                    enableToggle
                  />
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {transaction.status === 'success'
                    ? 'Transaction executed successfully'
                    : transaction.status === 'failed'
                      ? 'Transaction execution failed'
                      : transaction.status === 'reverted'
                        ? 'Transaction was reverted during execution'
                        : transaction.status === 'pending'
                          ? `Pending with ${transaction.confirmations || 0} confirmations`
                          : 'Transaction status was updated'}
                </p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <StatusBadge status={transaction.status} showIcon />
                  {transaction.confirmations && (
                    <Badge variant="outline" className="text-xs">
                      {transaction.confirmations}
                      {' '}
                      confirmations
                    </Badge>
                  )}
                  {transaction.effective_fee_raw && (
                    <Badge variant="outline" className="text-xs">
                      Fee:
                      {' '}
                      {formatFee(transaction.gas_used, transaction.effective_fee_raw)}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Last Observed */}
            <div className="relative flex items-start gap-3 sm:gap-4">
              <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gray-500 rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <h3 className="text-xs sm:text-sm font-medium">Last Observed</h3>
                  <TimeDisplay
                    timestamp={transaction.last_observed_at}
                    className="text-xs text-muted-foreground"
                    enableToggle
                  />
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Most recent observation by indexer
                </p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    Indexer: v
                    {transaction.indexer_version || 'Unknown'}
                  </Badge>
                  {transaction.integrity_hash && (
                    <Badge variant="outline" className="text-xs">
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
