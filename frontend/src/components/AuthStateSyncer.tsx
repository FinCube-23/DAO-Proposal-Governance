import { useAuth0 } from "@auth0/auth0-react";
import { setAuthData } from "@redux/slices/auth";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export default function AuthStateSyncer() {
    const { isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
    const dispatch = useDispatch();
    useEffect(() => {
        if (isAuthenticated && !isLoading) {
            getAccessTokenSilently().then((token) => {
                localStorage.setItem("token", token);
                dispatch(setAuthData({ access: token }));
            });
        }
    }, [isAuthenticated, isLoading]);
    return <></>;
}
