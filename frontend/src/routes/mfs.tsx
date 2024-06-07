import { RouteObject } from "react-router-dom";
import DaoDashboard from "@pages/dao_dashboard";
import ProposalView from "@pages/dao/proposal/proposalView";
import DaoLayout from "@layouts/DaoLayout";
import Tests from "@pages/tests";
import MfsLayout from "@layouts/MfsLayout";
import MfsDashboard from "@pages/mfs/dashboard";

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
            element: <Tests />
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
                    element: <ProposalView />
                }
            ],
        },
    ],
};