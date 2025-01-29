import { useEffect, useRef, useState } from "react";
import VotingProgressBar from "./VotingProgressBar";
import { Button } from "@components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  readContract,
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from "@wagmi/core";
import { config } from "@layouts/RootLayout";
import contractABI from "../../contractABI/contractABI.json";
import { Proposal } from "@pages/dao_dashboard";
import { useNavigate } from "react-router";

export default function VotingBreakdown({ proposalId }: any) {
  const voteRef = useRef({ proposalId: "", support: false });
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [proposal, setProposal] = useState<Proposal>({
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
  const [id, setId] = useState("");
  const navigate = useNavigate();

  const castVote = async (value: boolean) => {
    // voteRef.current = { proposalId: proposal.proposer, support: value };
    setLoadingStatus(true);
    voteRef.current = { proposalId: id, support: value };
    try {
      const { request } = await simulateContract(config, {
        abi: contractABI,
        address: import.meta.env.VITE_SMART_CONTRACT_ADDRESS,
        functionName: "castVote",
        args: [Number(voteRef.current.proposalId), voteRef.current.support],
      });
      const hash = await writeContract(config, request);

      await waitForTransactionReceipt(config, { hash });

      toast.success(
        `You voted ${
          value ? "SUPPORT" : "AGAINST"
        } for proposal ID: ${proposalId}`
      );
      console.log(voteRef.current);
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
      console.log("====================================");
      console.log(e);
      console.log("====================================");
      toast.error(errorMessage);
    }
    setLoadingStatus(false);
    navigate("/mfs/dao/fincube");
  };

  // const executeProposal = async (value: number) => {
  //   try {
  //     const { request } = await simulateContract(config, {
  //       abi: contractABI,
  //       address: import.meta.env.VITE_SMART_CONTRACT_ADDRESS,
  //       functionName: "executeProposal",
  //       args: [value],
  //     });
  //     const hash = await writeContract(config, request);

  //     await waitForTransactionReceipt(config, { hash });

  //     toast.success("Proposal executed successfully");
  //     console.log(voteRef.current);
  //   } catch (e: any) {
  //     let errorMessage = e.message;

  //     if (errorMessage.includes("reverted with the following reason:")) {
  //       const match = errorMessage.match(
  //         /reverted with the following reason:\s*(.*)/
  //       );
  //       if (match) {
  //         errorMessage = match[1];
  //       }
  //     }
  //     console.log("====================================");
  //     console.log(e);
  //     console.log("====================================");
  //     toast.error(errorMessage);
  //   }
  // };

  useEffect(() => {
    const getProposal = async () => {
      try {
        const response: any = await readContract(config, {
          abi: contractABI,
          address: import.meta.env.VITE_SMART_CONTRACT_ADDRESS,
          functionName: "getProposalsByPage",
          args: [0, 10],
        });

        const result = response[0][proposalId];

        setProposal(result as Proposal);
        console.log(result as Proposal);
      } catch (e) {
        alert("Failer to fetch proposal information");
        console.error("Failed to fetch proposal information:", e);
      }
    };

    getProposal();
  }, [proposalId]);

  return (
    <div>
      <div className="flex justify-between">
        <div className="text-primary font-bold">Approved By</div>
        {proposal && (
          <div>
            <span className="text-primary font-bold">
              {proposal.yesvotes.toString()}
            </span>
            of {(proposal.yesvotes + proposal.novotes).toString()} Members
          </div>
        )}
      </div>
      {proposal && (
        <VotingProgressBar
          total={Number(proposal.yesvotes + proposal.novotes)}
          yes={Number(proposal.yesvotes)}
          no={Number(proposal.novotes)}
        />
      )}
      <div className="flex justify-end">
        {/* {Date.now() / 1000 > proposal.voteDuration && (
          <Button className="bg-red-400 font-bold">Execute</Button>
        )} */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-green-400 font-bold">Vote</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-center text-orange-400">
                Cast your vote?
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <div className="flex justify-center items-center gap-2 mb-4">
                <p className="font-bold">Proposal ID: </p>
                <input
                  type="text"
                  placeholder="Enter Proposal ID"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  className="px-4 py-1 border bg-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-center">
                <Button
                  isLoading={loadingStatus}
                  className="bg-green-400 font-bold mx-4"
                  onClick={() => castVote(true)}
                >
                  SUPPORT
                </Button>
                <Button
                  isLoading={loadingStatus}
                  className="bg-red-400 font-bold mx-4"
                  onClick={() => castVote(false)}
                >
                  AGAINST
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
