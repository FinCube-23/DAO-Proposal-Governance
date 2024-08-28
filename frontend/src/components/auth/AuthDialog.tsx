import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@components/ui/button";
import { Dialog, DialogContent, DialogFooter } from "@components/ui/dialog";
import { Building2, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  isOpen: boolean;
  setOpen: any;
}
export default function AuthDialog({ isOpen, setOpen }: Props) {
  const { loginWithRedirect } = useAuth0();
  const navigate = useNavigate();

  function handleLogin(type: string) {
    setOpen(false);
    loginWithRedirect({
      authorizationParams: {
        user_type: type,
        redirect_uri: import.meta.env.VITE_AUTH0_LOGIN_REDIRECT,
      },
    });
  }
  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="min-h-64 flex flex-col justify-between border">
        <div className="pb-5"></div>
        <div className="flex justify-center gap-10">
          <Button
            className="p-5 rounded-xl h-20"
            onClick={() => {
              navigate("/user-login");
              window.location.reload();
            }}
          >
            <div className="flex flex-col items-center">
              <User />
              <div>Login as User</div>
            </div>
          </Button>
          <Button
            className="p-5 rounded-xl h-20"
            onClick={() => handleLogin("MFS")}
          >
            <div className="flex flex-col items-center">
              <Building2 />
              <div>Login as MFS</div>
            </div>
          </Button>
        </div>
        <DialogFooter>
          <Button variant="destructive" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
