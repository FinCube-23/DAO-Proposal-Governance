import { GalleryVerticalEnd, Landmark, LayoutDashboard } from "lucide-react";
import SidebarNavMenu from "@components/SidebarNavMenu";
import SidebarUser from "@components/SidebarUser";
import BrandCard from "@components/BrandCard";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@components/ui/sidebar";
import { useSelector } from "react-redux";
import { RootState } from "@redux/store";

const menus = [
  {
    name: "Organization",
    items: [
      {
        name: "Dashboard",
        url: "/organization/dashboard",
        icon: LayoutDashboard,
      },
      {
        name: "FinCube",
        url: "/organization/dao/fincube",
        icon: Landmark,
      },
    ],
  },
  {
    name: "Admin Panel",
    items: [
      {
        name: "Dashboard",
        url: "/admin/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
];

export default function MFSSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const auth = useSelector(
    (state: RootState) => state.persistedReducer.authReducer
  );
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <BrandCard
          name={auth.profile?.organization?.name || "N/A"}
          logo={GalleryVerticalEnd}
          type="MFS"
        />
      </SidebarHeader>
      <SidebarContent>
        {menus.map((menu) => (
          <SidebarNavMenu name={menu.name} items={menu.items} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarUser
          name={auth.profile?.name || "N/A"}
          email={auth.profile?.email || "N/A"}
          role={auth.profile?.role || "N/A"}
          created_at={auth.profile?.created_at || "N/A"}
          mfsBusiness={auth.profile?.organization || null}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
