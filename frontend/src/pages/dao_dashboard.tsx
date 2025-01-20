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
  Coins,
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  readContract,
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from "@wagmi/core";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import contractABI from "../contractABI/contractABI.json";
import { useAccount } from "wagmi";
import { config } from "@layouts/RootLayout";
import { toast } from "sonner";
import WalletAuth from "@components/auth/WalletAuth";
import { useLazyGetProposalQuery } from "@redux/services/proposal";
import Loader from "@components/Loader";
// import {
//   useLazyGetOngoingProposalsQuery,
//   useRegisterMemberMutation,
// } from "@redux/services/proxy";

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
  const account = useAccount();
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
  const [ongoingProposalCount, setOngoingProposalCount] = useState("");
  const [ongoingProposals, setOngoingProposals] = useState<Proposal[]>([]);
  const [toggle, setToggle] = useState(false);
  const [version, setVersion] = useState("");
  const [pageNumber, setPageNumber] = useState(0);
  const [votingPeriod, setVotingPeriod] = useState("");
  const [votingDelay, setVotingDelay] = useState("");
  // const [registerMember] = useRegisterMemberMutation();
  // const [getOngoingProposals] = useLazyGetOngoingProposalsQuery();
  const [pageLoading, setPageLoading] = useState(false);
  const [proposalsPerPage, setProposalsPerPage] = useState(0);
  const [getProposal] = useLazyGetProposalQuery();
  const [isMemberApproved, setIsMemberApproved] = useState(false);
  const { isConnected, address } = useAccount();
  const [votingStatus, setVotingStatus] = useState("Voting not started");
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [timeLeft, setTimeLeft] = useState("");

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  };

  useEffect(() => {
    const checkTime = () => {
      const currentTime = Math.floor(Date.now() / 1000);
      const remainingTime = Number(votingPeriod) - currentTime;

      if (currentTime < Number(votingDelay)) {
        setVotingStatus("Voting not started");
        setTimeLeft(formatTime(Number(votingDelay) - currentTime));
      } else if (
        currentTime >= Number(votingDelay) &&
        currentTime < Number(votingPeriod)
      ) {
        setVotingStatus("Voting in progress");
        setVotingStatus(formatTime(remainingTime));
      } else {
        setVotingStatus("Voting ended");
        setTimeLeft("");
      }
    };

    const interval = setInterval(checkTime, 1000);

    return () => clearInterval(interval);
  }, [votingDelay, votingPeriod]);

  const handleRegistrationInput = (e: ChangeEvent<HTMLInputElement>) => {
    const form = e.target;
    const name = form.name;
    const value = form.value;
    setRegistrationData({
      ...registrationData,
      _newMember: `${account.address}`,
      [name]: value,
    });
  };

  const getVotingPeriod = async () => {
    try {
      const response: any = await readContract(config, {
        abi: contractABI,
        address: "0xc72941fDf612417EeF0b8A29914744ad5f02f83F",
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
        address: "0xc72941fDf612417EeF0b8A29914744ad5f02f83F",
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
        address: "0xc72941fDf612417EeF0b8A29914744ad5f02f83F",
        functionName: "getOngoingProposals",
      });
      console.log(response);
      // await getOngoingProposals();

      setOngoingProposals(response);
    } catch (e) {
      console.error(e);
    }
  };

  const getOngoingProposalCount = async () => {
    try {
      const response: any = await readContract(config, {
        abi: contractABI,
        address: "0xc72941fDf612417EeF0b8A29914744ad5f02f83F",
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
        address: "0xc72941fDf612417EeF0b8A29914744ad5f02f83F",
        functionName: "UPGRADE_INTERFACE_VERSION",
      });
      const result = response.toString();

      console.log(result);
      setVersion(result);
    } catch (e) {
      console.error(e);
    }
  };

  const register = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const { request } = await simulateContract(config, {
        abi: contractABI,
        address: "0xc72941fDf612417EeF0b8A29914744ad5f02f83F",
        functionName: "registerMember",
        args: [registrationData._newMember, registrationData._memberURI],
      });

      const hash = await writeContract(config, request);

      await waitForTransactionReceipt(config, { hash });

      // await registerMember({
      //   id: Number(registrationData._newMember),
      //   name: registrationData._memberURI,
      // });

      toast.success("Registration sucessful!");
    } catch (e: any) {
      let errorMessage = e.message;

      if (errorMessage.includes("reverted with the following reason:")) {
        const match = errorMessage.match(
          /reverted with the following reason:\s*(.*)/
        );
        if (match) {
          errorMessage = match[1];
        }
      }
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    const getDAOInfo = async () => {
      try {
        const response: any = await readContract(config, {
          abi: contractABI,
          address: "0xc72941fDf612417EeF0b8A29914744ad5f02f83F",
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
          address: "0xc72941fDf612417EeF0b8A29914744ad5f02f83F",
          functionName: "getProposalsByPage",
          args: [page, page + 3],
        });

        const filteredProposals = response[0].filter(
          (proposal: any) =>
            proposal.proposer !== "0x0000000000000000000000000000000000000000"
        );

        setProposalsPerPage(filteredProposals.length);
        setProposalsByPage(filteredProposals);
        setPageLoading(false);

        // const proposalsFromBE = await getProposal();
        // console.log(proposalsFromBE);
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
          address: "0xc72941fDf612417EeF0b8A29914744ad5f02f83F",
          functionName: "checkIsMemberApproved",
          args: [address],
        });

        console.log(response);
        setIsMemberApproved(true);
      } catch (e) {
        console.error(e);
      }
    };
    if (isConnected) {
      checkIsMemberApproved();
    }

    getProposalsByPage(pageNumber);
    fetchOngoingProposals();
    getOngoingProposalCount();
    getDAOInfo();
    getVersion();
    getVotingDelay();
    getVotingPeriod();
    checkIsMemberApproved();
    setLoading(false);
  }, [pageNumber, getProposal, address, isConnected]);

  const handleNextPage = () => {
    setPageLoading(true);
    setPageNumber((prevPage) => prevPage + 3);
    console.log(pageNumber);
  };

  const handlePrevPage = () => {
    if (pageNumber > 0) {
      setPageLoading(true);
      setPageNumber((prevPage) => prevPage - 3);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <WalletAuth></WalletAuth>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl hover:underline">
            <a href={`${daoURI["@context"]}`} target="_">
              {daoURI.name}
            </a>
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
            <div className="flex gap-3">
              <div className="flex gap-1 border-2 border-blue-600 rounded-xl font-bold px-2 py-2 text-xl">
                {/* Voting Period: {votingPeriod} second(s) */}
                Voting Status: {votingStatus}
              </div>
              {votingStatus !== "Voting ended" && (
                <div className="flex gap-1 border-2 border-orange-600 rounded-xl font-bold px-2 py-2 text-xl">
                  {/* Voting Delay: {votingDelay} second(s) */}
                  Time Left: {timeLeft}
                </div>
              )}
            </div>
          </div>
        </CardFooter>
      </Card>
      <div className="flex items-center gap-2 border border-red-500 text-white font-bold text-sm text-center p-2 rounded-xl">
        <Info />{" "}
        <p>
          You are not an approved member to place a new proposal or register a
          new member
        </p>
      </div>
      <div className="flex flex-col-reverse md:grid md:grid-cols-12 gap-5">
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
          <div className="flex">
            <Button
              onClick={() => setToggle(false)}
              className={`${!toggle && "border-4 border-orange-600"} mr-2`}
            >
              All proposals
            </Button>
            <Button
              onClick={() => setToggle(true)}
              className={`${toggle && "border-4 border-orange-600"}`}
            >
              Ongoing proposals
            </Button>
          </div>
          {loading ? (
            <p className="text-3xl text-center font-bold border border-white py-10 m-10 rounded-xl">
              Loading proposals
            </p>
          ) : toggle ? (
            ongoingProposals.length === 0 ? (
              <p className="text-3xl text-center font-bold border border-white py-10 m-10 rounded-xl">
                No ongoing proposals found
              </p>
            ) : (
              ongoingProposals.map((proposal, idx) => (
                <ProposalCard
                  key={idx}
                  proposal={proposal}
                  proposalId={proposal.proposer}
                />
              ))
            )
          ) : proposalsByPage.length === 0 ? (
            <p className="text-3xl text-center font-bold border border-white py-10 m-10 rounded-xl">
              No ongoing proposals found
            </p>
          ) : (
            proposalsByPage.map((proposal, idx) => (
              <ProposalCard key={idx} proposal={proposal} proposalId={idx} />
            ))
          )}
          {/* Show loading text */}
          {pageLoading && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              {/* <div className="animate-spin border-4 border-t-transparent rounded-full w-10 h-10"></div> */}
              <Loader />
            </div>
          )}

          {!toggle && (
            <div className="flex justify-center mt-5">
              <button
                onClick={handlePrevPage}
                disabled={pageNumber === 0}
                className="p-2 m-2 bg-green-500 font-bold text-white rounded-full disabled:opacity-50"
              >
                <ArrowLeft />
              </button>
              <button
                onClick={handleNextPage}
                disabled={proposalsPerPage < 3}
                className="p-2 m-2 bg-green-500 text-white rounded-full font-bold disabled:opacity-50"
              >
                <ArrowRight />
              </button>
            </div>
          )}
        </div>
        <div className="md:col-span-5">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Coins className="text-green-500" />
                </div>
                <div className="flex flex-col">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>New Member</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle className="text-center">
                          Register Member
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={register}>
                        <div className="flex items-center my-3">
                          <p className="mr-3">Member URI: </p>
                          <input
                            onChange={handleRegistrationInput}
                            type="text"
                            name="_memberURI"
                            className="px-2 py-1 rounded bg-black border border-white"
                            placeholder="URI"
                          />
                        </div>
                        <DialogFooter>
                          <Button type="submit">Register</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl">$10,000</div>
              <div className="text-muted-foreground">Treasury value</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
