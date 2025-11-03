import { GalleryVerticalEnd, Layers, LayoutDashboard, ScrollTextIcon } from 'lucide-react';
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
        match: '/organization',
      },
    ],
  },
  {
    name: 'DAO',
    items: [
      {
        name: 'Overview',
        url: '/organization/dao/overview',
        icon: Layers,
        match: '/organization/dao/overview',
      },
      {
        name: 'Proposals',
        url: '/organization/dao/proposals/on-chain',
        icon: ScrollTextIcon,
        match: '/organization/dao/proposals',
      },
    ],
  },
  {
    name: 'Admin Panel',
    items: [
      {
        name: 'Dashboard',
        url: '/organization/admin/dashboard',
        icon: LayoutDashboard,
        match: '/organization/admin',
      },
    ],
  },
  {
    name: 'Audit Explorer',
    items: [
      {
        name: 'Dashboard',
        url: '/organization/audit/dashboard',
        icon: LayoutDashboard,
        match: '/organization/audit',
      },
    ],
  },
  {
    name: 'Audit Explorer',
    items: [
      {
        name: 'Dashboard',
        url: '/organization/audit/dashboard',
        icon: LayoutDashboard,
      },
    ],
  }
];

export default function OrgSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const authStore = useAuthStore(state => state);
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <BrandCard
          name={authStore.profile?.last_name || 'N/A'}
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
          name={`${authStore.profile?.first_name} ${authStore.profile?.last_name}` || 'N/A'}
          email={authStore.profile?.email || 'N/A'}
          contactNumber={authStore.profile?.contact_number || 'N/A'}
          isActive={authStore.profile?.is_active || false}
          isStaff={authStore.profile?.is_staff || false}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
