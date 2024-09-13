import ProposalCard from "@components/dao/ProposalCard";
import { ProposalStatCard } from "@components/dao/ProposalStatCard";
import contractABI from "../../../contractABI/contractABI.json";
import { readContract } from "@wagmi/core";
import { config } from "@layouts/RootLayout";
import { useEffect, useState } from "react";
import { Proposal } from "@pages/dao_dashboard";
import { useParams } from "react-router-dom";

export default function ProposalView() {
  const [proposal, setProposal] = useState<Proposal>({
    executed: false,
    canceled: false,
    proposer: "",
    data: "",
    target: "",
    voteStart: 0,
    voteDuration: 0,
    yesvotes: 0,
    novotes: 0,
    proposalURI: "",
  });
  const { id } = useParams();

  useEffect(() => {
    const getProposal = async () => {
      try {
        const response: any = await readContract(config, {
          abi: contractABI,
          address: "0xc72941fDf612417EeF0b8A29914744ad5f02f83F",
          functionName: "getProposalsByPage",
          args: [0, 10],
        });

        const result = response[0].find(
          (proposal: Proposal) => proposal.proposer === id
        );

        setProposal(result as Proposal);
      } catch (e) {
        alert("Failer to fetch proposal information");
        console.error("Failed to fetch proposal information:", e);
      }
    };

    getProposal();
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <ProposalCard
        proposal={proposal}
        proposalId={proposal.proposer}
        showStatus={false}
      />
      <div className="flex flex-col-reverse md:grid md:grid-cols-12">
        <div className="md:col-span-7">
          <ProposalStatCard
            proposal={proposal}
            proposalId={proposal.proposer}
          />
        </div>
        <div className="md:col-span-4"></div>
      </div>
    </div>
  );
}
