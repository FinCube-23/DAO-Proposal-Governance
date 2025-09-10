import type { Transaction } from '@/core/api/types';
import { Select } from '@radix-ui/react-select';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { auditTrailApis } from '@/core/services/audit';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/shared/components/ui/pagination';
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
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState<string>('');
  const [source, setSource] = useState<string>('');
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState<string>('');

  const getTransactions = useMutation({
    mutationKey: ['getTransactions'],
    mutationFn: auditTrailApis.getTransactions,
    onSuccess: (data) => {
      console.log('data:', data);
      setTrxList(data.data);
      setTotalPages(Math.ceil(data.total / limit));
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
          <div className="flex w-[500px] gap-2">
            <span className="text-xs">Search by Hash:</span>
            <Input
              placeholder="Filter by hash"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            {searchTerm !== ''
              ? (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      // navigate(`/admin/dashboard/trx-details/${searchTerm}`);
                    }}
                  >
                    Search
                  </Button>
                )
              : (
                  <Button variant="secondary" disabled>
                    Search
                  </Button>
                )}
          </div>
        </div>
        <div className="flex gap-5">
          <div className="w-[200px] flex">
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
              </SelectContent>
            </Select>
          </div>
          <div className="w-[200px] flex">
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
            <TableHead>ID</TableHead>
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
                // navigate(`/admin/dashboard/transactions/${trx.id}`);
              }}
              className="hover:bg-gray-800 hover:cursor-pointer"
              key={trx.id}
            >
              <TableCell>{trx.id}</TableCell>
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
                {trx.confirmation_source === 'alchemy'
                  ? (
                      <Badge
                        variant="outline"
                        className="border-2 border-blue-400 text-white"
                      >
                        Alchemy
                      </Badge>
                    )
                  : trx.confirmation_source === 'graph'
                    ? (
                        <Badge
                          variant="outline"
                          className="border-2 border-purple-400 text-white"
                        >
                          The Graph
                        </Badge>
                      )
                    : trx.confirmation_source === 'infura'
                      ? (
                          <Badge variant="outline" className="border-2 border-gray-400">
                            Infura
                          </Badge>
                        )
                      : (
                          trx.confirmation_source === 'manual' && (
                            <Badge
                              variant="outline"
                              className="border-2 border-yellow-400"
                            >
                              Manual
                            </Badge>
                          )
                        )}
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
        <Pagination className="my-5">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                className={`${
                  page === 1 && 'pointer-events-none opacity-50'
                } cursor-pointer`}
                onClick={() => {
                  setPage(prev => Math.max(1, prev - 1));
                }}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              pageNum => (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    className={`cursor-pointer ${
                      page === pageNum ? 'border-2 border-green-400' : ''
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(pageNum);
                    }}
                    isActive={page === pageNum}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              ),
            )}
            <PaginationItem>
              <PaginationNext
                className={`${
                  page === totalPages && 'pointer-events-none opacity-50'
                } cursor-pointer`}
                onClick={() => {
                  setPage(prev => Math.min(totalPages, prev + 1));
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </>
  );
}

export default TrxList;
