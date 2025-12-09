import type { ColumnDef } from '@tanstack/react-table';
import type { Transaction } from '@/core/api/types';
import { useQuery } from '@tanstack/react-query';
import { Activity, ChevronRight, ExternalLink, GitBranch } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { TransactionConfirmationSource } from '@/core/api/types';
import { auditTrailApis } from '@/core/services/audit';
import { CopyableCode } from '@/shared/components/copyable-code';
import { DataTable } from '@/shared/components/dashboard/data-table';
import { StatusBadge } from '@/shared/components/status-badge';
import { TimeDisplay } from '@/shared/components/time-display';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/components/ui/collapsible';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { formatAddress } from '@/shared/utils';

const transactionColumns: ColumnDef<Transaction>[] = [
  {
    accessorKey: 'updated_at',
    header: 'Time',
    enableSorting: false,
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
    cell: ({ row }) => {
      const status = row.getValue('trx_status') as number | null;
      const confirmationSource = row.original.confirmation_source;

      // If confirmation source is PENDING_SOURCE, it's pending
      if (confirmationSource === TransactionConfirmationSource.PENDING_SOURCE) {
        return <StatusBadge status="pending" showIcon />;
      }

      // Otherwise, check the status value
      return (
        <StatusBadge status={status === 1 ? 'success' : 'failed'} showIcon />
      );
    },
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
    cell: ({ row }) => {
      const from = row.getValue('from') as string;
      return from
        ? (
            <CopyableCode
              value={from}
              displayValue={formatAddress(from)}
            />
          )
        : (
            <span className="text-gray-400">-</span>
          );
    },
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
      const source = row.getValue('confirmation_source') as string;
      return (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${
          source === 'alchemy'
            ? 'bg-blue-500 text-white'
            : source === 'graph'
              ? 'bg-purple-500 text-white'
              : 'bg-gray-500 text-white'
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
      const eventLogsRaw = row.original.event_logs;

      // Parse event logs
      let eventLogs: any[] = [];
      if (eventLogsRaw) {
        try {
          const parsed = JSON.parse(eventLogsRaw);
          if (parsed.data) {
            eventLogs = [parsed];
          }
          else if (Array.isArray(parsed)) {
            eventLogs = parsed;
          }
          else {
            eventLogs = [parsed];
          }
        }
        catch (e) {
          console.error('Failed to parse event logs:', e);
        }
      }

      return (
        <div className="flex items-center gap-0.5">
          {/* Flow Button */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                disabled={lifecycle.filter((step: any) => step.service?.toLowerCase().includes('service')).length === 0}
                onClick={e => e.stopPropagation()}
              >
                <GitBranch className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96">
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Transaction Confirmation Trace</h4>
                {lifecycle.filter((step: any) => step.service?.toLowerCase().includes('service')).length === 0
                  ? (
                      <div className="space-y-2">
                        <div className="text-sm text-gray-500 text-center py-4">
                          No services with 'service' in name found
                        </div>
                        <div className="text-xs text-gray-400 text-center">
                          Only showing services that contain the word 'service'
                        </div>
                      </div>
                    )
                  : (
                      <div className="space-y-3">
                        {lifecycle
                          .filter((step: any) => step.service?.toLowerCase().includes('service'))
                          .map((step: any, index: number) => {
                            const filteredLifecycle = lifecycle.filter((s: any) => s.service?.toLowerCase().includes('service'));
                            const isLast = index === filteredLifecycle.length - 1;
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
                    )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Event Logs Button */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-green-100 hover:text-green-600 transition-colors"
                disabled={eventLogs.length === 0}
                onClick={e => e.stopPropagation()}
                title="View Event Logs"
              >
                <Activity className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 max-h-80 overflow-y-auto bg-background border-border">
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Event Logs</h4>
                {eventLogs.length === 0
                  ? (
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground text-center py-4">
                          No event logs available
                        </div>
                        <div className="text-xs text-muted-foreground/70 text-center">
                          Event logs will appear here when available
                        </div>
                      </div>
                    )
                  : (
                      <div className="space-y-3">
                        {eventLogs.map((event: any, index: number) => {
                          const eventData = event.data || event;
                          const eventName = eventData.__typename || eventData.eventType || 'Event';
                          const proposalId = eventData.proposalId;

                          return (
                            <Collapsible key={index}>
                              <CollapsibleTrigger asChild>
                                <div
                                  className="flex items-center justify-between p-2 border border-border rounded cursor-pointer hover:bg-accent/50 bg-card"
                                  onClick={e => e.stopPropagation()}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">
                                      {eventName}
                                    </span>
                                    {proposalId && (
                                      <span className="text-xs text-muted-foreground">
                                        #
                                        {proposalId}
                                      </span>
                                    )}
                                  </div>
                                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                </div>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <div className="p-3 bg-muted/50 border border-border rounded space-y-2 overflow-hidden">
                                  {Object.entries(eventData).map(([key, value]) => (
                                    <div key={key} className="text-xs min-w-0">
                                      <div className="font-medium capitalize">
                                        {key.replace(/_/g, ' ')}
                                        :
                                      </div>
                                      <div className="font-mono text-xs break-all text-foreground/80 overflow-wrap-anywhere max-w-full">
                                        {typeof value === 'object'
                                          ? JSON.stringify(value, null, 2)
                                          : String(value)}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          );
                        })}
                      </div>
                    )}
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

  const { data, isLoading } = useQuery({
    queryKey: ['recentTransactions'],
    queryFn: () => auditTrailApis.getTransactions({ page: 1, limit: 5 }),
  });

  const handleTransactionClick = (transaction: Transaction) => {
    // Check if transaction is pending
    const isPending = transaction.confirmation_source === TransactionConfirmationSource.PENDING_SOURCE || transaction.trx_status === 0;

    if (isPending) {
      // Navigate to pending page
      navigate('/organization/audit/transactions/pending');
    }
    else {
      // Navigate to transaction details page
      navigate(`/organization/audit/transactions/${transaction.id}`);
    }
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
          data={data?.data || []}
          isLoading={isLoading}
          onRowClick={handleTransactionClick}
        />
      </CardContent>
    </Card>
  );
}
