import MFSHeader from "@components/mfs/MFSHeader";
import MFSSidebar from "@components/mfs/MFSSidebar";
import { Outlet } from "react-router-dom";

export default function MFSPrivateLayout() {
    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <MFSSidebar />
            <div className="flex flex-col">
                <MFSHeader />
                <div className="container mx-auto pt-6">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
