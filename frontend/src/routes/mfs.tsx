import { RouteObject } from "react-router-dom";
import ProposalView from "@pages/dao/proposal/proposalView";
import MfsLayout from "@layouts/MfsLayout";
import MfsDashboard from "@pages/mfs/dashboard";
import { Dashboard } from "@pages/mfs/test";
import Registration from "@pages/mfs/registration";
import MFSPrivateLayout from "@layouts/MFSPrivateLayout";
import Login from "@pages/mfs/login";
import Profile from "@pages/mfs/profile";

export const mfsRoutes: RouteObject = {
  path: "/mfs",
  element: <MfsLayout />,
  children: [
    {
      path: "registration",
      element: <Registration />,
    },
    {
      path: "login",
      element: <Login />,
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
          path: "proposals/:address",
          element: <ProposalView />,
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
                    path: "proposals/:address",
                    element: <ProposalView />,
                },
            ],
        },
    ],
};
