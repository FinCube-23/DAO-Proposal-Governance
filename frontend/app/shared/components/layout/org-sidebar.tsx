import {
  Building2,
  GalleryVerticalEnd,
  Layers,
  LayoutDashboard,
  ScrollTextIcon,
  ShieldCheck,
  Users,
} from "lucide-react";
import BrandCard from "@/shared/components/layout/brand-card";
import SidebarNavMenu from "@/shared/components/layout/sidebar-nav-menu";
import SidebarUser from "@/shared/components/layout/sidebar-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/shared/components/ui/sidebar";
import useAuthStore from "@/shared/stores/auth";

const menus = [
  {
    name: "",
    items: [
      {
        name: "Dashboard",
        url: "/organization",
        icon: LayoutDashboard,
        match: "/organization",
      },
    ],
  },
  {
    name: "DAO",
    items: [
      {
        name: "Overview",
        url: "/organization/dao/overview",
        icon: Layers,
        match: "/organization/dao/overview",
      },
      {
        name: "Proposals",
        url: "/organization/dao/proposals/on-chain",
        icon: ScrollTextIcon,
        match: "/organization/dao/proposals",
      },
    ],
  },
  // {
  //   name: 'Admin Panel',
  //   items: [
  //     {
  //       name: 'Dashboard',
  //       url: '/organization/admin/dashboard',
  //       icon: LayoutDashboard,
  //       match: '/organization/admin/dashboard',
  //     },
  //     {
  //       name: 'Organizations',
  //       url: '/organization/admin/organizations',
  //       icon: Building2,
  //       match: '/organization/admin/organizations',
  //     },
  //     {
  //       name: 'Users',
  //       url: '/organization/admin/users',
  //       icon: Users,
  //       match: '/organization/admin/users',
  //     },
  //     // {
  //     //   name: "Transactions",
  //     //   url: "/organization/admin/transactions",
  //     //   icon: History,
  //     //   match: "/organization/admin/transactions",
  //     // },
  //     {
  //       name: 'Onchain Verifications',
  //       url: '/organization/admin/onchain-verifications',
  //       icon: ShieldCheck,
  //       match: '/organization/admin/onchain-verifications',
  //     },
  //   ],
  // },
  {
    name: "Admin Panel",
    items: [
      {
        name: "Dashboard",
        url: "/organization/superadmin/dashboard",
        icon: LayoutDashboard,
        match: "/organization/superadmin/dashboard",
      },
      {
        name: "Organizations",
        url: "/organization/superadmin/organizations",
        icon: Building2,
        match: "/organization/superadmin/organizations",
      },
      {
        name: "Users",
        url: "/organization/superadmin/users",
        icon: Users,
        match: "/organization/superadmin/users",
      },
      // {
      //   name: "Transactions",
      //   url: "/organization/superadmin/transactions",
      //   icon: History,
      //   match: "/organization/superadmin/transactions",
      // },
      {
        name: "Onchain Verifications",
        url: "/organization/superadmin/onchain-verifications",
        icon: ShieldCheck,
        match: "/organization/superadmin/onchain-verifications",
      },
    ],
  },
  {
    name: "Audit Explorer",
    items: [
      {
        name: "Dashboard",
        url: "/organization/audit/dashboard",
        icon: LayoutDashboard,
        match: "/organization/audit",
      },
    ],
  },
];

export default function OrgSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const authStore = useAuthStore((state) => state);
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <BrandCard
          name={authStore.profile?.last_name || "N/A"}
          logo={GalleryVerticalEnd}
          type="Org."
        />
      </SidebarHeader>
      <SidebarContent>
        {menus.map((menu) => (
          <SidebarNavMenu key={menu.name} name={menu.name} items={menu.items} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarUser
          name={
            `${authStore.profile?.first_name} ${authStore.profile?.last_name}` ||
            "N/A"
          }
          email={authStore.profile?.email || "N/A"}
          contactNumber={authStore.profile?.contact_number || "N/A"}
          isActive={authStore.profile?.is_active || false}
          isStaff={authStore.profile?.is_staff || false}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
