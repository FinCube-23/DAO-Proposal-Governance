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
import { MFSBusiness } from "@redux/api/types";
import { useLazyGetAllMFSQuery } from "@redux/services/mfs";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

const MFSList = () => {
  const [getAllMFS, { data, error, isLoading }] = useLazyGetAllMFSQuery();
  const [mfsList, setMfsList] = useState<MFSBusiness[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const getMFSs = async () => {
      try {
        const response: any = await getAllMFS({
          page: page,
          limit: limit,
          status: status,
        });

        setMfsList(response.data.data);
      } catch (e) {
        console.error(e);
      }
    };

    getMFSs();
  }, [page, status, getAllMFS, limit]);

  useEffect(() => {
    if (data) {
      setMfsList(data.data);
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
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="register">Registered</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="cancelled">Canceled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Membership Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Updated At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mfsList.map((mfs) => (
            <TableRow
              onClick={() => navigate(`/admin/dashboard/mfs-details/${mfs.id}`)}
              className="hover:bg-gray-800 hover:cursor-pointer"
              key={mfs.id}
            >
              <TableCell>{mfs.id}</TableCell>
              <TableCell>{mfs.name}</TableCell>
              <TableCell>{mfs.type}</TableCell>
              <TableCell>{mfs.location}</TableCell>
              <TableCell className="capitalize">
                {mfs.membership_onchain_status}
              </TableCell>
              <TableCell>{formatDate(mfs.created_at)}</TableCell>
              <TableCell>{formatDate(mfs.updated_at)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {mfsList.length === 0 && (
        <p className="text-center font-bold">No data found</p>
      )}
      {mfsList.length > 0 && (
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
                    className={`cursor-pointer ${
                      page === pageNum ? "border-2 border-green-400" : ""
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

export default MFSList;
