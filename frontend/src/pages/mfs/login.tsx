import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@components/ui/button";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUserProfile } from "@redux/slices/auth";
import { useLazyFetchMeQuery } from "@redux/services/auth";
import { useEffect } from "react";

export default function Login() {
    const dispatch = useDispatch();
    const {
        isAuthenticated,
        isLoading: isAuthLoading,
        loginWithPopup,
    } = useAuth0();
    const navigate = useNavigate();

    const [
        fetchMe,
        {
            data: myData,
            isLoading: isFetchMeLoading,
            isSuccess: isFetchMeSuccess,
        },
    ] = useLazyFetchMeQuery();

    useEffect(() => {
        if (isAuthenticated && !isAuthLoading) {
            fetchMe();
        }
    }, [isAuthenticated, isAuthLoading]);

    useEffect(() => {
        if (isFetchMeSuccess) {
            dispatch(setUserProfile(myData as any));

            if (!myData.mfs) {
                navigate("/mfs/registration");
            }else{
                navigate("/mfs");
            }
        }
    }, [isFetchMeSuccess]);

    return (
        <div className="w-full h-screen flex justify-center items-center">
            <div className="flex flex-col gap-5 items-center">
                <Button
                    onClick={() =>
                        loginWithPopup({
                            authorizationParams: {
                                user_type: "MFS",
                            },
                        })
                    }
                    size="lg"
                >
                    Login as MFS Admin
                </Button>
                <div>
                    <Button variant="destructive" onClick={() => navigate("/")} isLoading={isFetchMeLoading}>
                        Back to Home
                    </Button>
                </div>
            </div>
        </div>
    );
}
