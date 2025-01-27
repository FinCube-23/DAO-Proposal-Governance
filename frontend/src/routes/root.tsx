import { RouteObject } from "react-router-dom";
import RootLayout from "@layouts/RootLayout";
import Welcome from "@pages/welcome";
import DaoDashboard from "@pages/dao_dashboard";
import ProposalView from "@pages/dao/proposal/proposalView";
import DaoLayout from "@layouts/DaoLayout";
import Login from "@pages/login";
import Register from "@pages/register";
import GeneralProposal from "@pages/generalProposal";
import NewMemberApprovalProposal from "@pages/newMemberApprovalProposal";
import OffchainCardView from "@pages/dao/proposal/OffChainCardView";
import OngoingProposalView from "@pages/dao/proposal/OngoingProposalView";

export const rootRoutes: RouteObject = {
  path: "/",
  element: <RootLayout />,
  children: [
    {
      path: "",
      element: <Welcome />,
    },
    {
      path: "general-proposal",
      element: <GeneralProposal></GeneralProposal>,
    },
    {
      path: "approval-proposal",
      element: <NewMemberApprovalProposal></NewMemberApprovalProposal>,
    },
    {
      path: "login",
      element: <Login />,
    },
    {
      path: "register",
      element: <Register />,
    },
    {
      path: "dashboard",
      element: <DaoLayout />,
      children: [
        {
          path: "",
          element: <DaoDashboard />,
        },
        {
          path: "proposals/:id",
          element: <ProposalView />,
        },
        {
          path: "off-chain-proposals/:id",
          element: <OffchainCardView />,
        },
        {
          path: "ongoing-proposals/:id",
          element: <OngoingProposalView />,
        },
        {
          path: "dashboard",
          element: <DaoLayout />,
          children: [
            {
              path: "",
              element: <DaoDashboard />,
            },
            {
              path: "proposals/:id",
              element: <ProposalView />,
            },
            {
              path: "off-chain-proposals/:id",
              element: <OffchainCardView />,
            },
            {
              path: "ongoing-proposals/:id",
              element: <OngoingProposalView />,
            },
          ],
        },
      ],
    },
  ],
};
