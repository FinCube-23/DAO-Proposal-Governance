import ProposalCard from "@components/dao/ProposalCard";
import { ProposalStatCard } from "@components/dao/ProposalStatCard";
import { Proposal } from "@services/proposal/types";
// import { useParams } from "react-router-dom";

const proposal: Proposal = {
    title: "Renovation Project",
    description: "Renovating the community center",
    status: "ongoing",
    address: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0",
};

export default function ProposalView() {
    // const { address } = useParams();
    return (
        <div className="flex flex-col gap-5">
            <ProposalCard proposal={proposal} showStatus={false} />
            <div className="flex flex-col-reverse md:grid md:grid-cols-12">
                <div className="md:col-span-7">
                    <ProposalStatCard proposal={proposal} />
                </div>
                <div className="md:col-span-4">
                    
                </div>
            </div>
        </div>
    );
}
