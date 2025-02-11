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
import { useLazyGetProposalsQuery } from "@redux/services/proposal";
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

export default function DaoDashboard() {
  const [proposalsByPage, setProposalsByPage] = useState<IProposal[]>();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [daoURI, setDaoURI] = useState<IDaoInfo>();

  const [ongoingProposalCount, setOngoingProposalCount] = useState("");
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

  const getVotingPeriod = async () => {
    try {
      const response: any = await readContract(config, {
        abi: contractABI,
        address: import.meta.env.VITE_SMART_CONTRACT_ADDRESS,
        functionName: "votingPeriod",
      });
      const result = response.toString();

      console.log(result);
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

      console.log(result);
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

  const getOngoingProposalCount = async () => {
    try {
      const response: any = await readContract(config, {
        abi: contractABI,
        address: import.meta.env.VITE_SMART_CONTRACT_ADDRESS,
        functionName: "getOngoingProposalsCount",
      });
      const result = response.toString();
      setOngoingProposalCount(result);
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

      console.log(result);
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
        console.log("DaoURI", parsedObj.name);
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
          args: [page, page + 5],
        });

        const filteredProposals = response[0].filter(
          (proposal: any) =>
            proposal.proposer !== "0x0000000000000000000000000000000000000000"
        );

        setProposalsPerPage(filteredProposals.length);
        setProposalsByPage(filteredProposals);
        console.log(filteredProposals);

        setPageLoading(false);
      } catch (e) {
        console.log(e);
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
      console.log(response);

      setTotalPages(Math.ceil(response.total / response.limit));
    };

    getProposalsByPage(onchainPageNumber);
    fetchOngoingProposals();
    getProposalsFromBE();
    getOngoingProposalCount();
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
    setOnchainPageNumber((prevPage) => prevPage + 5);
  };

  const handleOnchainPrevPage = () => {
    if (onchainPageNumber > 0) {
      setPageLoading(true);
      setOnchainPageNumber((prevPage) => prevPage - 5);
    }
  };

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
                  : `Ongoing proposals: ${ongoingProposalCount}`}
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
        <div className="flex gap-2">
          <Button
            onClick={() => setToggle(0)}
            className={`${
              toggle == 0 ? "border-4 border-orange-600" : "bg-gray-400"
            }`}
          >
            All proposals
          </Button>
          <Button
            onClick={() => setToggle(1)}
            className={`${
              toggle == 1 ? "border-4 border-orange-600" : "bg-gray-400"
            }`}
          >
            Ongoing proposals
          </Button>
          <Button
            onClick={() => setToggle(2)}
            className={`${
              toggle == 2 ? "border-4 border-orange-600" : "bg-gray-400"
            }`}
          >
            Off-chain records
          </Button>
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
        ) : (
          proposalsFromBE?.map((proposal, idx) => (
            <OffchainCard
              key={idx}
              proposal={proposal}
              proposalId={proposal.id}
            />
          ))
        )}
        <Pagination className="my-5">
          {toggle === 0 ? (
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={handleOnchainPrevPage}
                  className={`${
                    onchainPageNumber === 0 && "pointer-events-none opacity-50"
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
          ) : toggle === 2 ? (
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
                      className="cursor-pointer"
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
                    setOffchainPage((prev) => Math.min(totalPages, prev + 1));
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          ) : (
            <></>
          )}
        </Pagination>
      </div>
    </div>
  );
}
