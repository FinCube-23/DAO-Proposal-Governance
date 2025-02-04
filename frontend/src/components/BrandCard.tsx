import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@components/ui/sidebar";
import { GalleryVerticalEnd } from "lucide-react";

export const activeTeam = {
    name: "Acme Inc",
    logo: GalleryVerticalEnd,
    plan: "Enterprise",
};

interface Props {
    name: string;
    logo: React.ElementType;
    type: string;
}

export default function BrandCard(data: Props) {
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                        <data.logo className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">
                            {data.name}
                        </span>
                        <span className="truncate text-xs">
                            {data.type}
                        </span>
                    </div>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
