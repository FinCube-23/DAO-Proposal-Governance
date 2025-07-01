import { Button } from "@components/ui/button";
import { useAuth0 } from "@auth0/auth0-react";
import { LogOut } from "lucide-react";

export default function LoginButton() {
    const { loginWithPopup, isAuthenticated, logout } = useAuth0();
    return (
        <>
            {isAuthenticated ? (
                <Button
                    className="rounded-xl"
                    variant="destructive"
                    onClick={() =>
                        logout({
                            logoutParams: {
                                returnTo: import.meta.env
                                    .VITE_AUTH0_LOGOUT_REDIRECT,
                            },
                        })
                    }
                >
                    <LogOut size={20} />
                </Button>
            ) : (
                <Button
                    onClick={() =>
                        loginWithPopup({
                            authorizationParams: {
                                user_type: "USER",
                            },
                        })
                    }
                >
                    Log In
                </Button>
            )}
        </>
    );
}
