import { Badge } from "@components/ui/badge";
import { Card, CardHeader, CardFooter } from "@components/ui/card";
import { useNavigate } from "react-router-dom";

// interface Props {
//   proposal: Proposal;
//   showStatus?: boolean;
// }

const convertStatusToVariant = (status: boolean) => {
  return status ? "success" : "warning";
};

export default function ProposalCard({ proposal, proposalId }: any) {
  const navigate = useNavigate();
  return (
    <>
      {proposal.proposal_type === "membership" ? (
        <Card
          className="hover:border-green-500 cursor-pointer"
          onClick={() => navigate(`/dashboard/proposals/${proposalId}`)}
        >
          <CardHeader>
            <div className="flex justify-end mb-2">
              <Badge variant={convertStatusToVariant(proposal.executed)}>
                <p className="capitalize">
                  {proposal.executed ? "Confirmed" : "Pending"}
                </p>
              </Badge>
            </div>
            <div className="font-bold text-2xl">{proposal.proposalURI}</div>
            <a
              target="_"
              href={`https://amoy.polygonscan.com/address/${proposal.data}`}
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
                href={`https://amoy.polygonscan.com/address/${proposal.proposer}`}
                className="text-green-500 hover:underline cursor-pointer"
              >
                <p className="overflow-tranc">{proposal.proposer}</p>
              </a>
            </div>
          </CardFooter>
        </Card>
      ) : (
        <Card
          className="hover:border-green-500 cursor-pointer"
          onClick={() => navigate(`/dashboard/proposals/${proposalId}`)}
        >
          <CardHeader>
            <div className="flex justify-end mb-2">
              <Badge variant={convertStatusToVariant(proposal.executed)}>
                <p className="capitalize">
                  {proposal.executed ? "Confirmed" : "Pending"}
                </p>
              </Badge>
            </div>
            <div className="font-bold text-2xl">{proposal.proposalURI}</div>
            <a
              target="_"
              href={`https://amoy.polygonscan.com/address/${proposal.data}`}
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
                href={`https://amoy.polygonscan.com/address/${proposal.proposer}`}
                className="text-green-500 hover:underline cursor-pointer"
              >
                <p className="overflow-tranc">{proposal.proposer}</p>
              </a>
            </div>
          </CardFooter>
        </Card>
      )}
    </>
  );
}
