import { createBrowserRouter } from "react-router";
import { rootRoutes } from "@/routes/root";
import { mfsRoutes } from "@routes/mfs";
import { adminRoutes } from "@routes/admin";

export const coreRouter = createBrowserRouter([
  rootRoutes,
  mfsRoutes,
  adminRoutes,
]);
