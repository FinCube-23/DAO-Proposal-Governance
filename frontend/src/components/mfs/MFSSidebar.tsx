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
        items: [
            {
                name: "Dashboard",
                url: "/mfs/dashboard",
                icon: LayoutDashboard,
            },
        ],
    },
    {
        name: "DAO",
        items: [
            {
                name: "FinCube",
                url: "/mfs/dao/fincube",
                icon: Landmark,
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
                    name={auth.profile?.mfsBusiness?.name || "N/A"}
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
                />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
