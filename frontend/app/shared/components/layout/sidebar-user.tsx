import { BadgeCheck, ChevronsUpDown, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useDisconnect } from 'wagmi';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/shared/components/ui/sidebar';
import useAuthStore from '@/shared/stores/auth';

interface Props {
  name: string;
  email: string;
  organization?: string;
  contactNumber: string;
  isActive: boolean;
  isStaff: boolean;
  avatar?: string;
  role?: string;
}

export default function SidebarUser({
  name,
  email,
  avatar,
}: Props) {
  const { isMobile } = useSidebar();
  const { disconnect } = useDisconnect();
  const authStore = useAuthStore(state => state);
  const navigate = useNavigate();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={avatar} alt={name} />
                <AvatarFallback className="rounded-lg">
                  {name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{name}</span>
                <span className="truncate text-xs">{email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={avatar} alt={name} />
                  <AvatarFallback className="rounded-lg">
                    {name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{name}</span>
                  <span className="truncate text-xs">{email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              <div
                className="flex hover:bg-gray-800 items-center gap-2 px-1 py-1.5 text-left hover:cursor-pointer"
                onClick={() => navigate('/organization/profile')}
              >
                <BadgeCheck />
                Account
              </div>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex hover:bg-gray-800 items-center gap-2 px-1 py-1.5 text-left hover:cursor-pointer"
              onClick={() => {
                try {
                  authStore.clearAuthState();
                  disconnect();
                }
                catch (error) {
                  console.warn('Disconnect failed:', error);
                }
                finally {
                  navigate('/');
                }
              }}
            >
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
