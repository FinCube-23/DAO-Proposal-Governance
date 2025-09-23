import type { ChangeEvent, FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { simulateContract, writeContract } from "@wagmi/core";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { config } from "@/core/config";
import contractABI from "@/core/contract/contract-abi.json";
import { env } from "@/core/env";
import type { ProposalOnchainVerificationPayload } from "@/core/services/proposal/types";
import { proposalApis } from "@/core/services/proposal";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/shared/components/ui/dialog";

export default function MemberProposal() {
  const [data, setData] = useState({
    _newMember: "",
    description: "",
  });
  const { address } = useAccount();
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [trxHash, setTrxHash] = useState("");
  const navigate = useNavigate();

  const createProposal = useMutation({
    mutationFn: proposalApis.createProposal,
  });

  const createOnchainVerification = useMutation({
    mutationFn: proposalApis.createOnchainVerification,
  });

  const handleInput = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const approveMember = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoadingStatus(true);

    try {
      const { request } = await simulateContract(config, {
        abi: contractABI,
        address: env.VITE_SMART_CONTRACT_ADDRESS as `0x${string}`,
        functionName: "newMemberApprovalProposal",
        args: [data._newMember, data.description],
      });

      const hash = await writeContract(config, request);

      const backendData = {
        proposal_type: "membership",
        metadata: data.description,
        proposer_address: `0x${address}`,
        trx_hash: hash,
      };

      const userData: ProposalOnchainVerificationPayload = {
        trx_hash: hash,
        context: "Membership Proposal",
        proposer_wallet: `0x${address}`,
        organization_id: null,
      };

      try {
        // First create the proposal
        await createProposal.mutateAsync(backendData);

        // Then create onchain verification - if this fails, log the error but don't fail silently
        try {
          await createOnchainVerification.mutateAsync(userData);
          toast.success("Proposal submitted and verified onchain successfully");
          setDialogOpen(true);
          setTrxHash(hash);
        } catch (verificationError: any) {
          console.error("Onchain verification failed:", verificationError);
          toast.error(
            `Proposal created but onchain verification failed: ${verificationError.message}`
          );
          // Still show dialog since proposal was created successfully
          setDialogOpen(true);
          setTrxHash(hash);
        }
      } catch (proposalError: any) {
        console.error("Proposal creation failed:", proposalError);
        toast.error(`Failed to create proposal: ${proposalError.message}`);
      }
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
      console.error("Smart contract error:", e);
      toast.error(errorMessage);
    }
    setLoadingStatus(false);
  };

  return (
    <div className="container mt-20">
      <div className="mt-10">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          New Member Approval Proposal
        </h1>
        <form
          onSubmit={approveMember}
          className="w-1/3 mx-auto space-y-6 border border-gray-600 p-6 rounded-xl"
        >
          <p>New Member Address: </p>
          <input
            className="w-full p-3 mt-2 bg-black border border-gray-600 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
            type="text"
            name="_newMember"
            onChange={handleInput}
            placeholder="Enter address"
            required
          />
          <p>Description: </p>
          <textarea
            className="w-full p-3 mt-2 bg-black border border-gray-600 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
            name="description"
            onChange={handleInput}
            placeholder="Enter description"
            rows={10}
            required
          ></textarea>
          <div className="flex justify-center">
            <Button type="submit" isLoading={loadingStatus}>
              Place Proposal
            </Button>
          </div>
        </form>
      </div>
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) navigate("/organization/dao/proposals");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <h2 className="text-lg font-bold text-green-400">
              Proposal Submitted
            </h2>
          </DialogHeader>
          <p className="text-yellow-400">
            Your proposal has been successfully submitted and is under review.
            To check the transaction status,{" "}
            <a
              target="_"
              href={`${env.VITE_TRX_EXPLORER}/${trxHash}`}
              className="text-blue-400 underline"
            >
              click here
            </a>
          </p>
          <DialogFooter>
            <Button
              className="bg-blue-600 font-bold hover:bg-blue-700 text-white"
              onClick={() => navigate("/organization/dao/proposals")}
            >
              Back to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
