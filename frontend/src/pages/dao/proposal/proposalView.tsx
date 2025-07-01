import ProposalCard from "@components/dao/ProposalCard";
import { ProposalStatCard } from "@components/dao/ProposalStatCard";
import contractABI from "../../../contractABI/contractABI.json";
import { readContract } from "@wagmi/core";
import { config } from "../../../main";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { IProposal } from "@lib/interfaces";
import { toast } from "sonner";
import Loader from "@components/Loader";

export default function ProposalView() {
  const [proposal, setProposal] = useState<IProposal>();
  const { id } = useParams();

  useEffect(() => {
    const getProposalsById = async () => {
      try {
        const response: any = await readContract(config, {
          abi: contractABI,
          address: import.meta.env.VITE_SMART_CONTRACT_ADDRESS,
          functionName: "getProposalsById",
          args: [id],
        });

        setProposal(response);
        console.log(id);
      } catch (e) {
        toast.error("Failer to fetch proposal information");
        console.error("Failed to fetch proposal information:", e);
      }
    };

    getProposalsById();
  }, [id]);

  return (
    <div className="flex flex-col gap-5">
      {proposal ? (
        <>
          <ProposalCard proposal={proposal} proposalId={id} />
          <div className="flex flex-col-reverse md:grid md:grid-cols-12">
            <div className="md:col-span-7">
              <ProposalStatCard proposal={proposal} proposalId={id} />
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
