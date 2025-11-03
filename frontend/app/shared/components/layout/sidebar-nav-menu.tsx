import type { LucideIcon } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/shared/components/ui/sidebar';

interface Props {
  name?: string;
  items: {
    name: string;
    url: string;
    icon: LucideIcon;
    match: string;
  }[];
}

export default function SidebarNavMenu({ name, items }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  function isActiveRoute(routeMatch: string): boolean {
    if (routeMatch === '/organization') {
      return routeMatch === location.pathname;
    }
    return location.pathname.includes(routeMatch);
  }

  return (
    <SidebarGroup>
      {name && <SidebarGroupLabel>{name}</SidebarGroupLabel>}
      <SidebarMenu>
        {items.map((item, idx) => {
          return (
            <SidebarMenuItem
              key={idx}
              onClick={() => navigate(item.url)}
            >
              <SidebarMenuButton tooltip={item.name} isActive={isActiveRoute(item.match)}>
                {item.icon && <item.icon />}
                <span>{item.name}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
