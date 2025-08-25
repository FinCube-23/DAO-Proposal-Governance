import { IProposal } from "@lib/interfaces";
import { readContract } from "@wagmi/core";
import { useEffect, useState } from "react";
import contractABI from "../../contractABI/contractABI.json";
import { config } from "../../main";
import OngoingProposalCard from "./OngoingProposalCard";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

const OngoingProposals = () => {
  const [ongoingProposals, setOngoingProposals] = useState<IProposal[]>();
  const [loading, setLoading] = useState(false);

  const getOngoingProposals = async () => {
    setLoading(true);
    try {
      const response: any = await readContract(config, {
        abi: contractABI,
        address: import.meta.env.VITE_SMART_CONTRACT_ADDRESS,
        functionName: "getOngoingProposals",
      });

      const filteredProposals = response.filter(
        (proposal: any) =>
          proposal.proposer !== "0x0000000000000000000000000000000000000000"
      );

      setOngoingProposals(filteredProposals);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false); // Ensure loading state is reset on error
    }
  };

  useEffect(() => {
    getOngoingProposals();
  }, []);

  return (
    <div className="flex flex-col gap-5">
      {loading ? (
        // Loading skeletons
        <div className="flex flex-col gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[150px] w-full rounded-xl" />
          ))}
        </div>
      ) : ongoingProposals && ongoingProposals.length > 0 ? (
        ongoingProposals.map((proposal, idx) => (
          <OngoingProposalCard
            key={idx}
            proposal={proposal}
            proposalId={proposal.proposalId}
          />
        ))
      ) : (
        <p className="text-center text-muted-foreground border-2 border-dashed p-5 rounded-xl">
          No ongoing proposals
        </p>
      )}
    </div>
  );
};

export default OngoingProposals;
