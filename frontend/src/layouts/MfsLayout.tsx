import { useAuth0 } from "@auth0/auth0-react";
import Loader from "@components/Loader";
import { Outlet, useNavigate } from "react-router-dom";
import AuthStateSyncer from "@components/AuthStateSyncer";
import { useEffect } from "react";

export default function MfsLayout() {
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth0();

    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthLoading && !isAuthenticated) {
            navigate("/mfs/login");
        }
    }, [isAuthLoading, isAuthenticated]);

    return (
        <div>
            <AuthStateSyncer />
            {isAuthLoading ? <Loader /> : <Outlet />}
        </div>
    );
}
