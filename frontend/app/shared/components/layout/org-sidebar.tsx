'use client';

import { GalleryVerticalEnd, Landmark, LayoutDashboard } from 'lucide-react';
import BrandCard from '@/shared/components/layout/brand-card';
import SidebarNavMenu from '@/shared/components/layout/sidebar-nav-menu';
import SidebarUser from '@/shared/components/layout/sidebar-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/shared/components/ui/sidebar';
import useAuthStore from '@/shared/stores/auth';

const menus = [
  {
    name: '',
    items: [
      {
        name: 'Dashboard',
        url: '/organization',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    name: 'DAOs',
    items: [
      {
        name: 'Fincube',
        url: '/organization/dao/fincube',
        icon: Landmark,
      },
    ],
  },
  {
    name: 'Admin Panel',
    items: [
      {
        name: 'Dashboard',
        url: '/admin/dashboard',
        icon: LayoutDashboard,
      },
    ],
  },
];

export default function OrgSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const authStore = useAuthStore(state => state);
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <BrandCard
          name={authStore.profile?.organization?.name || 'N/A'}
          logo={GalleryVerticalEnd}
          type="Org."
        />
      </SidebarHeader>
      <SidebarContent>
        {menus.map(menu => (
          <SidebarNavMenu key={menu.name} name={menu.name} items={menu.items} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarUser
          name={authStore.profile?.name || 'N/A'}
          email={authStore.profile?.email || 'N/A'}
          role={authStore.profile?.role || 'N/A'}
          created_at={authStore.profile?.created_at || 'N/A'}
          organization={authStore.profile?.organization || null}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
