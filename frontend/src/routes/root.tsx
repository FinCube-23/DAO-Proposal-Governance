import { RouteObject } from "react-router-dom";
import RootLayout from "@layouts/RootLayout";
import Welcome from "@pages/welcome";
import DaoDashboard from "@pages/dao_dashboard";
import ProposalView from "@pages/dao/proposal/proposalView";
import DaoLayout from "@layouts/DaoLayout";
import Tests from "@pages/tests";
import Auth from "@pages/auth";
import GeneralProposal from "@pages/generalProposal";
import NewMemberApprovalProposal from "@pages/newMemberApprovalProposal";
import CastVote from "@pages/castVote";
import UserLogin from "@pages/userLogin";

export const rootRoutes: RouteObject = {
  path: "/",
  element: <RootLayout />,
  children: [
    {
      path: "",
      element: <Welcome />,
    },
    {
      path: "tests",
      element: <Tests />,
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
      path: "cast-vote",
      element: <CastVote></CastVote>,
    },
    {
      path: "user-login",
      element: <UserLogin></UserLogin>,
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
          path: "proposals/:address",
          element: <ProposalView />,
        },
        {
          path: "auth",
          element: <Auth />,
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
              path: "proposals/:address",
              element: <ProposalView />,
            },
          ],
        },
      ],
    },
  ],
};
