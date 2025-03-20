import { Badge } from "@components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@components/ui/pagination";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@components/ui/table";
import { Select } from "@radix-ui/react-select";
import { Transaction } from "@redux/api/types";
import { useLazyGetTransactionsQuery } from "@redux/services/auditTrail";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

const TrxList = () => {
  const [getTransactions, { data, error, isLoading }] =
    useLazyGetTransactionsQuery();
  const [trxList, setTrxList] = useState<Transaction[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState<string | undefined>();
  const navigate = useNavigate();

  useEffect(() => {
    const getTrxs = async () => {
      try {
        const response: any = await getTransactions({
          page: page,
          limit: limit,
          status: status,
        });

        setTrxList(response.data.data);
      } catch (e) {
        console.error(e);
      }
    };

    getTrxs();
  }, [page, status, getTransactions, limit]);

  useEffect(() => {
    if (data) {
      setTrxList(data.data);
      setTotalPages(data.totalPages);
    }
  }, [data]);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading data</p>;

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  return (
    <>
      <div className="flex justify-end">
        <div className="w-[200px]">
          <Select value={status} onValueChange={(value) => setStatus(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Pending</SelectItem>
              <SelectItem value="1">Confirmed</SelectItem>
            </SelectContent>
          </Select>
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
          {trxList.map((trx) => (
            <TableRow
              onClick={() => navigate(`/admin/dashboard/trx-details/${trx.id}`)}
              className="hover:bg-gray-800 hover:cursor-pointer"
              key={trx.id}
            >
              <TableCell>{trx.id}</TableCell>
              <TableCell>{trx.trx_hash}</TableCell>
              <TableCell>
                {trx.trx_status ? (
                  <Badge variant="success">Confirmed</Badge>
                ) : (
                  <Badge variant="warning">Pending</Badge>
                )}
              </TableCell>
              <TableCell className="capitalize">
                {trx.confirmation_source}
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
                  page === 1 && "pointer-events-none opacity-50"
                } cursor-pointer`}
                onClick={() => {
                  setPage((prev) => Math.max(1, prev - 1));
                }}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(pageNum);
                    }}
                    isActive={Number(setPage) === pageNum}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              )
            )}
            <PaginationItem>
              <PaginationNext
                className={`${
                  page === totalPages && "pointer-events-none opacity-50"
                } cursor-pointer`}
                onClick={() => {
                  setPage((prev) => Math.min(totalPages, prev + 1));
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </>
  );
};

export default TrxList;
