
import { rootRoutes } from "@/routes/root";
import { mfsRoutes } from "@routes/mfs";
import { createBrowserRouter } from "react-router-dom";

export const coreRouter = createBrowserRouter([rootRoutes, mfsRoutes]);