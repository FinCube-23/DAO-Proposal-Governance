import { ChangeEvent, FormEvent, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { encodeFunctionData } from "viem";
import contractABI from "../contractABI/contractABI.json";
import {
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from "@wagmi/core";
import { config } from "@layouts/MfsLayout";

const GeneralProposal = () => {
  const [targets, setTargets] = useState("");
  const [values, setValues] = useState("");
  const [calldatas, setCalldatas] = useState("");
  const [description, setDescription] = useState("");

  const handleTargetsChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTargets(e.target.value);
  };

  const handleValuesChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValues(e.target.value);
  };

  const handleCalldatasChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCalldatas(e.target.value);
  };

  const handleDescriptionChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
  };

  const propose = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = encodeFunctionData({
      abi: contractABI,
      functionName: "propose",
      args: [
        [targets], // Targets as an array of addresses
        values.split(",").map(Number), // Values as an array of numbers
        [calldatas], // Calldatas as an array of bytes
        description,
      ],
    });

    const proposalData = {
      targets: [targets],
      values: values.split(",").map(Number),
      calldatas: [data],
      description,
    };
    try {
      const { request } = await simulateContract(config, {
        abi: contractABI, // Fill
        address: "0xc72941fDf612417EeF0b8A29914744ad5f02f83F", // Fill
        functionName: "propose",
        args: [
          proposalData.targets,
          proposalData.values,
          proposalData.calldatas,
          proposalData.description,
        ], // pass arguments
      });

      const hash = await writeContract(config, request);

      await waitForTransactionReceipt(config, { hash });

      alert("Members proposed!");
    } catch (e) {
      console.error("Failed to propose members:", e);
    }
  };

  return (
    <div className="container mx-auto mt-20">
      <h1 className="text-white">General Proposal</h1>
      <ConnectButton />
      <form onSubmit={propose}>
        <p>Targets: </p>
        <input
          className="text-black p-2"
          type="text"
          value={targets}
          onChange={handleTargetsChange}
        />
        <p>Values: </p>
        <input
          className="text-black p-2"
          type="text"
          value={values}
          onChange={handleValuesChange}
        />
        <p>Calldatas: </p>
        <input
          className="text-black p-2"
          type="text"
          value={calldatas}
          onChange={handleCalldatasChange}
        />
        <p>Description: </p>
        <input
          className="text-black p-2"
          type="text"
          value={description}
          onChange={handleDescriptionChange}
        />
        <button type="submit">Propose</button>
      </form>
    </div>
  );
};

export default GeneralProposal;
