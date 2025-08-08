import type { LucideIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
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
  }[];
}

export default function SidebarNavMenu({ name, items }: Props) {
  const router = useRouter();
  return (
    <SidebarGroup>
      {name && <SidebarGroupLabel>{name}</SidebarGroupLabel>}
      <SidebarMenu>
        {items.map((item, idx) => (
          <SidebarMenuItem
            key={idx}
            onClick={() => router.push(item.url)}
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
