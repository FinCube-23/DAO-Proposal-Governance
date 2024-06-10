import { useAuth0 } from "@auth0/auth0-react";
import Loader from "@components/Loader";
import { Button } from "@components/ui/button";
import { useLazyFetchMeQuery } from "@redux/services/auth";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import MFSProfileForm from "@components/mfs/MFSProfileForm";
import AuthStateSyncer from "@components/AuthStateSyncer";
import MFSSidebar from "@components/mfs/MFSSidebar";
import MFSHeader from "@components/mfs/MFSHeader";
import { useDispatch } from "react-redux";
import { setUserProfile } from "@redux/slices/auth";

export default function MfsLayout() {
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
      if(isFetchMeSuccess){
        dispatch(setUserProfile(myData as any))
      }
    }, [isFetchMeSuccess])
    

    return (
        <div>
            <AuthStateSyncer />
            {isAuthLoading || isFetchMeLoading ? (
                <Loader />
            ) : isAuthenticated ? (
                <>
                    {isFetchMeSuccess && (
                        <>
                            {!myData.mfs ? (
                                <MFSProfileForm user_id={myData.id} />
                            ) : (
                                <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
                                    <MFSSidebar />
                                    <div className="flex flex-col">
                                        <MFSHeader />
                                        <div className="container mx-auto pt-6">
                                            <Outlet />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
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
