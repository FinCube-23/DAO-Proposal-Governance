import { Button } from "@components/ui/button";
import { useAuth0 } from "@auth0/auth0-react";
import { LogOut } from "lucide-react";
import { useState } from "react";
import AuthDialog from "./AuthDialog";

export default function AuthButton() {
    const { isAuthenticated, logout } = useAuth0();
    const [isAuthDialogOpen, setIsAuthDialogOpen] = useState<boolean>(false);

    function openAuthModal() {
        setIsAuthDialogOpen(true);
    }

    return (
        <>
            <AuthDialog
                isOpen={isAuthDialogOpen}
                setOpen={setIsAuthDialogOpen}
            />
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
                <Button onClick={openAuthModal}>Log In</Button>
            )}
        </>
    );
}


