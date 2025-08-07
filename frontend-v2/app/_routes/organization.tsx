import { Outlet, useNavigate } from "react-router";
import { useEffect } from "react";
import MFSRegistrationModal from "@components/auth/MFSRegistrationModal";
import { SidebarProvider } from "@/shared/components/ui/sidebar";
import useAuthStore from "@/shared/stores/auth";
import OrgHeader from "@/shared/components/layout/org-header";
import OrgSidebar from "@/shared/components/layout/org-sidebar";

export default function MfsLayout() {
    const navigate = useNavigate();
    const authStoreState = useAuthStore(state => state);

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
                <OrgSidebar />
                <main className="w-full h-screen">
                    <OrgHeader />
                    <div className="container mx-auto mt-24 h-full">
                        <Outlet />
                    </div>
                </main>
            </SidebarProvider>
        </div>
    );
}
