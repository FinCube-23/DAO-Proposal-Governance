import contractABI from "../../../contractABI/contractABI.json";
import { readContract } from "@wagmi/core";
import { config } from "@layouts/RootLayout";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import OngoingProposalCard from "@components/dao/OngoingProposalCard";
import { OngoingProposalStatCard } from "@components/dao/OngoingProposalStatCard";
import { IProposal } from "@lib/interfaces";
import { toast } from "sonner";
import Loader from "@components/Loader";

export default function OngoingProposalView() {
  const [proposal, setProposal] = useState<IProposal>();
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
        setProposal(result);
      } catch (e) {
        toast.error("Failer to fetch proposal information");
        console.error("Failed to fetch proposal information:", e);
      }
    };

    getOngoingProposal();
  }, [id, proposal]);

  return (
    <div className="flex flex-col gap-5">
      {proposal ? (
        <>
          <OngoingProposalCard proposal={proposal} proposalId={id} />
          <div className="flex flex-col-reverse md:grid md:grid-cols-12">
            <div className="md:col-span-7">
              <OngoingProposalStatCard proposal={proposal} proposalId={id} />
            </div>
            <div className="md:col-span-4"></div>
          </div>
        </>
      ) : (
        <Loader />
      )}
    </div>
  );
}
