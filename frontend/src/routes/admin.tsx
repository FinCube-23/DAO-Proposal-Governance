import AdminLayout from "@layouts/AdminLayout";
import { RouteObject } from "react-router-dom";

export const adminRoutes: RouteObject = {
  path: "/admin",
  element: <AdminLayout></AdminLayout>,
  children: [],
};
