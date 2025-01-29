import { Badge } from "@components/ui/badge";
import { Card, CardHeader, CardFooter } from "@components/ui/card";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const convertStatusToVariant = (status: boolean) => {
  return status ? "success" : "warning";
};

export default function OngoingProposalCard({ proposal, proposalId }: any) {
  const navigate = useNavigate();
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
    <Card
      className="hover:border-green-500 cursor-pointer"
      onClick={() => navigate(`/dashboard/ongoing-proposals/${proposalId}`)}
    >
      <CardHeader>
        <div className="flex justify-between mb-2">
          <Badge variant="secondary">On-chain</Badge>
          <Badge variant={convertStatusToVariant(proposal.executed)}>
            <p className="capitalize">
              {proposal.executed ? "Confirmed" : "Pending"}
            </p>
          </Badge>
        </div>
        <div className="flex gap-3 justify-end">
          {votingStatus !== "Voting not started" ? (
            <div className="flex gap-3 justify-end">
              <Badge variant="outline">{votingStatus}</Badge>
              {votingStatus !== "Voting has ended" && (
                <>
                  <Badge variant="outline">{formatTime(timeLeft)}</Badge>
                </>
              )}
            </div>
          ) : (
            <div className="flex gap-3 justify-end">
              <Loader className="animate-spin"></Loader>
            </div>
          )}
        </div>
        <div className="font-bold text-2xl">{proposal.proposalURI}</div>
        <a
          target="_"
          href={`${import.meta.env.VITE_ADDRESS_EXPLORER}${proposal.data}`}
          className="text-muted-foreground hover:underline"
        >
          {proposal.data.slice(0, 42)}
        </a>
      </CardHeader>
      <CardFooter>
        <div className="flex gap-1 text-sm">
          <div className="text-muted-foreground">Published by</div>
          <a
            target="_"
            href={`${import.meta.env.VITE_ADDRESS_EXPLORER}${
              proposal.proposer
            }`}
            className="text-green-500 hover:underline cursor-pointer"
          >
            <p className="overflow-tranc">{proposal.proposer}</p>
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}
