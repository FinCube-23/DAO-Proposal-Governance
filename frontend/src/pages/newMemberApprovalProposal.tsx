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

const NewMemberApprovalProposal = () => {
  const [data, setData] = useState({
    _newMember: "",
    description: "",
  });
  const [createProposal] = useCreateProposalMutation();
  const { address } = useAccount();
  const [loadingStatus, setLoadingStatus] = useState(false);
  const navigate = useNavigate();

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    const form = e.target;
    const name = form.name;
    const value = form.value;
    setData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // newMemberApprovalProposal()
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

      // backend proposal service call
      const backendData = {
        proposal_type: "membership",
        metadata: data.description,
        proposer_address: `0x${address}`,
        trx_hash: hash,
      };

      const response = await createProposal(backendData);
      console.log("Backend response:", response);

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
      <div className="mt-20">
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
          <input
            className="w-full p-3 mt-2 bg-black border border-gray-600 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
            type="text"
            name="description"
            onChange={handleInput}
            placeholder="Enter description"
            required
          />
          <div className="flex justify-center">
            <Button isLoading={loadingStatus}>Approve</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewMemberApprovalProposal;
