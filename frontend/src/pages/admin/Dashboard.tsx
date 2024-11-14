import {
  useExecuteProposalMutation,
  useLazyGetBalanceQuery,
  useLazyGetOngoingProposalsQuery,
  useLazyGetProposalCountQuery,
  useLazyGetProposalThresholdQuery,
} from "@redux/services/proxy";
import { useEffect } from "react";

const Dashboard = () => {
  const [getBalance] = useLazyGetBalanceQuery();
  const [getProposalThreshold] = useLazyGetProposalThresholdQuery();
  const [getProposalCount] = useLazyGetProposalCountQuery();
  const [getOngoingProposals] = useLazyGetOngoingProposalsQuery();
  const [executeProposal] = useExecuteProposalMutation();

  // executeProposal
  const execute = async () => {
    try {
      await executeProposal();
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    // getBalance
    const fetchBalance = async () => {
      try {
        const balance = await getBalance();
        console.log("====================================");
        console.log(balance);
        console.log("====================================");
      } catch (e) {
        console.error(e);
      }
    };

    // getProposalThreshold
    const fetchProposalThreshold = async () => {
      try {
        const proposalThreshold = await getProposalThreshold();
        console.log("====================================");
        console.log(proposalThreshold);
        console.log("====================================");
      } catch (e) {
        console.error(e);
      }
    };

    // getProposalCount
    const fetchProposalCount = async () => {
      try {
        const proposalCount = await getProposalCount();
        console.log("====================================");
        console.log(proposalCount);
        console.log("====================================");
      } catch (e) {
        console.error(e);
      }
    };

    // getOngoingProposals
    const fetchOngoingProposals = async () => {
      try {
        const ongoingProposals = await getOngoingProposals();
        console.log("====================================");
        console.log(ongoingProposals);
        console.log("====================================");
      } catch (e) {
        console.error(e);
      }
    };

    fetchBalance();
    fetchProposalThreshold();
    fetchProposalCount();
    fetchOngoingProposals();
  }, [getBalance, getOngoingProposals, getProposalThreshold, getProposalCount]);

  return (
    <div>
      <button onClick={execute}></button>
    </div>
  );
};

export default Dashboard;
