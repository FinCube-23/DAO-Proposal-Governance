import { Badge } from "@components/ui/badge";
import { Card, CardHeader, CardFooter } from "@components/ui/card";
import { Proposal } from "@services/proposal/types";
import { useNavigate } from "react-router-dom";

// interface Props {
//   proposal: Proposal;
//   showStatus?: boolean;
// }

const convertStatusToVariant = (status: string) => {
  switch (status) {
    case "ongoing":
      return "warning";
    case "executed":
      return "success";
    case "canceled":
      return "danger";
    default:
      return "default";
  }
};

export default function ProposalCard({ proposal, proposalId }: any) {
  const navigate = useNavigate();
  return (
    <Card
      className="hover:border-green-500 cursor-pointer"
      onClick={() => navigate(`/dashboard/proposals/${proposalId}`)}
    >
      <CardHeader>
        <div className="mb-2">
          <Badge variant={convertStatusToVariant(proposal.executed)}>
            <p className="capitalize">{proposal.executed}</p>
          </Badge>
        </div>
        <div className="font-bold text-2xl">{proposal.proposalURI}</div>
        <div className="text-muted-foreground">{proposal.data}</div>
      </CardHeader>

      <CardFooter>
        <div className="flex gap-1 text-sm">
          <div className="text-muted-foreground">Published by</div>
          <a href="#" className="text-green-500 hover:underline cursor-pointer">
            <p className="overflow-tranc">
              0xCB6F2B16a15560197342e6afa6b3A5620884265B
            </p>
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}
