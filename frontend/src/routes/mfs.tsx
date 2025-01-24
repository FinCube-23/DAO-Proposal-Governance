import { RouteObject } from "react-router-dom";
import ProposalView from "@pages/dao/proposal/proposalView";
import MfsLayout from "@layouts/MfsLayout";
import MfsDashboard from "@pages/mfs/dashboard";
import { Dashboard } from "@pages/mfs/test";
import Registration from "@pages/mfs/registration";
import MFSPrivateLayout from "@layouts/MFSPrivateLayout";
import Profile from "@pages/mfs/profile";
import OffchainCardView from "@pages/dao/proposal/OffChainCardView";
import OngoingProposalView from "@pages/dao/proposal/OngoingProposalView";

export const mfsRoutes: RouteObject = {
  path: "/mfs",
  element: <MfsLayout />,
  children: [
    {
      path: "registration",
      element: <Registration />,
    },
    {
      path: "tests",
      element: <Dashboard />,
    },
    {
      path: "",
      element: <MFSPrivateLayout />,
      children: [
        {
          path: "",
          element: <MfsDashboard />,
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
          path: "tests",
          element: <Dashboard />,
        },
        {
          path: "",
          element: <MFSPrivateLayout />,
          children: [
            {
              path: "",
              element: <MfsDashboard />,
            },
            {
              path: "profile",
              element: <Profile />,
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
