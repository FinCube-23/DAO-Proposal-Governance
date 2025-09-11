import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ChevronRightIcon } from 'lucide-react';
import React from 'react';
import { Link, useLocation } from 'react-router';
import { SidebarTrigger } from '@/shared/components/ui/sidebar';
import useAuthStore from '@/shared/stores/auth';
import { Separator } from '../ui/separator';

const blacklistedRoutesTitle = [''];

export default function OrgHeader() {
  const location = useLocation();
  const profile = useAuthStore(state => state.profile);
  const pathnames = location.pathname.split('/').filter(x => x);

  // Calculate top position based on whether user status notification is shown
  const hasUserStatusNotification = profile?.status === 'pending' || profile?.status === 'approved';
  const topPosition = hasUserStatusNotification ? 'top-[52px]' : 'top-0';

  return (
    <div className={`flex fixed bg-sidebar backdrop-blur-xl ${topPosition} w-full shrink-0 items-center gap-2 border-b px-2 py-4 z-50`}>
      <div className="flex flex-1 items-center gap-2 px-3">
        <SidebarTrigger />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <div className="flex items-center gap-5 capitalize">
          {pathnames.map((name, index) => {
            const routeTo = `/${pathnames
              .slice(0, index + 1)
              .join('/')}`;
            const isLast = index === pathnames.length - 1;

            if (isLast) {
              return <span key={name} className="text-muted-foreground">{name}</span>;
            }
            else if (blacklistedRoutesTitle.includes(name)) {
              return (
                <React.Fragment key={name}>
                  <span key={name} className="text-muted-foreground">{name}</span>
                  <ChevronRightIcon />
                </React.Fragment>
              );
            }
            return (
              <React.Fragment key={name}>
                <span className="hover:underline">
                  <Link to={routeTo}>{name}</Link>
                </span>
                <ChevronRightIcon />
              </React.Fragment>
            );
          })}
        </div>
      </div>
      <div className="ml-auto">
        <div className="-translate-x-66">
          <ConnectButton />
        </div>
      </div>
    </div>
  );
}
