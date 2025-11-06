import type { Transaction } from '@/core/api/types';
import { Select } from '@radix-ui/react-select';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { TransactionConfirmationSource } from '@/core/api/types';
import { auditTrailApis } from '@/core/services/audit';
import CustomPagination from '@/shared/components/custom-pagination';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';

const limit = 10;

function TrxList() {
  const [trxList, setTrxList] = useState<Transaction[]>([]);
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

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-4 lg:justify-between">
        <div className="flex gap-2 items-center w-full lg:w-auto">
          <span className="text-xs whitespace-nowrap">Search:</span>
          <Input
            placeholder="Filter by hash"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="flex-1 sm:w-64 lg:w-80"
          />
        </div>
        <div className="flex gap-2 sm:gap-3 lg:gap-5 overflow-x-auto">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs whitespace-nowrap">Source:</span>
            <Select value={source} onValueChange={value => setSource(value)}>
              <SelectTrigger className="w-32 sm:w-40">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="alchemy">Alchemy</SelectItem>
                <SelectItem value="infura">Infura</SelectItem>
                <SelectItem value="graph">The Graph</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="pending_source">Pending Source</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs whitespace-nowrap">Status:</span>

            <Select
              value={`${status}`}
              onValueChange={value => setStatus(value)}
            >
              <SelectTrigger className="w-28 sm:w-32">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="0">Pending</SelectItem>
                <SelectItem value="1">Confirmed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Transaction Hash</TableHead>
                  <TableHead className="whitespace-nowrap">Transaction Status</TableHead>
                  <TableHead className="whitespace-nowrap">Confirmation Source</TableHead>
                  <TableHead className="whitespace-nowrap">Updated At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trxList.map(trx => (
                  <TableRow
                    onClick={() => {
                      navigate(`/organization/admin/transactions/${trx.id}`);
                    }}
                    className="hover:bg-gray-800 hover:cursor-pointer"
                    key={trx.id}
                  >
                    <TableCell className="whitespace-nowrap">{trx.trx_hash}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {trx.trx_status
                        ? (
                            <Badge variant="success">Confirmed</Badge>
                          )
                        : (
                            <Badge variant="warning">Pending</Badge>
                          )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {trx.confirmation_source === TransactionConfirmationSource.ALCHEMY
                        ? (
                            <Badge
                              variant="outline"
                              className="border-2 border-blue-400 text-white"
                            >
                              Alchemy
                            </Badge>
                          )
                        : trx.confirmation_source === TransactionConfirmationSource.THE_GRAPH
                          ? (
                              <Badge
                                variant="outline"
                                className="border-2 border-purple-400 text-white"
                              >
                                The Graph
                              </Badge>
                            )
                          : trx.confirmation_source === TransactionConfirmationSource.INFURA
                            ? (
                                <Badge variant="outline" className="border-2 border-gray-400">
                                  Infura
                                </Badge>
                              )
                            : trx.confirmation_source === TransactionConfirmationSource.MANUAL
                              ? (
                                  <Badge
                                    variant="outline"
                                    className="border-2 border-yellow-400"
                                  >
                                    Manual
                                  </Badge>
                                )
                              : trx.confirmation_source === TransactionConfirmationSource.PENDING_SOURCE
                                ? (
                                    <Badge
                                      variant="outline"
                                      className="border-2 border-orange-400 text-white"
                                    >
                                      Pending Source
                                    </Badge>
                                  )
                                : null}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{formatDate(trx.updated_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      {trxList.length === 0 && (
        <p className="text-center font-bold">No data found</p>
      )}
      {trxList.length > 0 && (
        <CustomPagination
          limit={limit}
          total={total}
          page={page}
          onPageChange={setPage}
        />
      )}
    </>
  );
}

export default TrxList;
