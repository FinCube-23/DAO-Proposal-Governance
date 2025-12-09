import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ChevronRightIcon } from 'lucide-react';
import React from 'react';
import { Link, useLocation } from 'react-router';

import { Separator } from '@/shared/components/ui/separator';
import { SidebarTrigger } from '@/shared/components/ui/sidebar';
import StatusIndicators from './status-indicators';

const blacklistedRoutesTitle = [''];

export default function OrgHeader() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  return (
    <div className="flex fixed bg-sidebar backdrop-blur-xl top-0 w-full shrink-0 items-center gap-2 border-b px-2 sm:px-4 py-3 sm:py-4 z-30">
      <div className="flex flex-1 items-center gap-2 px-1 sm:px-3 min-w-0">
        <div className="relative z-40">
          <SidebarTrigger />
        </div>
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4 hidden sm:block"
        />
        <StatusIndicators />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4 hidden sm:block"
        />
        <div className="flex items-center gap-2 sm:gap-5 capitalize text-sm sm:text-base overflow-x-auto scrollbar-hide">
          {pathnames.map((name, index) => {
            const routeTo = `/${pathnames
              .slice(0, index + 1)
              .join('/')}`;
            const isLast = index === pathnames.length - 1;

            if (isLast) {
              return <span key={name} className="text-muted-foreground whitespace-nowrap">{name}</span>;
            }
            else if (blacklistedRoutesTitle.includes(name)) {
              return (
                <React.Fragment key={name}>
                  <span key={name} className="text-muted-foreground whitespace-nowrap">{name}</span>
                  <ChevronRightIcon className="flex-shrink-0 w-4 h-4" />
                </React.Fragment>
              );
            }
            return (
              <React.Fragment key={name}>
                <span className="hover:underline whitespace-nowrap">
                  <Link to={routeTo}>{name}</Link>
                </span>
                <ChevronRightIcon className="flex-shrink-0 w-4 h-4" />
              </React.Fragment>
            );
          })}
        </div>
      </div>
      <div className="ml-auto flex items-center gap-2 flex-shrink-0 relative z-40">
        <div className="md:-translate-x-66 scale-75 sm:scale-90 lg:scale-100 origin-right">
          <ConnectButton />
        </div>
      </div>
    </div>
  );
}
