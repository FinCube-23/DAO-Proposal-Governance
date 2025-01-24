import contractABI from "../../../contractABI/contractABI.json";
import { readContract } from "@wagmi/core";
import { config } from "@layouts/RootLayout";
import { useEffect, useState } from "react";
import { Proposal } from "@pages/dao_dashboard";
import { useParams } from "react-router-dom";
import OngoingProposalCard from "@components/dao/OngoingProposalCard";
import { OngoingProposalStatCard } from "@components/dao/OngoingProposalStatCard";

export default function OngoingProposalView() {
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
    const getOngoingProposal = async () => {
      try {
        const response: any = await readContract(config, {
          abi: contractABI,
          address: import.meta.env.VITE_SMART_CONTRACT_ADDRESS,
          functionName: "getOngoingProposals",
        });

        const result = response[Number(id)];
        console.log("Ongoing:", result);

        setProposal(result as Proposal);
        console.log(result);
        console.log(id);
      } catch (e) {
        alert("Failer to fetch proposal information");
        console.error("Failed to fetch proposal information:", e);
      }
    };

    getOngoingProposal();
  }, [id, proposal]);

  return (
    <div className="flex flex-col gap-5">
      {proposal.voteDuration && (
        <OngoingProposalCard proposal={proposal} proposalId={id} />
      )}
      <div className="flex flex-col-reverse md:grid md:grid-cols-12">
        <div className="md:col-span-7">
          {proposal.voteDuration && (
            <OngoingProposalStatCard proposal={proposal} proposalId={id} />
          )}
        </div>
        <div className="md:col-span-4"></div>
      </div>
    </div>
  );
}
