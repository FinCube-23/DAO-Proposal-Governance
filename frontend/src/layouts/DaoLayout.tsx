import MFSSidebar from "@components/mfs/MFSSidebar";
import { Outlet } from "react-router-dom";

export default function DaoLayout() {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <MFSSidebar></MFSSidebar>
      <div className="container mt-20 mb-10">
        <Outlet />
      </div>
    </div>
  );
}
