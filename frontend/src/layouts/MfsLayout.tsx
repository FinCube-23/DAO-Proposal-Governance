import { Outlet, useNavigate } from "react-router";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@redux/store";
import MFSRegistrationModal from "@components/auth/MFSRegistrationModal";
import MFSSidebar from "@components/mfs/MFSSidebar";
import { SidebarProvider } from "@components/ui/sidebar";
import MFSHeader from "@components/mfs/MFSHeader";

export default function MfsLayout() {
    const navigate = useNavigate();
    const authStoreState = useSelector(
        (state: RootState) => state.persistedReducer.authReducer
    );

    useEffect(() => {
        if (!authStoreState.access && authStoreState.profile?.role != "mfs") {
            navigate("/");
        }
    }, [authStoreState, navigate]);

    return (
        <div className="w-full bg-black bg-grid-small-white/[0.2] relative flex items-center justify-center">
            <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
            <SidebarProvider className="z-50">
                <MFSRegistrationModal />
                <MFSSidebar />
                <main className="w-full h-screen">
                    <MFSHeader />
                    <div className="container mx-auto mt-24 h-full">
                        <Outlet />
                    </div>
                </main>
            </SidebarProvider>
        </div>
    );
}
