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
                    onClick={() => logout()}
                >
                    <LogOut size={20} />
                </Button>
            ) : (
                <Button onClick={() => loginWithPopup()}>Log In</Button>
            )}
        </>
    );
}
