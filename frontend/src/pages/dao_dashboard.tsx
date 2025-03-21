import ProposalCard from "@components/dao/ProposalCard";
import { Button } from "@components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@components/ui/card";
import { Box, Flag, Vote, WalletCards, History } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { readContract } from "@wagmi/core";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import contractABI from "../contractABI/contractABI.json";
import { useAccount } from "wagmi";
import { config } from "../main";
import {
  useLazyFilterProposalsQuery,
  useLazyGetProposalsQuery,
} from "@redux/services/proposal";
import Loader from "@components/Loader";
import OffchainCard from "@components/dao/OffChainCard";
import OngoingProposalCard from "@components/dao/OngoingProposalCard";
import { Badge } from "@components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@components/ui/pagination";
import { IDaoInfo, IOffchainProposalCard, IProposal } from "@lib/interfaces";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DaoDashboard() {
  const [proposalsByPage, setProposalsByPage] = useState<IProposal[]>();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [daoURI, setDaoURI] = useState<IDaoInfo>();

  const [proposalCount, setProposalCount] = useState(0);
  const [ongoingProposals, setOngoingProposals] = useState<IProposal[]>();
  const [toggle, setToggle] = useState(0);
  const [version, setVersion] = useState("");
  const [onchainPageNumber, setOnchainPageNumber] = useState(0);
  const [votingPeriod, setVotingPeriod] = useState("");
  const [votingDelay, setVotingDelay] = useState("");
  const [pageLoading, setPageLoading] = useState(false);
  const [proposalsPerPage, setProposalsPerPage] = useState(0);
  const [getProposals] = useLazyGetProposalsQuery();
  const [, setIsMemberApproved] = useState(false);
  const { isConnected, address } = useAccount();
  const [proposalsFromBE, setProposalsFromBE] =
    useState<IOffchainProposalCard[]>();
  const [offchainPage, setOffchainPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>("pending");
  const [filterProposals] = useLazyFilterProposalsQuery();
  const [filtered, setFiltered] = useState([]);
  const [filterToggle, setFilterToggle] = useState<boolean>(false);

  const getVotingPeriod = async () => {
    try {
      const response: any = await readContract(config, {
        abi: contractABI,
        address: import.meta.env.VITE_SMART_CONTRACT_ADDRESS,
        functionName: "votingPeriod",
      });
      const result = response.toString();

      setVotingPeriod(result);
    } catch (e) {
      console.error(e);
    }
  };

  const getVotingDelay = async () => {
    try {
      const response: any = await readContract(config, {
        abi: contractABI,
        address: import.meta.env.VITE_SMART_CONTRACT_ADDRESS,
        functionName: "votingDelay",
      });
      const result = response.toString();

      setVotingDelay(result);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchOngoingProposals = async () => {
    try {
      const response: any = await readContract(config, {
        abi: contractABI,
        address: import.meta.env.VITE_SMART_CONTRACT_ADDRESS,
        functionName: "getOngoingProposals",
      });

      const filteredProposals = response.filter(
        (proposal: any) =>
          proposal.proposer !== "0x0000000000000000000000000000000000000000"
      );

      setOngoingProposals(filteredProposals);
    } catch (e) {
      console.error(e);
    }
  };

  const getProposalCount = async () => {
    try {
      const response: any = await readContract(config, {
        abi: contractABI,
        address: import.meta.env.VITE_SMART_CONTRACT_ADDRESS,
        functionName: "proposalCount",
      });
      const result = Number(response);
      setProposalCount(result);
      setOnchainPageNumber(result);
    } catch (e) {
      console.error(e);
    }
  };

  const getVersion = async () => {
    try {
      const response: any = await readContract(config, {
        abi: contractABI,
        address: import.meta.env.VITE_SMART_CONTRACT_ADDRESS,
        functionName: "UPGRADE_INTERFACE_VERSION",
      });
      const result = response.toString();

      setVersion(result);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const getDAOInfo = async () => {
      try {
        const response: any = await readContract(config, {
          abi: contractABI,
          address: import.meta.env.VITE_SMART_CONTRACT_ADDRESS,
          functionName: "daoURI",
        });
        const parsedObj = JSON.parse(response);

        setDaoURI(parsedObj);
      } catch (e) {
        console.error(e);
      }
    };

    const getProposalsByPage = async (page: any) => {
      setLoading(true);
      try {
        const response: any = await readContract(config, {
          abi: contractABI,
          address: import.meta.env.VITE_SMART_CONTRACT_ADDRESS,
          functionName: "getProposalsByPage",
          args: [page - 5, page],
        });

        const filteredProposals = response[0]
          .filter(
            (proposal: any) =>
              proposal.proposer !== "0x0000000000000000000000000000000000000000"
          )
          .reverse();

        setProposalsPerPage(filteredProposals.length);
        setProposalsByPage(filteredProposals);

        setPageLoading(false);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    const getProposalsFromBE = async () => {
      const { data: response } = await getProposals({
        pageNumber: offchainPage,
        limit: 5,
      });

      if (!response) {
        console.error("No data found in API response", response);
        return;
      }

      setProposalsFromBE(response.data || []);

      setTotalPages(Math.ceil(response.total / response.limit));
    };

    getProposalsByPage(onchainPageNumber);
    fetchOngoingProposals();
    getProposalsFromBE();
    getDAOInfo();
    getVersion();
    getVotingDelay();
    getVotingPeriod();
    setLoading(false);
  }, [
    onchainPageNumber,
    getProposals,
    address,
    isConnected,
    offchainPage,
    setIsMemberApproved,
  ]);

  const handleOnchainNextPage = () => {
    setPageLoading(true);
    setOnchainPageNumber((prevPage) => prevPage - 5);
  };

  const handleOnchainPrevPage = () => {
    if (onchainPageNumber > 0) {
      setPageLoading(true);
      setOnchainPageNumber((prevPage) => prevPage + 5);
    }
  };

  const handleFilterChange = (value: string) => {
    setFilterToggle(true);
    setFilterStatus(value);
  };

  useEffect(() => {
    const filter = async (status: string) => {
      try {
        const response = await filterProposals(status);

        console.log(response.data);
        setFiltered(response.data);
      } catch (e) {
        console.error(e);
      }
    };

    filter(filterStatus);
    getProposalCount();
  }, [filterProposals, filterStatus]);

  return (
    <div className="flex flex-col gap-5">
      {/* <div className="flex items-center gap-2 border border-red-500 text-white font-bold text-sm text-center p-2 rounded-xl">
        <Info />
        <p>
          You are not an approved member to place a new proposal or register a
          new member
        </p>
      </div> */}
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex justify-between items-center">
              <a
                className="text-2xl hover:underline"
                href={`${daoURI?.["@context"]}`}
                target="_"
              >
                {daoURI?.name}
              </a>
              <div className="flex gap-3">
                <Badge variant="secondary">
                  Voting Period: {votingPeriod} second(s)
                </Badge>
                <Badge variant="secondary">
                  Voting Delay: {votingDelay} second(s)
                </Badge>
              </div>
            </div>
          </CardTitle>
          <CardDescription>
            <a
              href="#"
              className="text-sm text-green-500 cursor-pointer hover:underline"
            ></a>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>{daoURI?.description}</p>
        </CardContent>
        <CardFooter>
          <div className="flex gap-10 text-sm justify-center items-center">
            <div className="flex gap-5">
              <div className="flex gap-1">
                <Flag className="text-green-500" /> December 2023
              </div>
              <div className="flex gap-1">
                <Box className="text-green-500" />
                Polygon
              </div>
              <div className="flex gap-1">
                <WalletCards className="text-green-500" />
                Wallet-based
              </div>
              <div className="flex gap-1">
                <History className="text-green-500" />
                {version}
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>
      <div className="md:col-span-7 flex flex-col gap-5">
        <Card>
          <div className="flex justify-between items-center p-3">
            <div className="flex items-center gap-3">
              <Vote className="text-green-500" />
              <p>
                {loading
                  ? "Loading proposals..."
                  : `Total proposals: ${proposalCount}`}
              </p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>New Proposal</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="text-center">
                    Proposal Type
                  </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center">
                  <Button
                    onClick={() =>
                      navigate("/mfs/dao/fincube/general-proposal")
                    }
                    className="my-2 w-60 hover:bg-green-400"
                  >
                    General Proposal
                  </Button>
                  <Button
                    onClick={() =>
                      navigate("/mfs/dao/fincube/approval-proposal")
                    }
                    className="my-2 w-60 hover:bg-orange-400"
                  >
                    New Member Approval Proposal
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </Card>
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setToggle(0);
                setFilterToggle(false);
              }}
              className={`${
                toggle == 0 ? "border-4 border-orange-600" : "bg-gray-400"
              }`}
            >
              All proposals
            </Button>
            <Button
              onClick={() => {
                setToggle(1);
                setFilterToggle(false);
              }}
              className={`${
                toggle == 1 ? "border-4 border-orange-600" : "bg-gray-400"
              }`}
            >
              Ongoing proposals
            </Button>
            <Button
              onClick={() => {
                setToggle(2);
                setFilterToggle(false);
              }}
              className={`${
                toggle == 2 ? "border-4 border-orange-600" : "bg-gray-400"
              }`}
            >
              Off-chain records
            </Button>
          </div>
          {toggle === 2 && (
            <Select value={filterStatus} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-[120px]">
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
          )}
        </div>
        {pageLoading && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            {/* <div className="animate-spin border-4 border-t-transparent rounded-full w-10 h-10"></div> */}
            <Loader />
          </div>
        )}
        {loading ? (
          <p className="text-3xl text-center font-bold border border-white py-10 m-10 rounded-xl">
            <Loader />
          </p>
        ) : toggle === 0 ? (
          proposalsByPage?.length === 0 ? (
            <p className="text-3xl text-center font-bold border border-white py-10 m-10 rounded-xl">
              No proposals found
            </p>
          ) : (
            proposalsByPage?.map((proposal, idx) => (
              <ProposalCard
                key={idx}
                proposal={proposal}
                proposalId={proposal.proposalId}
              />
            ))
          )
        ) : toggle === 1 ? (
          ongoingProposals?.length === 0 ? (
            <p className="text-3xl text-center font-bold border border-white py-10 m-10 rounded-xl">
              No ongoing proposals found
            </p>
          ) : (
            ongoingProposals?.map((proposal, idx) => (
              <OngoingProposalCard
                key={idx}
                proposal={proposal}
                proposalId={proposal.proposalId}
              />
            ))
          )
        ) : proposalsFromBE?.length === 0 ? (
          <p className="text-3xl text-center font-bold border border-white py-10 m-10 rounded-xl">
            No proposals found on the Backend
          </p>
        ) : !filterToggle ? (
          proposalsFromBE?.map((proposal, idx) => (
            <OffchainCard
              key={idx}
              proposal={proposal}
              proposalId={proposal.id}
            />
          ))
        ) : (
          filterToggle &&
          filtered?.map((proposal, idx) => (
            <OffchainCard
              key={idx}
              proposal={proposal}
              proposalId={proposal.id}
            />
          ))
        )}
        {!filterToggle && (
          <Pagination className="my-5">
            {toggle === 0 ? (
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={handleOnchainPrevPage}
                    className={`${
                      onchainPageNumber === proposalCount &&
                      "pointer-events-none opacity-50"
                    } cursor-pointer`}
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    onClick={handleOnchainNextPage}
                    className={`${
                      proposalsPerPage < 5 && "pointer-events-none opacity-50"
                    } cursor-pointer`}
                  />
                </PaginationItem>
              </PaginationContent>
            ) : (
              toggle === 2 && (
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      className={`${
                        offchainPage === 1 && "pointer-events-none opacity-50"
                      } cursor-pointer`}
                      onClick={() => {
                        setPageLoading(true);
                        setOffchainPage((prev) => Math.max(1, prev - 1));
                      }}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (pageNum) => (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          className={`cursor-pointer ${
                            offchainPage === pageNum
                              ? "border-2 border-green-400"
                              : ""
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            setPageLoading(true);
                            setOffchainPage(pageNum);
                          }}
                          isActive={offchainPage === pageNum}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}
                  <PaginationItem>
                    <PaginationNext
                      className={`${
                        offchainPage === totalPages &&
                        "pointer-events-none opacity-50"
                      } cursor-pointer`}
                      onClick={() => {
                        setPageLoading(true);
                        setOffchainPage((prev) =>
                          Math.min(totalPages, prev + 1)
                        );
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              )
            )}
          </Pagination>
        )}
      </div>
    </div>
  );
}
