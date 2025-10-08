import type { ColumnDef } from '@tanstack/react-table';
import type { Transaction } from '@/shared/types/transactions';
import { Activity, ChevronRight, ExternalLink, GitBranch } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { CopyableCode } from '@/shared/components/copyable-code';
import { DataTable } from '@/shared/components/dashboard/data-table';
import { StatusBadge } from '@/shared/components/status-badge';
import { TimeDisplay } from '@/shared/components/time-display';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/components/ui/collapsible';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { formatAddress } from '@/shared/utils';
import { formatValue } from '@/shared/utils/formatters';
import { TRANSACTIONS } from '../mock-data/recent-trxs';

const transactionColumns: ColumnDef<Transaction>[] = [
  {
    accessorKey: 'block_timestamp',
    header: 'Time',
    cell: ({ row }) => (
      <TimeDisplay
        timestamp={row.getValue('block_timestamp')}
        enableToggle
        className="text-xs"
      />
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <StatusBadge status={row.getValue('status')} showIcon />
    ),
  },
  {
    accessorKey: 'tx_hash',
    header: 'Hash',
    cell: ({ row }) => (
      <CopyableCode
        value={row.getValue('tx_hash')}
        displayValue={formatAddress(row.getValue('tx_hash'), 8)}
      />
    ),
  },
  {
    accessorKey: 'from_address',
    header: 'From',
    cell: ({ row }) => (
      <CopyableCode
        value={row.getValue('from_address')}
        displayValue={formatAddress(row.getValue('from_address'))}
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
    accessorKey: 'source',
    header: 'Source',
    cell: ({ row }) => {
      const source = (row.original as any).source;
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
      const lifecycle = row.original.flow || [];
      const eventLogs = row.original.event_logs || [];

      return (
        <div className="flex items-center gap-0.5">
          {/* Flow Button */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                disabled={lifecycle.length === 0}
                onClick={e => e.stopPropagation()}
              >
                <GitBranch className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96">
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Transaction Flow</h4>
                <div className="space-y-3">
                  {lifecycle.map((step: any, index: number) => {
                    const isLast = index === lifecycle.length - 1;
                    const statusColor = step.status === 'completed'
                      ? 'border-green-500 bg-green-500'
                      : step.status === 'pending'
                        ? 'border-yellow-500 bg-yellow-500'
                        : step.status === 'failed'
                          ? 'border-red-500 bg-red-500'
                          : 'border-gray-300 bg-gray-300';
                    return (
                      <div key={index} className="relative pl-7">
                        {!isLast && (
                          <div className="absolute left-3 top-4 bottom-0 w-px bg-gray-300" />
                        )}
                        <div className={`absolute left-2.5 top-2 h-3 w-3 rounded-full border-2 ${statusColor}`} />
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex flex-col">
                            <div className="text-xs font-medium leading-5">{step.service}</div>
                            <div className="mt-0.5 inline-flex items-center gap-2">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium capitalize ${
                                step.status === 'completed'
                                  ? 'bg-green-100 text-green-700'
                                  : step.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : step.status === 'failed'
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-gray-100 text-gray-700'
                              }`}
                              >
                                {step.status}
                              </span>
                            </div>
                          </div>
                          <div className="text-muted-foreground">
                            {step.timestamp
                              ? (
                                  <TimeDisplay
                                    timestamp={step.timestamp}
                                    className="text-[10px]"
                                    showRelative={false}
                                  />
                                )
                              : (
                                  <span className="text-gray-400 text-[10px]">-</span>
                                )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Event Logs Button */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                disabled={eventLogs.length === 0}
                onClick={e => e.stopPropagation()}
              >
                <Activity className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 max-h-80 overflow-y-auto">
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Event Logs</h4>
                <div className="space-y-3">
                  {eventLogs.map((event: any, index: number) => (
                    <Collapsible key={index}>
                      <CollapsibleTrigger asChild>
                        <div
                          className="flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-gray-200 bg-gray-100"
                          onClick={e => e.stopPropagation()}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-gray-900">{event.event_name}</span>
                            <span className="text-xs text-gray-600">
                              #
                              {event.log_index}
                            </span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-600" />
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="p-3 bg-gray-200 border rounded space-y-2">
                          <div className="text-xs">
                            <div className="font-medium text-gray-900">Contract:</div>
                            <div className="font-mono text-xs break-all text-gray-800">{formatAddress(event.contract_address)}</div>
                          </div>
                          <div className="text-xs">
                            <div className="font-medium text-gray-900">Topics:</div>
                            {event.topics.map((topic: string, topicIndex: number) => (
                              <div key={topicIndex} className="font-mono text-xs break-all text-gray-800">
                                [
                                {topicIndex}
                                ]:
                                {' '}
                                {topic}
                              </div>
                            ))}
                          </div>
                          <div className="text-xs">
                            <div className="font-medium text-gray-900">Data:</div>
                            <div className="font-mono text-xs break-all text-gray-800">{event.data}</div>
                          </div>
                          <div className="text-xs text-gray-600">
                            Block:
                            {' '}
                            {event.block_number}
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      );
    },
  },
];

export default function RecentTransactions() {
  const navigate = useNavigate();
  const handleTransactionClick = (transaction: Transaction) => {
    // Navigate to transaction details page
    navigate(`/organization/audit/transactions/${transaction.id}`);
  };
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Transactions
          </CardTitle>
          <Link to="/organization/audit/transactions">
            <Button variant="ghost" size="sm">
              View All
              {' '}
              <ExternalLink className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={transactionColumns}
          data={TRANSACTIONS.slice(0, 10)}
          isLoading={false}
          onRowClick={handleTransactionClick}
        />
      </CardContent>
    </Card>
  );
}
