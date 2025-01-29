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
import {
  Box,
  Flag,
  Vote,
  WalletCards,
  History,
  ArrowLeft,
  ArrowRight,
  Info,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { readContract } from "@wagmi/core";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import contractABI from "../contractABI/contractABI.json";
import { useAccount } from "wagmi";
import { config } from "@layouts/RootLayout";
import { useLazyGetProposalsQuery } from "@redux/services/proposal";
import Loader from "@components/Loader";
import OffchainCard from "@components/dao/OffChainCard";
import OngoingProposalCard from "@components/dao/OngoingProposalCard";
import { Badge } from "@components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@components/ui/pagination";

export interface Proposal {
  executed: boolean;
  canceled: boolean;
  proposer: string;
  data: string;
  target: string;
  voteStart: number;
  voteDuration: number;
  yesvotes: number;
  novotes: number;
  proposalURI: string;
}

interface DaoInfo {
  "@context": string;
  name: string;
  description: string;
  membersURI: string;
  proposalsURI: string;
  activityLogURI: string;
  governanceURI: string;
  contractsURI: string;
}

export default function DaoDashboard() {
  const [registrationData, setRegistrationData] = useState({
    _newMember: "",
    _memberURI: "",
  });
  const [proposalsByPage, setProposalsByPage] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [daoURI, setDaoURI] = useState<DaoInfo>({
    "@context": "",
    name: "",
    description: "",
    membersURI: "",
    proposalsURI: "",
    activityLogURI: "",
    governanceURI: "",
    contractsURI: "",
  });
  const [proposalById, setProposalById] = useState<Proposal>({
    executed: false,
    canceled: false,
    proposer: "",
    data: "",
    target: "",
    voteStart: 0,
    voteDuration: 0,
    yesvotes: 0,
    novotes: 0,
    proposalURI: "",
  });
  const [ongoingProposalCount, setOngoingProposalCount] = useState("");
  const [ongoingProposals, setOngoingProposals] = useState<Proposal[]>([]);
  const [toggle, setToggle] = useState(0);
  const [version, setVersion] = useState("");
  const [onchainPageNumber, setOnchainPageNumber] = useState(0);
  const [votingPeriod, setVotingPeriod] = useState("");
  const [votingDelay, setVotingDelay] = useState("");
  const [pageLoading, setPageLoading] = useState(false);
  const [proposalsPerPage, setProposalsPerPage] = useState(0);
  const [getProposals] = useLazyGetProposalsQuery();
  const [isMemberApproved, setIsMemberApproved] = useState(false);
  const { isConnected, address } = useAccount();
  const [proposalsFromBE, setProposalsFromBE] = useState([]);
  const [offchainPage, setOffchainPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const getVotingPeriod = async () => {
    try {
      const response: any = await readContract(config, {
        abi: contractABI,
        address: import.meta.env.VITE_SMART_CONTRACT_ADDRESS,
        functionName: "getVotingPeriod",
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
        functionName: "getVotingDelay",
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
      console.log(response);

      setOngoingProposals(response);
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
        setPageLoading(false);
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };

    const checkIsMemberApproved = async () => {
      try {
        const response: any = await readContract(config, {
          abi: contractABI,
          address: import.meta.env.VITE_SMART_CONTRACT_ADDRESS,
          functionName: "checkIsMemberApproved",
          args: [address],
        });

        console.log(response);
        setIsMemberApproved(true);
      } catch (e) {
        console.error(e);
      }
    };

    const getProposalsFromBE = async (page: any) => {
      const { data } = await getProposals({
        pageNumber: offchainPage,
        limit: 5,
      });
      console.log(page + 1, page + 5);

      setProposalsFromBE(data?.data || []);
      setTotalPages(Math.ceil(data?.total / data?.limit));

      console.log("====================================");
      console.log("Proposal 0:", data);
      console.log("====================================");
    };
    if (isConnected) {
      checkIsMemberApproved();
    }

    getProposalsByPage(onchainPageNumber);
    fetchOngoingProposals();
    getProposalsFromBE(offchainPage);
    getOngoingProposalCount();
    getDAOInfo();
    getVersion();
    getVotingDelay();
    getVotingPeriod();
    checkIsMemberApproved();
    setLoading(false);
  }, [onchainPageNumber, getProposals, address, isConnected, offchainPage]);

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
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex justify-between items-center">
              <a
                className="text-2xl hover:underline"
                href={`${daoURI["@context"]}`}
                target="_"
              >
                {daoURI.name}
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
          <p>{daoURI.description}</p>
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
      <div className="flex items-center gap-2 border border-red-500 text-white font-bold text-sm text-center p-2 rounded-xl">
        <Info />
        <p>
          You are not an approved member to place a new proposal or register a
          new member
        </p>
      </div>
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
                    onClick={() => navigate("/general-proposal")}
                    className="my-2 w-60 hover:bg-green-400"
                  >
                    General Proposal
                  </Button>
                  <Button
                    onClick={() => navigate("/approval-proposal")}
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
        {/* Show loading text */}
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
          proposalsByPage.length === 0 ? (
            <p className="text-3xl text-center font-bold border border-white py-10 m-10 rounded-xl">
              No proposals found
            </p>
          ) : (
            proposalsByPage.map((proposal, idx) => (
              <ProposalCard key={idx} proposal={proposal} proposalId={idx} />
            ))
          )
        ) : toggle === 1 ? (
          ongoingProposals.length === 0 ? (
            <p className="text-3xl text-center font-bold border border-white py-10 m-10 rounded-xl">
              No ongoing proposals found
            </p>
          ) : (
            ongoingProposals.map((proposal, idx) => (
              <OngoingProposalCard
                key={idx}
                proposal={proposal}
                proposalId={idx}
              />
            ))
          )
        ) : proposalsFromBE.length === 0 ? (
          <p className="text-3xl text-center font-bold border border-white py-10 m-10 rounded-xl">
            No proposals found on the Backend
          </p>
        ) : (
          proposalsFromBE.map((proposal, idx) => (
            <OffchainCard
              key={idx}
              proposal={proposal}
              proposalId={proposal.id}
            />
          ))
        )}
        {/* <div className="flex justify-center mt-5">
            {toggle === 0 ? (
              <>
                <button
                  onClick={() => {
                    if (toggle === 0) handleOnchainPrevPage();
                  }}
                  disabled={onchainPageNumber === 0}
                  className="p-2 m-2 bg-green-500 font-bold text-white rounded-full disabled:opacity-50"
                >
                  <ArrowLeft />
                </button>
                <button
                  onClick={() => {
                    if (toggle === 0) handleOnchainNextPage();
                  }}
                  disabled={proposalsPerPage < 10}
                  className="p-2 m-2 bg-green-500 text-white rounded-full font-bold disabled:opacity-50"
                >
                  <ArrowRight />
                </button>
              </>
            ) : toggle === 2 ? (
              <>
                <button
                  onClick={() => {
                    setPageLoading(true);
                    setOffchainPage((prevPage) => prevPage - 1);
                  }}
                  disabled={offchainPage === 1}
                  className="p-2 m-2 bg-green-500 font-bold text-white rounded-full disabled:opacity-50"
                >
                  <ArrowLeft />
                </button>
                <button
                  onClick={() => {
                    setPageLoading(true);
                    setOffchainPage((nextPage) => nextPage + 1);
                  }}
                  disabled={proposalsFromBE.length < 10}
                  className="p-2 m-2 bg-green-500 text-white rounded-full font-bold disabled:opacity-50"
                >
                  <ArrowRight />
                </button>
              </>
            ) : (
              <></>
            )}
          </div> */}
        <Pagination>
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
