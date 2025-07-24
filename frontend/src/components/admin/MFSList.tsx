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

const locations = [
  { label: "Australia", value: "AUS" },
  { label: "Bangladesh", value: "BGD" },
  { label: "Canada", value: "CAD" },
  { label: "China", value: "CN" },
  { label: "Netherlands", value: "NL" },
  { label: "United States", value: "USA" },
];

const MFSList = () => {
  const [getAllMFS, { data, error, isLoading }] = useLazyGetAllMFSQuery();
  const [mfsList, setMfsList] = useState<MFSBusiness[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const getMFSs = async () => {
      try {
        const response: any = await getAllMFS({
          page,
          limit,
          status,
          location,
          type,
        });

        setMfsList(response.data.data);
      } catch (e) {
        console.error(e);
      }
    };

    getMFSs();
  }, [page, status, location, getAllMFS, limit, type]);

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
      <div className="flex justify-end space-x-4">
        <div className="w-[200px] flex">
          <span className="text-xs">Filter by Status:</span>
          <Select value={status} onValueChange={(value) => setStatus(value)}>
            <SelectTrigger>
              <SelectValue placeholder="All" />
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
        <div className="w-[200px] flex">
          <span className="text-xs">Filter by Location:</span>
          <Select
            value={location}
            onValueChange={(value) => setLocation(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {locations.map((loc, idx) => (
                <SelectItem key={idx} value={loc.value}>
                  {loc.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-[200px] flex">
          <span className="text-xs">Filter by Type:</span>
          <Select value={type} onValueChange={(value) => setType(value)}>
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="DAO">DAO</SelectItem>
              <SelectItem value="MFS">MFS</SelectItem>
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
              onClick={() =>
                navigate(`/admin/dashboard/organizations/${mfs.id}`)
              }
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
        <p className="text-center font-bold">No organization found</p>
      )}

      {mfsList.length > 0 && (
        <Pagination className="my-5">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                className={`${
                  page === 1 && "pointer-events-none opacity-50"
                } cursor-pointer`}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              />
            </PaginationItem>

            {(() => {
              const range: (number | string)[] = [];
              const delta = 2; // how many pages before/after current page to show
              const rangeStart = Math.max(2, page - delta);
              const rangeEnd = Math.min(totalPages - 1, page + delta);

              range.push(1); // Always show first page

              if (rangeStart > 2) {
                range.push("...");
              }

              for (let i = rangeStart; i <= rangeEnd; i++) {
                range.push(i);
              }

              if (rangeEnd < totalPages - 1) {
                range.push("...");
              }

              if (totalPages > 1) {
                range.push(totalPages); // Always show last page if more than 1
              }

              return range.map((item, index) => (
                <PaginationItem key={index}>
                  {item === "..." ? (
                    <span className="px-2 text-muted-foreground">...</span>
                  ) : (
                    <PaginationLink
                      className={`cursor-pointer ${
                        page === item ? "border-2 border-green-400" : ""
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(item as number);
                      }}
                      isActive={page === item}
                    >
                      {item}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ));
            })()}

            <PaginationItem>
              <PaginationNext
                className={`${
                  page === totalPages && "pointer-events-none opacity-50"
                } cursor-pointer`}
                onClick={() =>
                  setPage((prev) => Math.min(totalPages, prev + 1))
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </>
  );
};

export default MFSList;
