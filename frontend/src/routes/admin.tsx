import AdminLayout from "@layouts/AdminLayout";
import { RouteObject } from "react-router";

export const adminRoutes: RouteObject = {
  path: "/admin",
  element: <AdminLayout></AdminLayout>,
  children: [],
};
