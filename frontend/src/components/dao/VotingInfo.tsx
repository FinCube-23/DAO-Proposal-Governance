import { Badge } from "@components/ui/badge";

export default function VotingInfo({ proposal }: any) {
  const convertStatusToVariant = (status: boolean) => {
    return status ? "success" : "warning";
  };

  return (
    <>
      <div className="flex flex-col">
        <div className="flex flex-col gap-1">
          <div className="text-xl font-semibold">Off-chain Details</div>
          <div className="flex justify-between">
            <div className="text-muted-foreground">Audit ID</div>
            {proposal.audit_id ? (
              <div className="font-bold">{proposal.audit_id}</div>
            ) : (
              <div className="text-red-600">N/A</div>
            )}
          </div>
          <div className="flex justify-between">
            <div className="text-muted-foreground">Created At</div>
            <div className="flex items-center gap-1 font-bold">
              {new Date(proposal.created_at).toLocaleString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
          <div className="flex justify-between">
            <div className="text-muted-foreground">Updated At</div>
            <div className="flex items-center gap-1 font-bold">
              {new Date(proposal.updated_at).toLocaleString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        </div>
      </div>
      <hr className="my-3" />
      <div className="flex flex-col">
        <div className="flex flex-col gap-1">
          <div className="text-xl font-semibold">On-chain Details</div>
          <div className="flex justify-between">
            <div className="text-muted-foreground">On-chain ID</div>
            {proposal.proposal_onchain_id ? (
              <div className="font-bold">{proposal.proposal_onchain_id}</div>
            ) : (
              <div className="text-red-600 font-bold">N/A</div>
            )}
          </div>
          <div className="flex justify-between">
            <div className="text-muted-foreground">Proposal Type</div>
            <div className="font-bold">{proposal.proposal_type}</div>
          </div>
          <div className="flex justify-between">
            <div className="text-muted-foreground">Processed By</div>
            {proposal.processed_by ? (
              <div className="font-bold">{proposal.processed_by}</div>
            ) : (
              <div className="text-red-600 font-bold">N/A</div>
            )}
          </div>
        </div>
      </div>
      <hr className="my-3" />
      <div className="flex flex-col">
        <div className="flex flex-col gap-1">
          <div className="text-xl font-semibold">Transaction Details</div>
          <div className="flex justify-between">
            <div className="text-muted-foreground">Transaction Status</div>
            <Badge variant={convertStatusToVariant(proposal.trx_status)}>
              <p className="capitalize">
                {proposal.trx_status ? "Confirmed" : "Pending"}
              </p>
            </Badge>
          </div>
          <div className="flex justify-between">
            <div className="text-muted-foreground">Transaction Hash</div>
            <a
              target="_"
              href={`${import.meta.env.VITE_TRX_EXPLORER}${proposal.trx_hash}`}
              className="text-green-600 hover:underline"
            >
              {proposal.trx_hash && (
                <div className="font-bold">
                  {proposal.trx_hash.slice(0, 21)}.....
                  {proposal.trx_hash.slice(21, 42)}{" "}
                </div>
              )}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
