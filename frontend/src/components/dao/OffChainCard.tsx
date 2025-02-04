import { Badge } from "@components/ui/badge";
import { Card, CardHeader, CardFooter } from "@components/ui/card";
import { useNavigate } from "react-router";

const convertStatusToVariant = (status: string) => {
  return status !== "pending" ? "success" : "warning";
};

export default function OffchainCard({ proposal, proposalId }: any) {
  const navigate = useNavigate();

  return (
    <Card
      className="hover:border-green-500 cursor-pointer"
      onClick={() => navigate(`/mfs/dao/fincube/off-chain-proposals/${proposalId}`)}
    >
      <CardHeader>
        <div className="flex justify-between mb-2">
          <Badge variant="secondary">Off-chain</Badge>
          <Badge variant={convertStatusToVariant(proposal.proposal_status)}>
            <p className="capitalize">
              {proposal.proposal_status !== "pending" ? "Confirmed" : "Pending"}
            </p>
          </Badge>
        </div>
        <div className="font-bold text-2xl">Proposal ID: {proposal.id}</div>
        <div className="font-bold text-lg">
          Proposal Type:{" "}
          <span className="italic">{proposal.proposal_type}</span>
        </div>
      </CardHeader>

      <CardFooter>
        <div className="flex gap-1 text-sm">
          <div className="text-muted-foreground">Published by</div>
          <a
            target="_"
            href={`${import.meta.env.VITE_ADDRESS_EXPLORER}${
              proposal.proposer_address
            }`}
            className="text-green-500 hover:underline cursor-pointer"
          >
            <p className="overflow-tranc">{proposal.proposer_address}</p>
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}
