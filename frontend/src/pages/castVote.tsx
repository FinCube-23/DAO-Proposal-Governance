import { ChangeEvent, FormEvent, useState } from "react";
import contractABI from "../contractABI/contractABI.json";
import {
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from "@wagmi/core";
import { config } from "@layouts/MfsLayout";

const CastVote = () => {
  const [data, setData] = useState({
    proposalId: "",
    support: "",
  });

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    const form = e.target;
    const name = form.name;
    const value = form.value;
    setData((prevData) => ({
      ...prevData,
      [name]: Number(value),
    }));
  };

  // castVote()
  const castVote = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const { request } = await simulateContract(config, {
        abi: contractABI, // Fill
        address: "0xc72941fDf612417EeF0b8A29914744ad5f02f83F", // Fill
        functionName: "castVote",
        args: [data.proposalId, data.support], // pass arguments
      });

      const hash = await writeContract(config, request);

      await waitForTransactionReceipt(config, { hash });

      alert("Vote casted!");
    } catch (e) {
      console.error("Failed to cast vote:", e);
    }
  };

  return (
    <div className="container mx-auto mt-20">
      <h1 className="text-white">Cast Vote</h1>
      <form onSubmit={castVote}>
        <p>Proposal ID: </p>
        <input
          className="text-black p-2"
          type="text"
          name="proposalId"
          onChange={handleInput}
        />
        <p>Support: </p>
        <input
          className="text-black p-2"
          type="text"
          name="support"
          onChange={handleInput}
        />
        <button type="submit">Cast Vote</button>
      </form>
    </div>
  );
};

export default CastVote;
