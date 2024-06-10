import { useAuth0 } from "@auth0/auth0-react";
import Loader from "@components/Loader";
import { Button } from "@components/ui/button";
import { useLazyFetchMeQuery } from "@redux/services/auth";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import MFSProfileForm from "@components/mfs/MFSProfileForm";
import AuthStateSyncer from "@components/AuthStateSyncer";

export default function MfsLayout() {
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

    return (
        <div>
            <AuthStateSyncer />
            {isAuthLoading || isFetchMeLoading ? (
                <Loader />
            ) : isAuthenticated ? (
                <>
                    {isFetchMeSuccess && (
                        <>{!myData.mfs ? <MFSProfileForm /> : <Outlet />}</>
                    )}
                </>
            ) : (
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
                            <Button
                                variant="destructive"
                                onClick={() => navigate("/")}
                            >
                                Back to Home
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
