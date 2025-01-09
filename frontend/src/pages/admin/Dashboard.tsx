// import { useEffect } from "react";

// const Dashboard = () => {
//   // executeProposal
//   const execute = async () => {
//     try {
//       await executeProposal();
//     } catch (e) {
//       console.error(e);
//     }
//   };

//   useEffect(() => {
//     // getBalance
//     const fetchBalance = async () => {
//       try {
//         const balance = await getBalance();
//         console.log("====================================");
//         console.log(balance);
//         console.log("====================================");
//       } catch (e) {
//         console.error(e);
//       }
//     };

//     // getProposalThreshold
//     const fetchProposalThreshold = async () => {
//       try {
//         const proposalThreshold = await getProposalThreshold();
//         console.log("====================================");
//         console.log(proposalThreshold);
//         console.log("====================================");
//       } catch (e) {
//         console.error(e);
//       }
//     };

//     // getOngoingProposals
//     const fetchOngoingProposals = async () => {
//       try {
//         const ongoingProposals = await getOngoingProposals();
//         console.log("====================================");
//         console.log(ongoingProposals);
//         console.log("====================================");
//       } catch (e) {
//         console.error(e);
//       }
//     };

//     fetchBalance();
//     fetchProposalThreshold();
//     fetchProposalCount();
//     fetchOngoingProposals();
//   }, [getBalance, getOngoingProposals, getProposalThreshold]);

//   return (
//     <div>
//       <button onClick={execute}>Bleh</button>
//     </div>
//   );
// };

// export default Dashboard;
