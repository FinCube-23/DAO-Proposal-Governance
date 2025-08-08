import { LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useDisconnect } from 'wagmi';
import { env } from '@/core/env';
import useAuthStore from '@/shared/stores/auth';
import { Button } from '../ui/button';

export default function Header() {
  const router = useRouter();
  const authStore = useAuthStore(state => state);
  const { disconnect } = useDisconnect();
  const pathname = usePathname();

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
            <Link href="/" className="text-white font-bold text-xl">
              {env.NEXT_PUBLIC_APP_NAME}
            </Link>
          </div>
          <div>
            <ul className="flex space-x-4">
              <li>
                {authStore.access
                  ? (
                      <Button
                        className="rounded-xl"
                        variant="destructive"
                        onClick={() => {
                          disconnect();
                          authStore.clearAuthState();
                          router.push('/');
                        }}
                      >
                        <LogOut size={20} />
                      </Button>
                    )
                  : (
                      <Button
                        onClick={() => {
                          router.push('/login');
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
