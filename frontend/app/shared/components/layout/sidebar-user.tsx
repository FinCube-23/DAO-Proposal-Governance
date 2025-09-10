import type { GetStatusByEmailResponse } from '@/core/api/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import { BadgeCheck, ChevronsUpDown, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useDisconnect } from 'wagmi';
import { api } from '@/core/api/client';
import { ORGANIZATION_ENDPOINT } from '@/core/api/endpoints';
import { orgApis } from '@/core/services/org';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
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

interface Props {
  name: string;
  email: string;
  organization: string;
  contactNumber: string;
  isActive: boolean;
  isStaff: boolean;
  avatar?: string;
  role?: string;
}

function getStatusByEmail(payload: string) {
  return api.get<GetStatusByEmailResponse>(
    `${ORGANIZATION_ENDPOINT.BASE}/status-by-email?email=${payload}`,
  );
}

export default function SidebarUser({
  name,
  email,
  organization,
  contactNumber,
  isActive,
  isStaff,
  avatar,
}: Props) {
  const { isMobile } = useSidebar();
  const { disconnect } = useDisconnect();
  const [dialogueOpen, setDialogueOpen] = useState(false);
  const [_status, setStatus] = useState<string | null>(null);
  const authStore = useAuthStore(state => state);
  const navigate = useNavigate();

  // Get organization ID from user's organizations
  const orgId = authStore.profile?.organizations?.[0]?.id;

  // Fetch organization details
  const { data: organizationData, isLoading: _isLoadingOrg } = useQuery({
    queryKey: ['organization', orgId],
    queryFn: () => orgApis.getOrg(orgId!),
    enabled: !!orgId,
  });

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
    if (authStore.profile?.organizations?.[0]?.name) {
      getStatusMutation.mutate(authStore.profile.organizations[0].name);
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
                            Contact Number
                          </p>
                          <p className="text-blue-300 break-all">{contactNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-400">
                            Active Status
                          </p>
                          <Badge variant={isActive ? 'default' : 'secondary'} className={isActive ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}>
                            {isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-400">
                            Staff Status
                          </p>
                          <Badge variant={isStaff ? 'default' : 'secondary'} className={isStaff ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'}>
                            {isStaff ? 'Staff' : 'Not Staff'}
                          </Badge>
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
                              {organizationData?.name || authStore.profile?.organizations?.[0]?.name || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-400">
                              Organization Email
                            </p>
                            <p className="text-blue-300">
                              {organizationData?.email || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-400">
                              Organization Type
                            </p>
                            <p className="text-purple-300">
                              {organizationData?.type.toLocaleUpperCase() || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-400">
                              Location
                            </p>
                            <p className="text-amber-300">
                              {(organizationData as any)?.address || 'N/A'}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-400">
                              Admin Wallet Address
                            </p>
                            <p className="text-blue-400 break-words font-mono text-sm">
                              {(organizationData as any)?.organization_admin?.wallet_address
                                ? `${(organizationData as any).organization_admin.wallet_address.slice(
                                  0,
                                  6,
                                )}...${(organizationData as any).organization_admin.wallet_address.slice(-6)}`
                                : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-400">
                              Legal Entity ID
                            </p>
                            <p className="text-emerald-400">
                              {(organizationData as any)?.legal_entity_identifier || 'N/A'}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-400">
                              Organization Status
                            </p>
                            <span
                              className={`px-2 py-1 rounded ${
                                (organizationData as any)?.status === 'approved'
                                  ? 'bg-green-600'
                                  : 'bg-yellow-600'
                              } text-xs capitalize`}
                            >
                              {(organizationData as any)?.status || 'Pending'}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-400">
                              Admin Status
                            </p>
                            <span
                              className={`px-2 py-1 rounded ${
                                (organizationData as any)?.organization_admin?.status === 'approved'
                                  ? 'bg-blue-600'
                                  : 'bg-gray-600'
                              } text-xs capitalize`}
                            >
                              {(organizationData as any)?.organization_admin?.status || 'N/A'}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-400">
                            Organization Admin
                          </p>
                          <p className="text-green-300">
                            {(organizationData as any)?.organization_admin?.full_name || 'N/A'}
                          </p>
                          <p className="text-sm text-blue-300">
                            {(organizationData as any)?.organization_admin?.email || ''}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-400">
                              Created At
                            </p>
                            <p className="text-cyan-300 text-sm">
                              {(organizationData as any)?.created_at
                                ? new Date((organizationData as any).created_at).toLocaleDateString(
                                    undefined,
                                    {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    },
                                  )
                                : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-400">
                              Updated At
                            </p>
                            <p className="text-orange-300 text-sm">
                              {(organizationData as any)?.updated_at
                                ? new Date((organizationData as any).updated_at).toLocaleDateString(
                                    undefined,
                                    {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    },
                                  )
                                : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <Button
                      variant="secondary"
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
