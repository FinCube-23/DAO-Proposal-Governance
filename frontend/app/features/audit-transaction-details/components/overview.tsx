import type { Transaction } from '@/shared/types/transactions';
import { FileText, Receipt } from 'lucide-react';
import { TagBadge } from '@/features/audit-dashboard/components/tag-badge';
import { CopyableCode } from '@/shared/components/copyable-code';
import { TimeDisplay } from '@/shared/components/time-display';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { formatAddress, formatFee, formatValue, shortenAddress } from '@/shared/utils';

interface Props {
  transaction: Transaction;
}
export default function TransactionOverview({ transaction }: Props) {
  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Receipt className="h-4 w-4 sm:h-5 sm:w-5" />
            Transaction Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="min-w-0">
              <label className="text-xs sm:text-sm font-medium">From</label>
              <CopyableCode value={shortenAddress(transaction.from_address)} />
            </div>
            <div className="min-w-0">
              <label className="text-xs sm:text-sm font-medium">To</label>
              {transaction.to_address
                ? (
                    <CopyableCode value={shortenAddress(transaction.to_address)} />
                  )
                : (
                    <span className="text-xs sm:text-sm text-muted-foreground">Contract Creation</span>
                  )}
            </div>
          </div>

          <div>
            <label className="text-xs sm:text-sm font-medium">Value</label>
            <div className="text-base sm:text-lg font-mono break-words">
              {formatValue(transaction.value_raw, transaction.value_decimals, transaction.value_currency)}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs sm:text-sm font-medium">Source</label>
            <span className={`inline-flex w-fit items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${
              transaction.source === 'alchemy'
                ? 'bg-blue-500 text-white'
                : 'bg-purple-500 text-white'
            }`}
            >
              {transaction.source}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="text-xs sm:text-sm font-medium">Gas Used</label>
              <div className="font-mono text-xs sm:text-sm break-words">
                {transaction.gas_used?.toLocaleString() || 'N/A'}
              </div>
            </div>
            <div>
              <label className="text-xs sm:text-sm font-medium">Transaction Fee</label>
              <div className="font-mono text-xs sm:text-sm break-words">
                {formatFee(transaction.gas_used, transaction.effective_fee_raw)}
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs sm:text-sm font-medium">Function</label>
            <div className="font-mono text-xs sm:text-sm break-words">
              {transaction.function_name || 'Unknown'}
            </div>
          </div>

          {transaction.tags.length > 0 && (
            <div>
              <label className="text-xs sm:text-sm font-medium">Tags</label>
              <div className="flex gap-2 mt-1 flex-wrap">
                {transaction.tags.map(tag => (
                  <TagBadge key={tag} tag={tag} />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
            Metadata
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className="min-w-0">
            <label className="text-xs sm:text-sm font-medium">Global TX UID</label>
            <CopyableCode value={transaction.global_tx_uid} />
          </div>

          <div className="min-w-0">
            <label className="text-xs sm:text-sm font-medium">Integrity Hash</label>
            <CopyableCode
              value={transaction.integrity_hash || 'N/A'}
              displayValue={transaction.integrity_hash ? formatAddress(transaction.integrity_hash, 8) : 'N/A'}
            />
          </div>

          <div className="flex gap-2 flex-wrap items-center">
            <label className="text-xs sm:text-sm font-medium">Indexer Version</label>
            <Badge variant="outline" className="text-xs sm:text-sm">
              {transaction.indexer_version || 'Unknown'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
