import { Button } from "@components/ui/button";
import { useAuth0 } from "@auth0/auth0-react";
import { LogOut } from "lucide-react";
import { useState } from "react";
import AuthDialog from "./AuthDialog";
import { useDispatch } from "react-redux";
import { clearAuth } from "@redux/slices/auth";

export default function AuthButton() {
    const { isAuthenticated, logout } = useAuth0();
    const [isAuthDialogOpen, setIsAuthDialogOpen] = useState<boolean>(false);
    const dispatch = useDispatch();

    function openAuthModal() {
        setIsAuthDialogOpen(true);
    }

    const handleLogout = () => {
        dispatch(clearAuth());

        logout({
            logoutParams: {
                returnTo: import.meta.env.VITE_AUTH0_LOGOUT_REDIRECT,
            },
        });
    };

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
                    onClick={handleLogout}
                >
                    <LogOut size={20} />
                </Button>
            ) : (
                <Button onClick={openAuthModal}>Log In</Button>
            )}
        </>
    );
}
