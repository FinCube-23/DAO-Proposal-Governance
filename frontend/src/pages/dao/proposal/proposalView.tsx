import ProposalCard from "@components/dao/ProposalCard";
import { ProposalStatCard } from "@components/dao/ProposalStatCard";
import { Proposal } from "@services/proposal/types";
import { useParams } from "react-router-dom";
import contractABI from "../../../contractABI/contractABI.json";
import { readContract } from "@wagmi/core";
import { config } from "@layouts/RootLayout";
import { useEffect, useState } from "react";

const proposal: Proposal = {
  title: "Renovation Project",
  description: "Renovating the community center",
  status: "ongoing",
  address: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0",
};

export default function ProposalView() {
  const { id } = useParams();
  const [proposal, setProposal] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProposal = async () => {
      try {
        const response = await readContract(config, {
          abi: contractABI,
          address: "0xc72941fDf612417EeF0b8A29914744ad5f02f83F",
          functionName: "getProposalsByPage",
          args: [0, 10],
        });

        const result = response[0][id];

        setProposal(result as object);
      } catch (e) {
        console.log(e);
        setLoading(false);
      }
    };

    getProposal();
  }, [id]);

  return (
    <div className="flex flex-col gap-5">
      <ProposalCard proposal={proposal} proposalId={id} showStatus={false} />
      <div className="flex flex-col-reverse md:grid md:grid-cols-12">
        <div className="md:col-span-7">
          <ProposalStatCard proposal={proposal} proposalId={id} />
        </div>
        <div className="md:col-span-4"></div>
      </div>
    </div>
  );
}
