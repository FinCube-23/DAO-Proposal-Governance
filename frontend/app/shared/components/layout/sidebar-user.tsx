import type { GetStatusByEmailResponse } from '@/core/api/types';
import { useMutation } from '@tanstack/react-query';
import { BadgeCheck, ChevronsUpDown, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useDisconnect } from 'wagmi';
import { api } from '@/core/api/client';
import { ORGANIZATION_ENDPOINT } from '@/core/api/endpoints';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from '@/shared/components/ui/dialog';
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

interface Organization {
  name: string;
  email: string;
  type: string;
  location: string;
  is_approved: boolean;
  wallet_address: string;
  native_currency: string;
  certificate: string;
  membership_onchain_status: string;
}

interface Props {
  name: string;
  email: string;
  role: string;
  created_at: string;
  organization: Organization | null;
  avatar?: string;
}

function getStatusByEmail(payload: string) {
  return api.get<GetStatusByEmailResponse>(
    `${ORGANIZATION_ENDPOINT.BASE}/status-by-email?email=${payload}`,
  );
}

export default function SidebarUser({
  name,
  email,
  role,
  created_at,
  organization,
  avatar,
}: Props) {
  const { isMobile } = useSidebar();
  const { disconnect } = useDisconnect();
  const [dialogueOpen, setDialogueOpen] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const authStore = useAuthStore(state => state);
  const navigate = useNavigate();

  const getStatusMutation = useMutation({
    mutationFn: getStatusByEmail,
    onSuccess: (data) => {
      setStatus(data.membership_onchain_status);
    },
    onError: (error) => {
      console.error('Failed to fetch membership status', error);
      setStatus('Unknown');
    },
  });

  useEffect(() => {
    if (organization?.email) {
      getStatusMutation.mutate(organization.email);
    }
  }, [organization]);

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
              <Dialog open={dialogueOpen} onOpenChange={setDialogueOpen}>
                <DialogContent className="max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <h2 className="text-lg font-bold text-green-400">
                      User Profile
                    </h2>
                  </DialogHeader>
                  <div className="space-y-6">
                    {/* User Information Section */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-400">
                            Full Name
                          </p>
                          <p className="text-white font-semibold">{name}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-400">
                            Email
                          </p>
                          <p className="text-blue-300 break-all">{email}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-400">
                            User Role
                          </p>
                          <p className="text-purple-300 capitalize">{role}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-400">
                            Member Since
                          </p>
                          <p className="text-amber-300">
                            {new Date(created_at).toLocaleDateString(
                              undefined,
                              {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                              },
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Organization Information Section */}
                    <div className="border-t border-gray-700 pt-4">
                      <h3 className="text-md font-semibold text-green-400 mb-4">
                        Organization Profile
                      </h3>

                      <div className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-400">
                              Organization Name
                            </p>
                            <p className="text-white font-semibold">
                              {organization?.name}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-400">
                              Organization Email
                            </p>
                            <p className="text-blue-300">
                              {organization?.email}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-400">
                              Organization Type
                            </p>
                            <p className="text-purple-300">
                              {organization?.type}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-400">
                              Location
                            </p>
                            <p className="text-amber-300">
                              {organization?.location}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-400">
                              Wallet Address
                            </p>
                            <p className="text-blue-400 break-words font-mono text-sm">
                              {organization?.wallet_address
                                ? `${organization.wallet_address.slice(
                                  0,
                                  6,
                                )}...${organization.wallet_address.slice(-6)}`
                                : ''}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-400">
                              Native Currency
                            </p>
                            <p className="text-emerald-400">
                              {organization?.native_currency}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-400">
                              Membership Status
                            </p>
                            <span
                              className={`px-2 py-1 rounded ${
                                organization?.is_approved
                                  ? 'bg-green-600'
                                  : 'bg-yellow-600'
                              } text-xs`}
                            >
                              {organization?.is_approved
                                ? 'Approved'
                                : 'Pending'}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-400">
                              Proposal Status
                            </p>
                            <p className="text-cyan-400 capitalize">{status}</p>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-400">
                            Certificate
                          </p>
                          <a
                            href={organization?.certificate}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 underline break-words"
                          >
                            {organization?.certificate
                              || 'No certificate available'}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        disconnect();
                        authStore.clearAuthState();
                        navigate('/');
                      }}
                    >
                      <LogOut />
                      Log out
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              <div
                className="flex hover:bg-gray-800 items-center gap-2 px-1 py-1.5 text-left hover:cursor-pointer"
                onClick={() => setDialogueOpen(true)}
              >
                <BadgeCheck />
                Account
              </div>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex hover:bg-gray-800 items-center gap-2 px-1 py-1.5 text-left hover:cursor-pointer"
              onClick={() => {
                disconnect();
                authStore.clearAuthState();
                navigate('/');
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
