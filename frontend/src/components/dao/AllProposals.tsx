import { useEffect, useState } from "react";
import contractABI from "../../contractABI/contractABI.json";
import { readContract } from "@wagmi/core";
import { IProposal } from "@lib/interfaces";
import { config } from "../../main";
import ProposalCard from "./ProposalCard";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

const AllProposals = () => {
  const [proposals, setProposals] = useState<IProposal[]>();
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalProposals, setTotalProposals] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTotalProposals = async () => {
      try {
        const total = await readContract(config, {
          abi: contractABI,
          address: import.meta.env.VITE_SMART_CONTRACT_ADDRESS,
          functionName: "proposalCount",
        });
        const totalNum = Number(total);
        setTotalProposals(totalNum);
        setTotalPages(Math.ceil(totalNum / 5));
      } catch (e) {
        console.error(e);
      }
    };
    fetchTotalProposals();
  }, []);

  useEffect(() => {
    const getProposals = async (page: number) => {
      setLoading(true);
      try {
        const startIndex = Math.max(totalProposals - (page + 1) * 5, 0);
        const endIndex = totalProposals - page * 5;

        if (startIndex >= endIndex) {
          setProposals([]);
          return;
        }

        const response: any = await readContract(config, {
          abi: contractABI,
          address: import.meta.env.VITE_SMART_CONTRACT_ADDRESS,
          functionName: "getProposalsByPage",
          args: [startIndex, endIndex],
        });

        const filteredProposals = response[0]
          .filter(
            (proposal: any) =>
              proposal.proposer !== "0x0000000000000000000000000000000000000000"
          )
          .reverse();

        setProposals(filteredProposals);
        setLoading(false);
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    };

    getProposals(currentPage);
  }, [currentPage, totalProposals]);

  return (
    <div className="flex flex-col gap-5">
      {loading ? (
        <div className="flex flex-col gap-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[150px] w-full rounded-xl" />
          ))}
        </div>
      ) : proposals && proposals.length > 0 ? (
        proposals.map((proposal, idx) => (
          <ProposalCard
            key={idx}
            proposal={proposal}
            proposalId={proposal.proposalId}
          />
        ))
      ) : (
        <p className="text-center text-muted-foreground">No proposals found</p>
      )}

      {totalPages > 1 && (
        <Pagination className="my-5">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage((prev) => Math.max(prev - 1, 0));
                }}
                className={`${
                  currentPage === 0 && "pointer-events-none opacity-50"
                } cursor-pointer`}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
                }}
                className={`${
                  currentPage === totalPages - 1 &&
                  "pointer-events-none opacity-50"
                } cursor-pointer`}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default AllProposals;
