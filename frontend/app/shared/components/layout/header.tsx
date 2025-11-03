import { LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useDisconnect } from 'wagmi';
import { env } from '@/core/env';
import useAuthStore from '@/shared/stores/auth';
import { Button } from '../ui/button';

export default function Header() {
  const navigate = useNavigate();
  const authStore = useAuthStore(state => state);
  const { disconnect } = useDisconnect();
  const location = useLocation();

  // Only show header on specific routes
  const allowedRoutes = ['/', '/login', '/register'];
  const shouldShowHeader = allowedRoutes.includes(location.pathname);

  if (!shouldShowHeader) {
    return null;
  }

  return (
    <div className="w-full z-50 fixed top-0">
      <nav className="navbar-gradient p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <Link to="/" className="text-white font-bold text-xl">
              {env.VITE_APP_NAME}
            </Link>
          </div>
          <div>
            <ul className="flex space-x-4">
              {authStore.access
                ? (
                    <li>
                      <Button
                        className="rounded-xl"
                        variant="destructive"
                        onClick={() => {
                          try {
                            authStore.clearAuthState();
                            disconnect();
                          }
                          catch (error) {
                            console.warn('Disconnect failed:', error);
                          }
                          finally {
                            navigate('/');
                          }
                        }}
                      >
                        <LogOut size={20} />
                      </Button>
                    </li>
                  )
                : (
                    <>
                      <li>
                        <Button
                          onClick={() => {
                            navigate('/login');
                          }}
                        >
                          Login
                        </Button>
                      </li>
                      <li>
                        <Button
                          variant="outline"
                          onClick={() => {
                            navigate('/register');
                          }}
                        >
                          Register
                        </Button>
                      </li>
                    </>
                  )}
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
}
