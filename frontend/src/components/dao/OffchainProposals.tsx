import { IOffchainProposalCard } from "@lib/interfaces";
import {
  useLazyFilterProposalsQuery,
  useLazyGetProposalsQuery,
} from "@redux/services/proposal";
import { useEffect, useState } from "react";
import OffchainCard from "./OffChainCard";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

const OffchainProposals = () => {
  const [proposalsFromBE, setProposalsFromBE] =
    useState<IOffchainProposalCard[]>();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isFiltered, setIsFiltered] = useState(false);

  const [getPaginatedProposals, { isFetching: isPaginatedFetching }] =
    useLazyGetProposalsQuery();
  const [getFilteredProposals, { isFetching: isFilteredProposalFetching }] =
    useLazyFilterProposalsQuery();

  const isLoading = isPaginatedFetching || isFilteredProposalFetching;

  useEffect(() => {
    const fetchData = async () => {
      if (selectedStatus === "all") {
        const { data } = await getPaginatedProposals({
          pageNumber: currentPage,
          limit: 5,
        });

        if (data) {
          setProposalsFromBE(data.data || []);
          setTotalPages(Math.ceil(data.total / 5));
          setIsFiltered(false);
        }
      } else {
        const { data } = await getFilteredProposals(selectedStatus);

        if (data) {
          setProposalsFromBE(data || []);
          setTotalPages(1);
          setIsFiltered(true);
        }
      }
    };

    fetchData();
  }, [
    currentPage,
    selectedStatus,
    getPaginatedProposals,
    getFilteredProposals,
  ]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-end items-center gap-2">
        <span className="text-xs">Filter by status:</span>
        <div className="w-[150px]">
          <Select
            value={selectedStatus}
            onValueChange={(value) => {
              setSelectedStatus(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="cancel">Canceled</SelectItem>
              <SelectItem value="executed">Executed</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {isLoading ? (
        <div className="flex flex-col gap-5">
          {Array.from({ length: selectedStatus === "all" ? 5 : 3 }).map(
            (_, i) => (
              <Skeleton key={i} className="h-[150px] w-full rounded-xl" />
            )
          )}
        </div>
      ) : proposalsFromBE && proposalsFromBE.length > 0 ? (
        proposalsFromBE?.map((proposal, idx) => (
          <OffchainCard
            key={idx}
            proposal={proposal}
            proposalId={proposal.id}
          />
        ))
      ) : (
        <div className="text-center text-muted-foreground border-2 border-dashed p-5 rounded-xl">
          {isFiltered
            ? "No proposals found with the selected filter"
            : "No proposals available"}
        </div>
      )}
      {!isFiltered && totalPages > 1 && (
        <Pagination className="my-5">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage((prev) => Math.max(prev - 1, 1));
                }}
                className={`${
                  currentPage === 1 && "pointer-events-none opacity-50"
                } cursor-pointer`}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  className={`cursor-pointer ${
                    page === currentPage ? "border-2 border-green-400" : ""
                  }`}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(page);
                  }}
                  isActive={page === currentPage}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                }}
                className={`${
                  currentPage === totalPages && "pointer-events-none opacity-50"
                } cursor-pointer`}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default OffchainProposals;
