import type { ColumnDef } from '@tanstack/react-table';
import type { Transaction } from '@/core/api/types';
import { CopyableCode } from '@/shared/components/copyable-code';
import { StatusBadge } from '@/shared/components/status-badge';
import { TimeDisplay } from '@/shared/components/time-display';
import { formatAddress } from '@/shared/utils';
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
      enableSorting: false,
      cell: ({ row }) => (
        <StatusBadge status={row.getValue('trx_status') === 0 ? 'pending' : 'success'} showIcon />
      ),
    },
    {
      accessorKey: 'trx_hash',
      header: 'Hash',
      enableSorting: false,
      cell: ({ row }) => (
        <CopyableCode
          value={row.getValue('trx_hash')}
          displayValue={formatAddress(row.getValue('trx_hash'), 8)}
        />
      ),
    },
    {
      accessorKey: 'from',
      header: 'From',
      enableSorting: false,
      cell: ({ row }) => (
        <CopyableCode
          value={row.getValue('from') || 'N/A'}
          displayValue={formatAddress(row.getValue('from') || 'N/A')}
        />
      ),
    },
    {
      accessorKey: 'to',
      header: 'To',
      enableSorting: false,
      cell: ({ row }) => {
        const to = row.getValue('to') as string;
        return to
          ? (
              <CopyableCode
                value={to}
                displayValue={formatAddress(to)}
              />
            )
          : (
              <span className="text-gray-400">-</span>
            );
      },
    },
    {
      accessorKey: 'chain_id',
      header: 'Chain ID',
      enableSorting: false,
      cell: ({ row }) => {
        const chainId = row.getValue('chain_id') as string;
        return (
          <div className="font-mono text-xs">
            {chainId || '-'}
          </div>
        );
      },
    },
    {
      accessorKey: 'address',
      header: 'Address',
      enableSorting: false,
      cell: ({ row }) => {
        const address = row.getValue('address') as string;
        return address
          ? (
              <CopyableCode
                value={address}
                displayValue={formatAddress(address)}
              />
            )
          : (
              <span className="text-gray-400">-</span>
            );
      },
    },
    {
      accessorKey: 'function',
      header: 'Function',
      enableSorting: false,
      cell: ({ row }) => {
        const functionName = row.getValue('function') as string;
        return (
          <div className="font-mono text-xs">
            {functionName || 'Unknown'}
          </div>
        );
      },
    },
    {
      accessorKey: 'gas_cost',
      header: 'Gas Cost',
      enableSorting: false,
      cell: ({ row }) => {
        const gasCost = row.getValue('gas_cost') as number;
        return (
          <div className="font-mono text-xs">
            {gasCost ? `${gasCost.toFixed(18)} ETH` : '-'}
          </div>
        );
      },
    },
    {
      accessorKey: 'confirmation_source',
      header: 'Source',
      enableSorting: false,
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
      enableSorting: false,
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
