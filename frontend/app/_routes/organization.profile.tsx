import type { ColumnDef } from '@tanstack/react-table';
import type { OrgUser } from '@/core/services/org/types';
import { useQuery } from '@tanstack/react-query';
import { Check, Copy, Loader2, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useDisconnect } from 'wagmi';

import { orgApis } from '@/core/services/org';
import CustomPagination from '@/shared/components/custom-pagination';
import { DataTable } from '@/shared/components/dashboard/data-table';
import { TimeDisplay } from '@/shared/components/time-display';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card';
import useAuthStore from '@/shared/stores/auth';
import { cn, STATUS_BADGE_CONFIG } from '@/shared/utils';

const USER_STATUS_CONFIG: Record<string, keyof typeof STATUS_BADGE_CONFIG> = {
  approved: 'approved',
  pending: 'pending',
  rejected: 'failed',
  banned: 'failed',
};

const columns: ColumnDef<OrgUser>[] = [
  {
    accessorKey: 'first_name',
    header: 'Name',
    enableSorting: false,
    cell: ({ row }) => (
      <div className="font-medium">
        {`${row.original.first_name} ${row.original.last_name}`}
      </div>
    ),
  },
  {
    accessorKey: 'email',
    header: 'Email',
    enableSorting: false,
    cell: ({ row }) => (
      <div className="text-blue-300">{row.getValue('email')}</div>
    ),
  },
  {
    accessorKey: 'contact_number',
    header: 'Contact',
    enableSorting: false,
  },
  {
    accessorKey: 'wallet_address',
    header: 'Wallet Address',
    enableSorting: false,
    cell: ({ row }) => {
      const address = row.getValue('wallet_address') as string | null;
      if (!address) {
        return <span className="text-gray-400 text-xs">Not connected</span>;
      }
      return (
        <div className="font-mono text-xs">
          {`${address.slice(0, 6)}...${address.slice(-4)}`}
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    enableSorting: false,
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      const txStatus = USER_STATUS_CONFIG[status] || 'pending';
      const config = STATUS_BADGE_CONFIG[txStatus];
      const dotColor
        = txStatus === 'approved'
          ? 'bg-green-600'
          : txStatus === 'failed'
            ? 'bg-red-600'
            : 'bg-amber-600';
      return (
        <Badge
          variant="secondary"
          className={cn('capitalize', config.color, txStatus === 'pending' && 'animate-pulse')}
        >
          <span className={cn('inline-block w-2 h-2 rounded-full mr-1', dotColor)} />
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'is_active',
    header: 'Active',
    enableSorting: false,
    cell: ({ row }) => (
      <Badge className={row.original.is_active ? 'text-green-400' : 'text-red-400'} variant="outline">
        {row.original.is_active ? 'Yes' : 'No'}
      </Badge>
    ),
  },
  {
    accessorKey: 'date_joined',
    header: 'Joined',
    cell: ({ row }) => (
      <TimeDisplay timestamp={row.getValue('date_joined')} enableToggle className="text-xs" />
    ),
  },
];

const USERS_LIMIT = 10;

export default function UserProfile() {
  const authStore = useAuthStore(state => state);
  const navigate = useNavigate();
  const { disconnect } = useDisconnect();
  const [usersPage, setUsersPage] = useState(1);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const profile = authStore.profile;

  // Get organization ID from user's organizations
  const orgId = profile?.organizations?.[0]?.id;

  // Fetch organization details
  const { data: organizationData, isLoading: isLoadingOrg } = useQuery({
    queryKey: ['organization', orgId],
    queryFn: () => orgApis.getOrg(orgId!),
    enabled: !!orgId,
  });

  // Fetch organization users
  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['organization-users', orgId, usersPage],
    queryFn: () => orgApis.getUsersByOrg(orgId!, { page: usersPage, limit: USERS_LIMIT }),
    enabled: !!orgId,
  });

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const handleLogout = () => {
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
  };

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col-reverse sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
          User Profile
        </h1>
        <Button
          variant="destructive"
          onClick={handleLogout}
          className="gap-1.5 sm:gap-2 text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4 h-8 sm:h-10 self-end sm:self-auto"
        >
          <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
          Log out
        </Button>
      </div>

      {/* User Information Section */}
      <div className="bg-sidebar border border-gray-700 rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6">
        <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-green-400 border-b border-gray-700 pb-2">
          Personal Information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-400">Full Name</p>
            <p className="text-sm sm:text-base text-white font-semibold break-words mt-1">
              {`${profile.first_name} ${profile.last_name}`}
            </p>
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-medium text-gray-400">Email</p>
            <p className="text-sm sm:text-base text-blue-300 break-all mt-1">
              {profile.email}
            </p>
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-medium text-gray-400">Contact Number</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm sm:text-base text-blue-300 break-all">
                {profile.contact_number}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 flex-shrink-0"
                onClick={() => copyToClipboard(profile.contact_number, 'contact')}
              >
                {copiedField === 'contact'
                  ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    )
                  : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
              </Button>
            </div>
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-400">Active Status</p>
            <span
              className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm capitalize mt-1 border font-medium ${
                profile.is_active
                  ? 'bg-green-500/20 border-green-500/20 text-green-400'
                  : 'bg-red-500/20 border-red-500/20 text-red-400'
              }`}
            >
              {profile.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-400">Staff Status</p>
            <span
              className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm capitalize mt-1 border font-medium ${
                profile.is_staff
                  ? 'bg-blue-500/20 border-blue-500/20 text-blue-400'
                  : 'bg-gray-500/20 border-gray-500/20 text-gray-400'
              }`}
            >
              {profile.is_staff ? 'Staff' : 'Not Staff'}
            </span>
          </div>
        </div>
      </div>

      {/* Organization Information Section */}
      {isLoadingOrg
        ? (
            <div className="bg-sidebar border border-gray-700 rounded-lg p-6 flex items-center justify-center min-h-[200px]">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          )
        : (
            <div className="bg-sidebar border border-gray-700 rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6">
              <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-green-400 border-b border-gray-700 pb-2">
                Organization Profile
              </h2>

              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-400">
                      Organization Name
                    </p>
                    <p className="text-sm sm:text-base text-white font-semibold break-words mt-1">
                      {organizationData?.name || profile.organizations?.[0]?.name || 'N/A'}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-400">
                      Organization Email
                    </p>
                    <p className="text-sm sm:text-base text-blue-300 break-all mt-1">
                      {organizationData?.email || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-400">
                      Organization Type
                    </p>
                    <p className="text-sm sm:text-base text-purple-300 mt-1">
                      {organizationData?.type.toLocaleUpperCase() || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-400">Location</p>
                    <p className="text-sm sm:text-base text-amber-300 break-words mt-1">
                      {(organizationData as any)?.address || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-400">
                      Admin Wallet Address
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs sm:text-sm text-blue-400 break-all font-mono">
                        {(organizationData as any)?.organization_admin?.wallet_address
                          ? `${(organizationData as any).organization_admin.wallet_address.slice(
                            0,
                            6,
                          )}...${(organizationData as any).organization_admin.wallet_address.slice(-6)}`
                          : 'N/A'}
                      </p>
                      {(organizationData as any)?.organization_admin?.wallet_address && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 flex-shrink-0"
                          onClick={() => copyToClipboard((organizationData as any).organization_admin.wallet_address, 'wallet')}
                        >
                          {copiedField === 'wallet'
                            ? (
                                <Check className="h-3.5 w-3.5 text-green-500" />
                              )
                            : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-400">
                      Legal Entity ID
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm sm:text-base text-emerald-400 break-words">
                        {(organizationData as any)?.legal_entity_identifier || 'N/A'}
                      </p>
                      {(organizationData as any)?.legal_entity_identifier && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 flex-shrink-0"
                          onClick={() => copyToClipboard((organizationData as any).legal_entity_identifier, 'legal-entity')}
                        >
                          {copiedField === 'legal-entity'
                            ? (
                                <Check className="h-3.5 w-3.5 text-green-500" />
                              )
                            : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-400">
                      Organization Status
                    </p>
                    <span
                      className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm capitalize mt-1 border font-medium ${
                        (organizationData as any)?.status === 'approved'
                          ? 'bg-green-500/20 border-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 border-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {(organizationData as any)?.status || 'Pending'}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-400">Admin Status</p>
                    <span
                      className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm capitalize mt-1 border font-medium ${
                        (organizationData as any)?.organization_admin?.status === 'approved'
                          ? 'bg-blue-500/20 border-blue-500/20 text-blue-400'
                          : 'bg-gray-500/20 border-gray-500/20 text-gray-400'
                      }`}
                    >
                      {(organizationData as any)?.organization_admin?.status || 'N/A'}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-400">
                    Organization Admin
                  </p>
                  <p className="text-sm sm:text-base text-blue-300 break-words mt-1">
                    {(organizationData as any)?.organization_admin?.email || 'N/A'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-400">Created At</p>
                    <p className="text-xs sm:text-sm text-cyan-300 mt-1">
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
                    <p className="text-xs sm:text-sm font-medium text-gray-400">Updated At</p>
                    <p className="text-xs sm:text-sm text-orange-300 mt-1">
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
          )}

      {/* Organization Users Table */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg lg:text-xl">Organization Members</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          {isLoadingUsers
            ? (
                <div className="flex items-center justify-center p-8 sm:p-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              )
            : (
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <DataTable
                    columns={columns}
                    data={usersData?.org_users || []}
                    isLoading={false}
                  />
                </div>
              )}
        </CardContent>
        {usersData && usersData.pagination && (
          <CardFooter className="flex justify-center pt-4 sm:pt-6 pb-4 sm:pb-6">
            <CustomPagination
              limit={USERS_LIMIT}
              total={usersData.pagination.total}
              page={usersPage}
              onPageChange={setUsersPage}
            />
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
