import { SparklesCore } from "@components/ui/sparkles";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  readContract,
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from "@wagmi/core";
import { config } from "@layouts/RootLayout";
import contractABI from "../contractABI/contractABI.json";

export default function welcome() {
  // getter function states
  const [proposalCount, setProposalCount] = useState(0);
  const [proposalsByPage, setProposalsByPage] = useState({
    paginateProposals: [],
    newCursor: 0,
  });
  const [proposalThreshold, setProposalThreshhold] = useState(0);
  const [delay, setDelay] = useState(0);
  const [period, setPeriod] = useState(0);

  // SETTER FUNCTIONS

  // propose()
  const propose = async (e: MouseEvent) => {
    e.preventDefault();
    try {
      const { request } = await simulateContract(config, {
        abi: contractABI, // Fill
        address: "0xc72941fDf612417EeF0b8A29914744ad5f02f83F", // Fill
        functionName: "propose",
        args: [""], // pass arguments
      });

      const hash = await writeContract(config, request);

      await waitForTransactionReceipt(config, { hash });

      alert("Members proposed!");
    } catch (e) {
      console.log(e);
    }
  };

  // castVote()
  const castVote = async (e: MouseEvent) => {
    e.preventDefault();
    try {
      const { request } = await simulateContract(config, {
        abi: contractABI, // Fill
        address: "0xc72941fDf612417EeF0b8A29914744ad5f02f83F", // Fill
        functionName: "castVote",
        args: [""], // pass arguments
      });

      const hash = await writeContract(config, request);

      await waitForTransactionReceipt(config, { hash });

      alert("Vote casted!");
    } catch (e) {
      console.log(e);
    }
  };

  // executeProposal()
  const executeProposal = async (e: MouseEvent) => {
    e.preventDefault();
    try {
      const { request } = await simulateContract(config, {
        abi: contractABI, // Fill
        address: "0xc72941fDf612417EeF0b8A29914744ad5f02f83F", // Fill
        functionName: "executeProposal",
        args: [""], // pass arguments
      });

      const hash = await writeContract(config, request);

      await waitForTransactionReceipt(config, { hash });

      alert("Proposal executed!");
    } catch (e) {
      console.log(e);
    }
  };

  // cancelProposal()
  const cancelProposal = async (e: MouseEvent) => {
    e.preventDefault();
    try {
      const { request } = await simulateContract(config, {
        abi: contractABI, // Fill
        address: "0xc72941fDf612417EeF0b8A29914744ad5f02f83F", // Fill
        functionName: "cancelProposal",
        args: [""], // pass arguments
      });

      const hash = await writeContract(config, request);

      await waitForTransactionReceipt(config, { hash });

      alert("Proposal cancelled!");
    } catch (e) {
      console.log(e);
    }
  };

  // GETTER FUNCTIONS

  // getOngoingProposalsCount()
  const getProposalCount = async () => {
    try {
      const response = await readContract(config, {
        abi: contractABI, // Fill
        address: "0xc72941fDf612417EeF0b8A29914744ad5f02f83F", // Fill
        functionName: "getOngoingProposalsCount",
      });

      setProposalCount(response as number);
    } catch (e) {
      console.log(e);
    }
  };

  // getProposalsByPage()
  const getProposalsByPage = async () => {
    try {
      const response = await readContract(config, {
        abi: contractABI, // Fill
        address: "0xc72941fDf612417EeF0b8A29914744ad5f02f83F", // Fill
        functionName: "getProposalsByPage",
      });

      setProposalsByPage(
        response as { paginateProposals: []; newCursor: number }
      );
    } catch (e) {
      console.log(e);
    }
  };

  // proposalThreshold()
  const getThreshhold = async () => {
    try {
      const response = await readContract(config, {
        abi: contractABI, // Fill
        address: "0xc72941fDf612417EeF0b8A29914744ad5f02f83F", // Fill
        functionName: "proposalThreshold",
      });

      setProposalThreshhold(response as number);
    } catch (e) {
      console.log(e);
    }
  };

  // getVotingDelay()
  const getDelay = async () => {
    try {
      const response = await readContract(config, {
        abi: contractABI, // Fill
        address: "0xc72941fDf612417EeF0b8A29914744ad5f02f83F", // Fill
        functionName: "getVotingDelay",
      });

      setDelay(response as number);
    } catch (e) {
      console.log(e);
    }
  };

  // getVotingPeriod()
  const getPeriod = async () => {
    try {
      const response = await readContract(config, {
        abi: contractABI, // Fill
        address: "0xc72941fDf612417EeF0b8A29914744ad5f02f83F", // Fill
        functionName: "getVotingPeriod",
      });

      setPeriod(response as number);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <>
      <div className="h-screen relative w-full flex flex-col items-center justify-center overflow-hidden rounded-md">
        <div className="w-full absolute inset-0 h-screen">
          <SparklesCore
            id="tsparticlesfullpage"
            background="transparent"
            minSize={0.6}
            maxSize={1.4}
            particleDensity={100}
            className="w-full h-full z-0"
            particleColor="#FFFFFF"
          />
        </div>
        <div className="flex flex-col items-center gap-5">
          <h1 className="md:text-7xl text-3xl lg:text-6xl font-bold text-center text-white relative z-20 styled-title">
            FinCube 23
          </h1>
          {/* <div className="z-40"><Link to={"/dashboard"}><Button>Go to Demo Dashboard</Button></Link></div> */}
          <h2 className="text-xl text-center text-white">
            Secure. Swift. Seamless
          </h2>
        </div>
      </div>
    </>
  );
}
