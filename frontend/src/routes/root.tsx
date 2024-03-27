import { RouteObject } from "react-router-dom";
import RootLayout from "@layouts/RootLayout";
import Welcome from "@pages/welcome";
import DaoDashboard from "@pages/dao_dashboard";

export const rootRoutes: RouteObject = {
    path: "/",
    element: <RootLayout />,
    children: [
        {
            path: "",
            element: <Welcome />,
        },
        {
            path: "dashboard",
            element: <DaoDashboard />,
        },
    ],
};