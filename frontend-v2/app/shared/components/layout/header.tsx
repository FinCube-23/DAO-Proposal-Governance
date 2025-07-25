import { Link, useLocation, useNavigate } from "react-router";
import { LogOut } from "lucide-react";
import { useDisconnect } from "wagmi";
import { Button } from "../ui/button";
import useAuthStore from "@/shared/stores/auth";

export default function Header() {
  const navigate = useNavigate();
  const authStore = useAuthStore((state) => state);
  const { disconnect } = useDisconnect();
  const pathname = useLocation().pathname;

  // Only show header on specific routes
  const allowedRoutes = ['/', '/login', '/register'];
  const shouldShowHeader = allowedRoutes.includes(pathname);

  if (!shouldShowHeader) {
    return null;
  }

  return (
    <div className="w-full z-50 fixed top-0">
      <nav className="navbar-gradient p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <Link to="/" className="text-white font-bold text-xl">
              {import.meta.env.VITE_APP_NAME || "Brand"}
            </Link>
          </div>
          <div>
            <ul className="flex space-x-4">
              <li>
                {authStore.access ? (
                  <Button
                    className="rounded-xl"
                    variant="destructive"
                    onClick={() => {
                      disconnect();
                      authStore.clearAuthState();
                      navigate("/");
                    }}
                  >
                    <LogOut size={20} />
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      navigate("/login");
                    }}
                  >
                    Login
                  </Button>
                )}
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
}
