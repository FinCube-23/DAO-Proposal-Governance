import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import OffchainCard from "./OffChainCard";
import { OffchainStatCard } from "./OffchainStatCard";
import { useLazyGetProposalQuery } from "@redux/services/proposal";

export default function OffchainCardView() {
  const [proposal, setProposal] = useState({});
  const { id } = useParams();
  const [getProposal] = useLazyGetProposalQuery();

  useEffect(() => {
    const getOnchainProposal = async () => {
      try {
        const response = await getProposal(Number(id));
        console.log("====================================");
        console.log(response);
        setProposal(response);
        console.log("====================================");
      } catch (e) {
        alert("Failer to fetch proposal information");
        console.error("Failed to fetch proposal information:", e);
      }
    };

    getOnchainProposal();
  }, [getProposal, id]);

  return (
    <div className="flex flex-col gap-5">
      <OffchainCard proposal={proposal} proposalId={id} />
      <div className="flex flex-col-reverse md:grid md:grid-cols-12">
        <div className="md:col-span-7">
          <OffchainStatCard proposal={proposal} proposalId={id} />
        </div>
        <div className="md:col-span-4"></div>
      </div>
    </div>
  );
}
