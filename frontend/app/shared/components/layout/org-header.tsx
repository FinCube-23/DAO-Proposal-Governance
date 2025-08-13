'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ChevronRightIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { SidebarTrigger } from '@/shared/components/ui/sidebar';
import { Separator } from '../ui/separator';

export default function OrgHeader() {
  const pathnames = usePathname().split('/').filter(x => x);
  return (
    <div className="flex sticky bg-sidebar/60 top-0 w-full shrink-0 items-center gap-2 border-b py-4 px-2">
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
            return (
              <React.Fragment key={name}>
                <span className="hover:underline">
                  <Link href={routeTo}>{name}</Link>
                </span>
                <ChevronRightIcon />
              </React.Fragment>
            );
          })}
        </div>
      </div>
      <div className="ml-auto">
        <ConnectButton />
      </div>
    </div>
  );
}
