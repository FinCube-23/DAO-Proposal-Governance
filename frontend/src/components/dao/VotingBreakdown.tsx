import { useRef } from "react";
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
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from "@wagmi/core";
import { config } from "@layouts/RootLayout";
import contractABI from "../../contractABI/contractABI.json";

export default function VotingBreakdown({ proposalId }: any) {
  const voteRef = useRef({ proposalId: "", support: false });

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

  return (
    <div>
      <div className="flex justify-between">
        <div className="text-primary font-bold">Approved By</div>
        <div>
          <span className="text-primary font-bold">2</span> of 4 Members
        </div>
      </div>
      <VotingProgressBar total={4} yes={2} no={1} />
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
