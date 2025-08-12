'use client';

import { ChevronRightIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { SidebarTrigger } from '@/shared/components/ui/sidebar';

export default function OrgHeader() {
  const pathnames = usePathname().split('/').filter(x => x);
  return (
    <div className="fixed flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6 w-full">
      <SidebarTrigger />
      <div
        data-orientation="vertical"
        role="none"
        className="shrink-0 bg-border w-[1px] mr-2 h-4"
      >
      </div>
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
  );
}
