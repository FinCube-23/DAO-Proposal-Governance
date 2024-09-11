import { ChangeEvent, FormEvent, useState } from "react";
import contractABI from "../contractABI/contractABI.json";
import {
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from "@wagmi/core";
import { config } from "@layouts/RootLayout";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@components/ui/button";
import { toast } from "sonner";

const NewMemberApprovalProposal = () => {
  const [data, setData] = useState({
    _newMember: "",
    description: "",
  });

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
    try {
      const { request } = await simulateContract(config, {
        abi: contractABI, // Fill
        address: "0xc72941fDf612417EeF0b8A29914744ad5f02f83F", // Fill
        functionName: "newMemberApprovalProposal",
        args: [data._newMember, data.description], // pass arguments
      });

      const hash = await writeContract(config, request);

      await waitForTransactionReceipt(config, { hash });

      toast.success("Member approved!");
    } catch (e: any) {
      toast.error(e.message);
      console.error("Failed to approve member:", e);
    }
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
          />
          <p>Description: </p>
          <input
            className="w-full p-3 mt-2 bg-black border border-gray-600 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
            type="text"
            name="description"
            onChange={handleInput}
            placeholder="Enter description"
          />
          <div className="flex justify-center">
            <Button>Approve</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewMemberApprovalProposal;
