import ProposalCard from "@components/dao/ProposalCard";
import { ProposalStatCard } from "@components/dao/ProposalStatCard";
import contractABI from "../../../contractABI/contractABI.json";
import { readContract } from "@wagmi/core";
import { config } from "@layouts/RootLayout";
import { useEffect, useState } from "react";
import { Proposal } from "@pages/dao_dashboard";
import { useParams } from "react-router";

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
          address: import.meta.env.VITE_SMART_CONTRACT_ADDRESS,
          functionName: "getProposalsByPage",
          args: [0, 10],
        });

        const result = response[0][Number(id)];

        setProposal(result as Proposal);
        console.log(result);
        console.log(id);
      } catch (e) {
        alert("Failer to fetch proposal information");
        console.error("Failed to fetch proposal information:", e);
      }
    };

    getProposal();
  }, [id]);

  return (
    <div className="flex flex-col gap-5">
      <ProposalCard proposal={proposal} proposalId={id} />
      <div className="flex flex-col-reverse md:grid md:grid-cols-12">
        <div className="md:col-span-7">
          <ProposalStatCard proposal={proposal} proposalId={id} />
        </div>
        <div className="md:col-span-4"></div>
      </div>
    </div>
  );
}
