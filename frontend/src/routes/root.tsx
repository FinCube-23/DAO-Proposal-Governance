import { RouteObject } from "react-router-dom";
import RootLayout from "@layouts/RootLayout";
import Welcome from "@pages/welcome";
import DaoDashboard from "@pages/dao_dashboard";
import ProposalView from "@pages/dao/proposal/proposalView";
import DaoLayout from "@layouts/DaoLayout";
import Auth from "@pages/auth";
import Login from "@pages/login";
import Register from "@pages/register";

export const rootRoutes: RouteObject = {
  path: "/",
  element: <RootLayout />,
  children: [
    {
      path: "",
      element: <Welcome />,
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
          ],
        },
      ],
    },
  ],
};
