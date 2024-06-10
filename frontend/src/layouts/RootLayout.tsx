import AuthStateSyncer from "@components/AuthStateSyncer";
import Header from "@components/Header";
import { Outlet } from "react-router-dom";

export default function RootLayout() {
    return (
        <>
            <div>
                <AuthStateSyncer />
                <Header />
                <Outlet />
            </div>
        </>
    );
}
