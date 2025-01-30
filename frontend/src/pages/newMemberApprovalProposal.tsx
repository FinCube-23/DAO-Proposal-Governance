import { ChangeEvent, FormEvent, useState } from "react";
import contractABI from "../contractABI/contractABI.json";
import { simulateContract, writeContract } from "@wagmi/core";
import { config } from "@layouts/RootLayout";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@components/ui/button";
import { toast } from "sonner";
import { useCreateProposalMutation } from "@redux/services/proposal";
import { useAccount } from "wagmi";
import { useNavigate } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "@components/ui/dialog";

const NewMemberApprovalProposal = () => {
  const [data, setData] = useState({
    _newMember: "",
    description: "",
  });
  const [createProposal] = useCreateProposalMutation();
  const { address } = useAccount();
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();

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
        address: import.meta.env.VITE_SMART_CONTRACT_ADDRESS,
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

      await createProposal(backendData);

      toast.warning("Your proposal has been placed and is under review.");
      navigate("/mfs/dao/fincube");
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
    <div className="container mt-20">
      <div className="mb-3 flex justify-end">
        <ConnectButton />
      </div>
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
            <Button isLoading={loadingStatus}>Place Proposal</Button>
          </div>
        </form>
      </div>
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) navigate("/dashboard");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <h2 className="text-lg font-bold text-green-400">
              Proposal Submitted
            </h2>
          </DialogHeader>
          <p className="text-center text-yellow-400">
            Your proposal has been successfully submitted and is under review.
          </p>
          <DialogFooter>
            <Button
              className="bg-blue-600 font-bold hover:bg-blue-700 text-white"
              onClick={() => navigate("/dashboard")}
            >
              Back to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewMemberApprovalProposal;
