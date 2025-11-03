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
      <div className="flex justify-between">
        <div className="w-[200px] flex flex-col">
          <div className="flex w-[500px] gap-2 items-center">
            <span className="text-xs">Search:</span>
            <Input
              placeholder="Filter by hash"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-5">
          <div className="flex items-center gap-2">
            <span className="text-xs">Filter by Source:</span>
            <Select value={source} onValueChange={value => setSource(value)}>
              <SelectTrigger>
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
          <div className="flex items-center gap-2">
            <span className="text-xs">Filter by Status:</span>

            <Select
              value={`${status}`}
              onValueChange={value => setStatus(value)}
            >
              <SelectTrigger>
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Transaction Hash</TableHead>
            <TableHead>Transaction Status</TableHead>
            <TableHead>Confirmation Source</TableHead>
            <TableHead>Updated At</TableHead>
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
              <TableCell>{trx.trx_hash}</TableCell>
              <TableCell>
                {trx.trx_status
                  ? (
                      <Badge variant="success">Confirmed</Badge>
                    )
                  : (
                      <Badge variant="warning">Pending</Badge>
                    )}
              </TableCell>
              <TableCell>
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
              <TableCell>{formatDate(trx.updated_at)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
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
