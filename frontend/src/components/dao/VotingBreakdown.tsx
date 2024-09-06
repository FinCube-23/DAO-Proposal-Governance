import React, { useState } from "react";
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
  const [hasVoted, setHasVoted] = useState(false);

  const handleVote = () => {
    setHasVoted(true);
    toast.success(`Voter with ID: ${proposalId} voted successfully!`);
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
        {!hasVoted && (
          <Button className="bg-green-400 font-bold" onClick={handleVote}>
            Vote
          </Button>
        )}
      </div>
      {hasVoted && (
        <Dialog>
          <DialogTrigger asChild>
            <div className="flex justify-end">
              <Button className="bg-blue-400">Execute</Button>
            </div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-green-400">
                Vote casted successfully!
              </DialogTitle>
              <DialogDescription>
                Transaction Hash:{" "}
                <span className="text-orange-400">
                  0xa01358717730026c0f0a30f...c810bf6511c7f2e1a8e9f955e
                </span>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
