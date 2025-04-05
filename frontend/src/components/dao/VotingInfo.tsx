import { Badge } from "@components/ui/badge";
import {
  useCancelProposalMutation,
  useExecuteProposalMutation,
} from "@redux/services/proposal";
import {
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from "@wagmi/core";
import { useState } from "react";
import contractABI from "../../contractABI/contractABI.json";
import { config } from "../../main";
import { toast } from "sonner";
import { Button } from "@components/ui/button";
import { useNavigate } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@components/ui/dialog";

export default function VotingInfo({ proposal }: any) {
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [executeProposal] = useExecuteProposalMutation();
  const [executeDialogOpen, setExecuteDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelProposal] = useCancelProposalMutation();
  const navigate = useNavigate();
  const convertStatusToVariant = (status: boolean) => {
    return status ? "success" : "warning";
  };

  const execute = async () => {
    setLoadingStatus(true);
    try {
      const { request } = await simulateContract(config, {
        abi: contractABI,
        address: import.meta.env.VITE_SMART_CONTRACT_ADDRESS,
        functionName: "executeProposal",
        args: [proposal.proposal_onchain_id],
      });
      const hash = await writeContract(config, request);

      setExecuteDialogOpen(true);

      await executeProposal({
        proposalId: Number(proposal.proposal_onchain_id),
        transactionHash: hash,
      });

      await waitForTransactionReceipt(config, { hash });

      toast.success("Proposal executed successfully");
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
      console.log(e);
      toast.error(errorMessage);
    }
    setLoadingStatus(false);
  };

  const cancel = async () => {
    setLoadingStatus(true);
    try {
      const { request } = await simulateContract(config, {
        abi: contractABI,
        address: import.meta.env.VITE_SMART_CONTRACT_ADDRESS,
        functionName: "cancelProposal",
        args: [proposal.proposal_onchain_id],
      });
      const hash = await writeContract(config, request);

      setCancelDialogOpen(true);

      await cancelProposal({
        proposalId: proposal.proposal_onchain_id,
        transactionHash: hash,
      });

      await waitForTransactionReceipt(config, { hash });

      toast.success("Proposal cancelled");
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
    setLoadingStatus(false);
  };

  return (
    <>
      <div className="flex flex-col">
        <div className="flex flex-col gap-1">
          <div className="text-xl font-semibold">Off-chain Details</div>
          <div className="flex justify-between">
            <div className="text-muted-foreground">Audit ID</div>
            {proposal.audit_id !== null ? (
              <div
                onClick={() =>
                  navigate(
                    `/organization/dao/fincube/off-chain-proposals/${proposal.audit_id}/transaction`
                  )
                }
                className="font-bold underline cursor-pointer text-blue-400"
              >
                {proposal.audit_id}
              </div>
            ) : (
              <div className="text-red-600 font-bold">N/A</div>
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
            {proposal.proposal_onchain_id !== null ? (
              <div
                onClick={() =>
                  navigate(
                    `/organization/dao/fincube/proposals/${proposal.proposal_onchain_id}`
                  )
                }
                className="font-bold underline cursor-pointer text-blue-400"
              >
                {proposal.proposal_onchain_id}
              </div>
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
          {proposal.proposal_onchain_id !== null && (
            <div className="flex justify-between items-center mt-10">
              <div className="text-xl">Action:</div>
              <div>
                <Button
                  isLoading={loadingStatus}
                  onClick={execute}
                  className="bg-blue-400 hover:bg-blue-500 font-bold mt-2 mx-2 text-white"
                >
                  Execute
                </Button>
                <Button
                  isLoading={loadingStatus}
                  onClick={cancel}
                  className="bg-red-400 hover:bg-red-500 font-bold mt-2 mx-2 text-white"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
        <Dialog
          open={executeDialogOpen}
          onOpenChange={(open) => {
            setExecuteDialogOpen(open);
            if (!open) navigate("/organization/dao/fincube");
          }}
        >
          <DialogContent>
            <DialogHeader>
              <h2 className="text-lg font-bold text-green-400">Vote casted</h2>
            </DialogHeader>
            <p className="text-center text-yellow-400">
              Proposal execution is now under process.
            </p>
            <DialogFooter>
              <Button
                className="bg-blue-600 font-bold hover:bg-blue-700 text-white"
                onClick={() => navigate("/organization/dao/fincube")}
              >
                Back to Dashboard
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog
          open={cancelDialogOpen}
          onOpenChange={(open) => {
            setCancelDialogOpen(open);
            if (!open) navigate("/organization/dao/fincube");
          }}
        >
          <DialogContent>
            <DialogHeader>
              <h2 className="text-lg font-bold text-green-400">Vote casted</h2>
            </DialogHeader>
            <p className="text-center text-yellow-400">
              Proposal cancellation is now under process.
            </p>
            <DialogFooter>
              <Button
                className="bg-blue-600 font-bold hover:bg-blue-700 text-white"
                onClick={() => navigate("/organization/dao/fincube")}
              >
                Back to Dashboard
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
