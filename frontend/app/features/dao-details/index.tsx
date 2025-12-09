import { Calendar, Clock, ClockAlert, Code, Link, Shield } from "lucide-react";
import { useMemo } from "react";
import { useAccount } from "wagmi";
import WithLoader from "@/shared/components/with-loader";
import DetailsCard from "./components/details-card";
import DetailsCardSkeleton from "./components/details-card-skeleton";
import GovernanceParameters from "./components/governance-parameters";
import { useDaoInfo } from "./hooks/use-dao-info";

export default function DaoDetails() {
  const {
    daoURI,
    version,
    votingPeriod,
    votingDelay,
    proposalCount,
    memberCount,
    proposalThreshold,
    loading,
  } = useDaoInfo({ debug: false });

  const { chain, chainId } = useAccount();

  // Calculate quorum threshold percentage
  const quorumThresholdPercentage = useMemo(() => {
    if (memberCount === 0) return "0%";
    const percentage = (proposalThreshold / memberCount) * 100;
    return `${percentage.toFixed(0)}%`;
  }, [proposalThreshold, memberCount]);

  const infoItems = useMemo(
    () => [
      {
        label: "Voting Period",
        value: votingPeriod,
        icon: Clock,
        description: "Duration for active voting",
      },
      {
        label: "Voting Delay",
        value: votingDelay,
        icon: ClockAlert,
        description: "Delay before voting starts",
      },
      {
        label: "Execution Delay",
        value: 0,
        icon: Shield,
        description: "Timelock for proposal execution",
      },
      {
        label: "Chain",
        value: chain?.name || "Not Connected",
        icon: Link,
        description: `Chain ID: ${chainId || "N/A"}`,
      },
      {
        label: "Version",
        value: version,
        icon: Code,
        description: "Current protocol version",
      },
      {
        label: "Created",
        value: "December 2023",
        icon: Calendar,
        description: "DAO inception date",
      },
    ],
    [version, votingDelay, votingPeriod]
  );

  const governanceItems = useMemo(
    () => [
      {
        label: "Total Members",
        value: memberCount,
        gradient: "from-emerald-500 to-cyan-500",
      },
      {
        label: "Proposal Count",
        value: proposalCount,
        gradient: "from-cyan-500 to-blue-500",
      },
      {
        label: "Quorum Threshold",
        value: quorumThresholdPercentage,
        gradient: "from-blue-500 to-purple-500",
      },
      {
        label: "Treasury Value",
        value: "0 USDC",
        gradient: "from-purple-500 to-pink-500",
      },
    ],
    [proposalCount, memberCount, quorumThresholdPercentage]
  );

  return (
    <WithLoader isLoading={loading} fallback={<DetailsCardSkeleton />}>
      <div className="flex flex-col gap-4 lg:gap-6">
        <DetailsCard
          title={daoURI?.name || "FinCube"}
          subtitle="Decentralized Financial Governance"
          description={
            daoURI?.description ||
            "A Decentralized Autonomous Organization (DAO) ensuring democratic, transparent governance where member organizations collectively make decisions about platform economics."
          }
          infoItems={infoItems}
        />
        <GovernanceParameters governanceItems={governanceItems} />
      </div>
    </WithLoader>
  );
}
