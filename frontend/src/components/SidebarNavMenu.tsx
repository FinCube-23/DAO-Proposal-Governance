import { type LucideIcon } from "lucide-react";

import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@components/ui/sidebar";

import { useNavigate } from "react-router";

interface Props {
    name?: string;
    items: {
        name: string;
        url: string;
        icon: LucideIcon;
    }[];
}

export default function SidebarNavMenu({ name, items }: Props) {
    const navigate = useNavigate();
    return (
        <SidebarGroup>
            {name && <SidebarGroupLabel>{name}</SidebarGroupLabel>}
            <SidebarMenu>
                {items.map((item, idx) => (
                    <SidebarMenuItem
                        key={idx}
                        onClick={() => navigate(item.url)}
                    >
                        <SidebarMenuButton tooltip={item.name}>
                            {item.icon && <item.icon />}
                            <span>{item.name}</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
