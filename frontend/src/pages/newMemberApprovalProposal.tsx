import { ChangeEvent, FormEvent, useState } from "react";
import contractABI from "../contractABI/contractABI.json";
import { simulateContract, writeContract } from "@wagmi/core";
import { Button } from "@components/ui/button";
import { toast } from "sonner";
import { useCreateProposalMutation } from "@redux/services/proposal";
import { useAccount } from "wagmi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "@components/ui/dialog";
import { useNavigate } from "react-router";
import { config } from "../main";
import { UserPlus2, FileText } from "lucide-react";

const NewMemberApprovalProposal = () => {
  const [data, setData] = useState({
    _newMember: "",
    description: "",
  });
  const [createProposal] = useCreateProposalMutation();
  const { address } = useAccount();
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [trxHash, setTrxHash] = useState("");
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
      setTrxHash(hash);

      toast.success("Proposal submitted! Approval is pending.");
      setDialogOpen(true);
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
      <div className="mt-10 flex flex-col items-center">
        <div className="flex items-center gap-3 mb-4">
          <UserPlus2 className="text-blue-400" size={36} />
          <h1 className="text-3xl font-bold text-white text-center">
            New Member Approval Proposal
          </h1>
        </div>
        <form
          onSubmit={approveMember}
          className="w-full max-w-lg mx-auto space-y-6 bg-black/90 border border-gray-800 p-8 rounded-2xl shadow-lg"
        >
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
              <UserPlus2 size={18} className="text-blue-400" />
              New Member Address
            </label>
            <input
              className="w-full p-3 bg-black border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              type="text"
              name="_newMember"
              onChange={handleInput}
              placeholder="Enter address"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
              <FileText size={18} className="text-blue-400" />
              Description
            </label>
            <textarea
              className="w-full p-3 bg-black border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none transition"
              name="description"
              onChange={handleInput}
              placeholder="Enter description"
              rows={7}
              required
            ></textarea>
          </div>
          <div className="flex justify-center">
            <Button
              type="submit"
              isLoading={loadingStatus}
              className="w-full font-bold text-lg text-white bg-blue-600 hover:bg-blue-700 transition"
            >
              Place Proposal
            </Button>
          </div>
        </form>
      </div>
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) navigate("/organization/dao/fincube");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <h2 className="text-lg font-bold text-green-400">
              Proposal Submitted
            </h2>
          </DialogHeader>
          <p className="text-yellow-400 mb-4">
            Your proposal has been successfully submitted and is under review.
            To check the transaction status,{" "}
            <a
              target="_blank"
              href={`${import.meta.env.VITE_TRX_EXPLORER}${trxHash}`}
              className="text-blue-400 underline"
              rel="noopener noreferrer"
            >
              click here
            </a>
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
  );
};

export default NewMemberApprovalProposal;
