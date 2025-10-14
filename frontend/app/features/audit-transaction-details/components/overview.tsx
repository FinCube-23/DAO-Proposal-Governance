import type { Transaction } from '@/shared/types/transactions';
import { FileText, Receipt } from 'lucide-react';
import { TagBadge } from '@/features/audit-dashboard/components/tag-badge';
import { CopyableCode } from '@/shared/components/copyable-code';
import { TimeDisplay } from '@/shared/components/time-display';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { formatAddress, formatFee, formatValue } from '@/shared/utils';

interface Props {
  transaction: Transaction;
}
export default function TransactionOverview({ transaction }: Props) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Transaction Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">From</label>
              <CopyableCode value={transaction.from_address} />
            </div>
            <div>
              <label className="text-sm font-medium">To</label>
              {transaction.to_address
                ? (
                    <CopyableCode value={transaction.to_address} />
                  )
                : (
                    <span className="text-sm text-muted-foreground">Contract Creation</span>
                  )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Value</label>
            <div className="text-lg font-mono">
              {formatValue(transaction.value_raw, transaction.value_decimals, transaction.value_currency)}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Source</label>
            <span className={`inline-flex w-fit items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${
              transaction.source === 'alchemy'
                ? 'bg-blue-500 text-white'
                : 'bg-purple-500 text-white'
            }`}
            >
              {transaction.source}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Gas Used</label>
              <div className="font-mono text-sm">
                {transaction.gas_used?.toLocaleString() || 'N/A'}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Transaction Fee</label>
              <div className="font-mono text-sm">
                {formatFee(transaction.gas_used, transaction.effective_fee_raw)}
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Function</label>
            <div className="font-mono text-sm">
              {transaction.function_name || 'Unknown'}
            </div>
          </div>

          {transaction.tags.length > 0 && (
            <div>
              <label className="text-sm font-medium">Tags</label>
              <div className="flex gap-2 mt-1">
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
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Metadata
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Global TX UID</label>
            <CopyableCode value={transaction.global_tx_uid} />
          </div>

          <div>
            <label className="text-sm font-medium">Integrity Hash</label>
            <CopyableCode
              value={transaction.integrity_hash || 'N/A'}
              displayValue={transaction.integrity_hash ? formatAddress(transaction.integrity_hash, 8) : 'N/A'}
            />
          </div>

          <div className="flex gap-2">
            <label className="text-sm font-medium">Indexer Version</label>
            <Badge variant="outline">
              {transaction.indexer_version || 'Unknown'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
