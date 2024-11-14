import AdminLayout from "@layouts/AdminLayout";
import Dashboard from "@pages/admin/Dashboard";
import { RouteObject } from "react-router-dom";

export const adminRoutes: RouteObject = {
  path: "/admin",
  element: <AdminLayout></AdminLayout>,
  children: [
    {
      path: "",
      element: <Dashboard></Dashboard>,
    },
  ],
};
