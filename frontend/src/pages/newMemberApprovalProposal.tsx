import { ChangeEvent, FormEvent, useState } from "react";
import contractABI from "../contractABI/contractABI.json";
import {
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from "@wagmi/core";
import { config } from "@layouts/MfsLayout";

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

      alert("Member approved!");
    } catch (e) {
      console.error("Failed to approve member:", e);
    }
  };

  return (
    <div className="container mx-auto mt-20">
      <h1 className="text-white">New Member Approval Proposal</h1>
      <form onSubmit={approveMember}>
        <p>New Member Address: </p>
        <input
          className="text-black p-2"
          type="text"
          name="_newMember"
          onChange={handleInput}
        />
        <p>Description: </p>
        <input
          className="text-black p-2"
          type="text"
          name="description"
          onChange={handleInput}
        />
        <button type="submit">Approve member</button>
      </form>
    </div>
  );
};

export default NewMemberApprovalProposal;
