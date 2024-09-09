import { useState } from "react";
import VotingProgressBar from "./VotingProgressBar";
import { Button } from "@components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function VotingBreakdown({ proposalId }: any) {
  const [vote, setVote] = useState<boolean | null>(null);

  const handleVote = (value: boolean) => {
    setVote(value);
    toast.success(
      `You voted ${value ? "YES" : "NO"} for proposal ID: ${proposalId}`
    );
    console.log(vote);
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
                Cast your vote
              </DialogTitle>
            </DialogHeader>
            <div className="flex justify-center mt-4">
              <Button
                className="bg-green-400 font-bold mx-4"
                onClick={() => handleVote(true)}
              >
                YES
              </Button>
              <Button
                className="bg-red-400 font-bold mx-4"
                onClick={() => handleVote(false)}
              >
                NO
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
