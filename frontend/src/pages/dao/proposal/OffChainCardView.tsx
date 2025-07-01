import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useLazyGetProposalQuery } from "@redux/services/proposal";
import OffchainCard from "@components/dao/OffChainCard";
import { OffchainStatCard } from "@components/dao/OffchainStatCard";
import { toast } from "sonner";
import { IOffchainProposal } from "@lib/interfaces";
import Loader from "@components/Loader";

export default function OffchainCardView() {
  const [proposal, setProposal] = useState<IOffchainProposal>();
  const { id } = useParams();
  const [getProposal] = useLazyGetProposalQuery();

  useEffect(() => {
    const getOffchainProposal = async () => {
      try {
        const response = await getProposal(Number(id));

        if (!response.data) {
          throw new Error("Proposal data is undefined");
        }

        console.log("Offchain Data:", response.data);
        setProposal(response.data);
      } catch (e) {
        toast.error("Failer to fetch proposal information");
        console.error("Failed to fetch proposal information:", e);
      }
    };

    getOffchainProposal();
  }, [getProposal, id]);

  return (
    <div className="flex flex-col gap-5">
      {proposal ? (
        <>
          <OffchainCard proposal={proposal} proposalId={id} />
          <div className="flex flex-col-reverse md:grid md:grid-cols-12">
            <div className="md:col-span-7">
              <OffchainStatCard proposal={proposal} proposalId={id} />
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
