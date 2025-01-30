import { Outlet, useNavigate } from "react-router";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@redux/store";
import MFSRegistrationModal from "@components/auth/MFSRegistrationModal";
import MFSSidebar from "@components/mfs/MFSSidebar";
import { SidebarProvider, SidebarTrigger } from "@components/ui/sidebar";

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
        <div>
            <SidebarProvider>
                <MFSRegistrationModal />
                <MFSSidebar />
                <main className="w-full">
                    <SidebarTrigger />
                    <div className="container mx-auto">
                        <Outlet />
                    </div>
                </main>
            </SidebarProvider>
        </div>
    );
}
