import type { ColumnDef } from '@tanstack/react-table';
import type { Transaction } from '@/core/api/types';
import { CopyableCode } from '@/shared/components/copyable-code';
import { StatusBadge } from '@/shared/components/status-badge';
import { TimeDisplay } from '@/shared/components/time-display';
import { formatAddress } from '@/shared/utils';
import { formatValue } from '@/shared/utils/formatters';
import { TransactionConfirmationTrace } from './transaction-confirmation-trace';
import { TransactionEventLogs } from './transaction-event-logs';

export function createTransactionColumns(): ColumnDef<Transaction>[] {
  return [
    {
      accessorKey: 'updated_at',
      header: 'Time',
      cell: ({ row }) => (
        <TimeDisplay
          timestamp={row.getValue('updated_at')}
          enableToggle
          className="text-xs"
        />
      ),
    },
    {
      accessorKey: 'trx_status',
      header: 'Status',
      cell: ({ row }) => (
        <StatusBadge status={row.getValue('trx_status') === 0 ? 'pending' : 'success'} showIcon />
      ),
    },
    {
      accessorKey: 'trx_hash',
      header: 'Hash',
      cell: ({ row }) => (
        <CopyableCode
          value={row.getValue('trx_hash')}
          displayValue={formatAddress(row.getValue('trx_hash'), 8)}
        />
      ),
    },
    {
      accessorKey: 'from_address',
      header: 'From',
      cell: ({ row }) => (
        <CopyableCode
          value={row.getValue('from_address') || '0xF15E6b68541AAe83bB96F61498812c3E0A35F09a'}
          displayValue={formatAddress(row.getValue('from_address') || '0xF15E6b68541AAe83bB96F61498812c3E0A35F09a')}
        />
      ),
    },
    {
      accessorKey: 'function_name',
      header: 'Function',
      cell: ({ row }) => {
        const functionName = row.getValue('function_name') as string;
        const topEvent = row.original.top_event;

        return (
          <div className="font-mono text-xs">
            {functionName || topEvent || 'Unknown'}
          </div>
        );
      },
    },
    {
      accessorKey: 'effective_fee_raw',
      header: 'Gas Cost',
      cell: ({ row }) => {
        const tx = row.original;
        const fee = tx.effective_fee_raw;
        return (
          <div className="font-mono text-xs">
            {fee ? formatValue(fee, 18, 'ETH') : '-'}
          </div>
        );
      },
    },
    {
      accessorKey: 'confirmation_source',
      header: 'Source',
      cell: ({ row }) => {
        const source = (row.original as any).confirmation_source;
        return (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${
            source === 'alchemy'
              ? 'bg-blue-500 text-white'
              : 'bg-purple-500 text-white'
          }`}
          >
            {source}
          </span>
        );
      },
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const lifecycle = row.original.transaction_confirmation_trace || [];
        const eventLogs = row.original.event_logs || [];

        return (
          <div className="flex items-center gap-0.5">
            <TransactionConfirmationTrace lifecycle={lifecycle} />
            <TransactionEventLogs eventLogs={eventLogs} />
          </div>
        );
      },
    },
  ];
}
