import { RouteObject } from "react-router-dom";
import RootLayout from "@layouts/RootLayout";
import Welcome from "@pages/welcome";

export const rootRoutes: RouteObject = {
    path: "/",
    element: <RootLayout />,
    children: [
        {
            path: "",
            element: <Welcome />,
        },
    ],
};