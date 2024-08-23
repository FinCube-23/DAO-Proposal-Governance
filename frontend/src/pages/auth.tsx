import { useAuth0 } from "@auth0/auth0-react";
import Loader from "@components/Loader";
import { useLazyFetchMeQuery } from "@redux/services/auth";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUserProfile, clearAuth, setAuthData } from "@redux/slices/auth";
import { toast } from "sonner";

export default function Auth() {
    const { isAuthenticated, isLoading, logout, getAccessTokenSilently } =
        useAuth0();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [
        fetchMe,
        {
            data: myData,
            isLoading: isFetchMeLoading,
            isSuccess: isFetchMeSuccess,
        },
    ] = useLazyFetchMeQuery();

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            getAccessTokenSilently().then((token) => {
                localStorage.setItem("token", token);
                dispatch(setAuthData({ access: token }));
                fetchMe();
            });
        }
    }, [isAuthenticated, isLoading]);

    useEffect(() => {
        if (isFetchMeSuccess) {
            console.log("myData ", myData);
            if (!myData) {
                dispatch(clearAuth());
                toast.error("This user is not registered in backend DB");
                // logout();
                console.log("SADSAD")
            } else {
                if (myData.role == "MFS") {
                    dispatch(setUserProfile(myData as any));
                    if (!myData.mfs) {
                        navigate("/mfs/registration");
                    } else {
                        navigate("/mfs");
                    }
                } else {
                    navigate("/");
                }
            }
        }
    }, [isFetchMeSuccess]);

    return (
        <div className="h-screen flex flex-col items-center justify-center">
            {isLoading || (isFetchMeLoading && <Loader />)}
        </div>
    );
}
