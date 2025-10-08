import type { ColumnDef } from '@tanstack/react-table';
import type { Transaction } from '@/shared/types/transactions';
import { useMutation } from '@tanstack/react-query';
import { Activity, ChevronRight, GitBranch } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { auditTrailApis } from '@/core/services/audit';
import { CopyableCode } from '@/shared/components/copyable-code';
import CustomPagination from '@/shared/components/custom-pagination';
import { DataTable } from '@/shared/components/dashboard/data-table';
import { StatusBadge } from '@/shared/components/status-badge';
import { TimeDisplay } from '@/shared/components/time-display';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/components/ui/collapsible';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { formatAddress } from '@/shared/utils';
import { formatValue } from '@/shared/utils/formatters';
import { TRANSACTIONS } from '../audit-dashboard/mock-data/recent-trxs';
import { TransactionFilterCard } from './components/transaction-filter';

const transactionColumns: ColumnDef<Transaction>[] = [
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
      const lifecycle = row.original.flow || TRANSACTIONS[0].flow;
      const eventLogs = row.original.event_logs || TRANSACTIONS[0].event_logs;

      return (
        <div className="flex items-center gap-0.5">
          {/* Flow Button */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                disabled={lifecycle?.length === 0}
                onClick={e => e.stopPropagation()}
              >
                <GitBranch className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96">
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Transaction Flow</h4>
                <div className="space-y-3">
                  {lifecycle && lifecycle.map((step: any, index: number) => {
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
                disabled={eventLogs?.length === 0}
                onClick={e => e.stopPropagation()}
              >
                <Activity className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 max-h-80 overflow-y-auto">
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Event Logs</h4>
                <div className="space-y-3">
                  {eventLogs && eventLogs.map((event: any, index: number) => (
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

const limit = 10;

export default function AuditTransactions() {
  const [trxList, setTrxList] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<string>('');
  const [source, setSource] = useState<string>('');
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState<string>('');

  const getTransactions = useMutation({
    mutationKey: ['getTransactions'],
    mutationFn: auditTrailApis.getTransactions,
    onSuccess: (data) => {
      setTrxList(data.data);
      setTotal(data.total);
    },
    onError: (error) => {
      console.error('Get transactions failed', error);
    },
  });

  useEffect(() => {
    const getTrxs = async () => {
      getTransactions.mutate({
        page,
        limit,
        status: status === 'all' ? undefined : status,
        source: source === 'all' ? undefined : source,
        hash: searchTerm === '' ? undefined : searchTerm,
      });
    };

    const debounceTimer = setTimeout(() => {
      getTrxs();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [page, status, limit, source, searchTerm]);

  if (getTransactions.isPending)
    return <p>Loading...</p>;
  if (getTransactions.isError)
    return <p>Error loading data</p>;
  const handleTransactionClick = (transaction: Transaction) => {
    // Navigate to transaction details page
    navigate(`/organization/audit/transactions/${transaction.id}`);
  };

  return (
    <div className="grid lg:gap-6 gap-4 lg:grid-cols-4 h-full">
      <div className="lg:col-span-1">
        <TransactionFilterCard className="lg:sticky lg:top-20" filters={{}} onFiltersChange={() => {}} />
      </div>
      <div className="lg:col-span-3 h-full">
        <Card className="h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Transactions
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={transactionColumns}
              data={trxList}
              isLoading={false}
              onRowClick={handleTransactionClick}
            />
          </CardContent>
          <CardFooter className="flex justify-center">
            <CustomPagination limit={limit} total={total} page={page} onPageChange={setPage} />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
