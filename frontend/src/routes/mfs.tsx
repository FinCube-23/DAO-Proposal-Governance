import { RouteObject } from "react-router-dom";
import DaoDashboard from "@pages/dao_dashboard";
import ProposalView from "@pages/dao/proposal/proposalView";
import DaoLayout from "@layouts/DaoLayout";
import MfsLayout from "@layouts/MfsLayout";
import MfsDashboard from "@pages/mfs/dashboard";
import { Dashboard } from "@pages/mfs/test";

export const mfsRoutes: RouteObject = {
    path: "/mfs",
    element: <MfsLayout />,
    children: [
        {
            path: "",
            element: <MfsDashboard />,
        },
        {
            path: "tests",
            element: <Dashboard />,
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
};
