import { Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { env } from "@/core/env";
import { Card, CardFooter, CardHeader } from "@/shared/components/ui/card";

export default function ProposalViewCard({ proposal }: any) {
  const [votingStatus, setVotingStatus] = useState("Voting not started");
  const [votingDelay] = useState(proposal.voteStart);
  const [votingPeriod] = useState(proposal.voteDuration);
  const [timeLeft, setTimeLeft] = useState(0);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs}h ${mins}m ${secs}s`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const myTime = Date.now() / 1000;

      if (myTime < Number(votingDelay)) {
        setVotingStatus("Voting not started");
        setTimeLeft(Number(votingDelay) - myTime);
      } else if (
        myTime >= Number(votingDelay) &&
        myTime < Number(votingPeriod)
      ) {
        setVotingStatus("Voting in progress");
        setTimeLeft(Number(votingPeriod) - myTime);
      } else if (myTime >= Number(votingPeriod)) {
        setVotingStatus("Voting has ended");
        setTimeLeft(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [votingDelay, votingPeriod]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="min-w-0">
        <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-2 mb-2">
          <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-slate-500/20 border-slate-500/20 text-slate-400 border whitespace-nowrap w-fit">
            <span>On-chain</span>
          </div>
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              proposal.canceled
                ? "bg-red-500/20 border-red-500/20 text-red-400"
                : "bg-yellow-500/20 border-yellow-500/20 text-yellow-400"
            } border whitespace-nowrap w-fit`}
          >
            <span className="capitalize">
              {proposal.canceled ? "Canceled" : "Pending"}
            </span>
          </div>
        </div>
        {votingStatus !== "Voting not started" ? (
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-end">
            {!proposal.canceled && (
              <>
                <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 border-blue-500/20 text-blue-400 border whitespace-nowrap">
                  <span>{votingStatus}</span>
                </div>
                {votingStatus !== "Voting has ended" && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 border-purple-500/20 text-purple-400 border whitespace-nowrap">
                    <span>{formatTime(timeLeft)}</span>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="flex gap-2 sm:gap-3 justify-end">
            <Loader className="animate-spin w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        )}
        <div className="font-bold text-lg sm:text-xl lg:text-2xl break-words overflow-wrap-anywhere min-w-0 max-w-full">
          {proposal.proposalURI}
        </div>
      </CardHeader>
      <CardFooter>
        <div className="flex flex-wrap gap-1 text-xs sm:text-sm">
          <div className="text-muted-foreground">Published by</div>
          <a
            target="_blank"
            href={`${env.VITE_ADDRESS_EXPLORER}/${proposal.proposer}`}
            className="text-green-500 hover:underline cursor-pointer break-all"
          >
            <p className="overflow-truncate">{proposal.proposer}</p>
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}
