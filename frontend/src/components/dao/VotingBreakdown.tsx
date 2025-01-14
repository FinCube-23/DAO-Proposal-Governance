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

export default function VotingBreakdown({ proposalId }: any) {
  const voteRef = useRef({ proposalId: "", support: false });
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

  const castVote = async (value: boolean) => {
    voteRef.current = { proposalId, support: value };
    try {
      const { request } = await simulateContract(config, {
        abi: contractABI,
        address: "0xc72941fDf612417EeF0b8A29914744ad5f02f83F",
        functionName: "registerMember",
        args: [voteRef.current.proposalId, voteRef.current.support],
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
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    const getProposal = async () => {
      try {
        const response: any = await readContract(config, {
          abi: contractABI,
          address: "0xc72941fDf612417EeF0b8A29914744ad5f02f83F",
          functionName: "getProposalsByPage",
          args: [0, 10],
        });

        const result = response[0].find(
          (proposal: Proposal) => proposal.proposer === proposalId
        );

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
            </span>{" "}
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
            <div className="flex justify-center mt-4">
              <Button
                className="bg-green-400 font-bold mx-4"
                onClick={() => castVote(true)}
              >
                SUPPORT
              </Button>
              <Button
                className="bg-red-400 font-bold mx-4"
                onClick={() => castVote(false)}
              >
                AGAINST
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
