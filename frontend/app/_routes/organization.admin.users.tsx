import type { ColumnDef } from '@tanstack/react-table';
import type { OrgUser, OrgUserStatus } from '@/core/services/org/types';
import { useQuery } from '@tanstack/react-query';
import { Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { orgApis } from '@/core/services/org';
import { CopyableCode } from '@/shared/components/copyable-code';
import CustomPagination from '@/shared/components/custom-pagination';
import { DataTable } from '@/shared/components/dashboard/data-table';
import { TimeDisplay } from '@/shared/components/time-display';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { cn, STATUS_BADGE_CONFIG } from '@/shared/utils';

interface OrgUserFilters {
  status: 'all' | OrgUserStatus;
  is_active: 'all' | 'yes' | 'no';
  is_verified_email: 'all' | 'yes' | 'no';
  is_verified_contact_number: 'all' | 'yes' | 'no';
  search: string;
  sort_by: 'date_joined' | 'email' | 'first_name' | 'last_name';
  order: 'asc' | 'desc';
}

const STATUS_CONFIG: Record<OrgUserStatus, keyof typeof STATUS_BADGE_CONFIG> = {
  approved: 'success',
  pending: 'pending',
  rejected: 'submitted',
  banned: 'failed',
};

export default function OrgAdminUsers() {
  const [filters, setFilters] = useState<OrgUserFilters>({
    status: 'all',
    is_active: 'all',
    is_verified_email: 'all',
    is_verified_contact_number: 'all',
    search: '',
    sort_by: 'date_joined',
    order: 'desc',
  });
  const [page, setPage] = useState(1);
  const limit = 10;

  // Get org_id from localStorage profile
  const getOrgId = () => {
    const authData = localStorage.getItem('auth-storage');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        // Handle nested state structure
        const organizations = parsed.state?.profile?.organizations || parsed.profile?.organizations;
        if (organizations && organizations.length > 0) {
          return organizations[0].id;
        }
      }
      catch {
        return null;
      }
    }
    return null;
  };

  const orgId = getOrgId();

  const { data, isLoading } = useQuery({
    queryKey: ['org-users', orgId, page, filters],
    queryFn: () => {
      if (!orgId) {
        throw new Error('Organization ID not found');
      }

      // Convert filter values to boolean for API
      let isActiveParam: boolean | undefined;
      if (filters.is_active === 'yes') {
        isActiveParam = true;
      }
      else if (filters.is_active === 'no') {
        isActiveParam = false;
      }

      let isVerifiedEmailParam: boolean | undefined;
      if (filters.is_verified_email === 'yes') {
        isVerifiedEmailParam = true;
      }
      else if (filters.is_verified_email === 'no') {
        isVerifiedEmailParam = false;
      }

      let isVerifiedContactParam: boolean | undefined;
      if (filters.is_verified_contact_number === 'yes') {
        isVerifiedContactParam = true;
      }
      else if (filters.is_verified_contact_number === 'no') {
        isVerifiedContactParam = false;
      }

      return orgApis.getUsersByOrg(orgId, {
        page,
        limit,
        search: filters.search || undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
        is_active: isActiveParam,
        is_verified_email: isVerifiedEmailParam,
        is_verified_contact_number: isVerifiedContactParam,
        sort_by: filters.sort_by,
        order: filters.order,
      });
    },
    enabled: !!orgId,
  });

  const users = data?.org_users ?? [];
  const total = data?.pagination?.total ?? 0;

  const handleResetFilters = () => {
    setFilters({
      status: 'all',
      is_active: 'all',
      is_verified_email: 'all',
      is_verified_contact_number: 'all',
      search: '',
      sort_by: 'date_joined',
      order: 'desc',
    });
    setPage(1);
  };

  const columns: ColumnDef<OrgUser>[] = [
    {
      accessorKey: 'first_name',
      header: 'First Name',
      enableSorting: false,
      cell: ({ row }) => <div className="font-medium">{row.getValue('first_name')}</div>,
    },
    {
      accessorKey: 'last_name',
      header: 'Last Name',
      enableSorting: false,
      cell: ({ row }) => <div className="font-medium">{row.getValue('last_name')}</div>,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      enableSorting: false,
      cell: ({ row }) => (
        <CopyableCode value={row.original.email} displayValue={row.original.email} />
      ),
    },
    {
      accessorKey: 'wallet_address',
      header: 'Wallet Address',
      enableSorting: false,
      cell: ({ row }) => {
        const address = row.getValue('wallet_address') as string | null;
        return address
          ? (
              <CopyableCode
                value={address}
                displayValue={`${address.slice(0, 6)}...${address.slice(-4)}`}
              />
            )
          : (
              <span className="text-muted-foreground text-xs">N/A</span>
            );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      enableSorting: false,
      cell: ({ row }) => {
        const status = row.getValue('status') as OrgUserStatus;
        const configKey = STATUS_CONFIG[status];
        const config = STATUS_BADGE_CONFIG[configKey];
        const dotColor = configKey === 'success'
          ? 'bg-green-600'
          : configKey === 'failed'
            ? 'bg-red-600'
            : configKey === 'pending'
              ? 'bg-amber-600'
              : 'bg-orange-600';

        return (
          <Badge variant="secondary" className={cn('capitalize rounded-full border-0', config.color, configKey === 'pending' && 'animate-pulse')}>
            <span className={cn('inline-block w-2 h-2 rounded-full mr-1', dotColor)} />
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'is_active',
      header: 'Is Active',
      enableSorting: false,
      cell: ({ row }) => (
        <Badge className={row.original.is_active ? 'text-green-400' : 'text-red-400'} variant="outline">
          {row.original.is_active ? 'Yes' : 'No'}
        </Badge>
      ),
    },
    {
      accessorKey: 'is_verified_email',
      header: 'Email Verified',
      enableSorting: false,
      cell: ({ row }) => (
        <Badge className={row.original.is_verified_email ? 'text-green-400' : 'text-red-400'} variant="outline">
          {row.original.is_verified_email ? 'Yes' : 'No'}
        </Badge>
      ),
    },
    {
      accessorKey: 'date_joined',
      header: 'Date Joined',
      cell: ({ row }) => (
        <TimeDisplay timestamp={row.getValue('date_joined')} enableToggle className="text-xs" />
      ),
    },
  ];

  if (!orgId) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Card className="p-6">
          <CardTitle className="text-center text-red-500">
            Organization ID not found. Please log in again.
          </CardTitle>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:gap-6 grid-cols-1 lg:grid-cols-4 h-full">
      {/* Filters Sidebar */}
      <div className="lg:col-span-1">
        <Card className="lg:sticky lg:top-20 h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {/* Search Bar */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={filters.search}
                  onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status & Is Active Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Status
                </label>
                <Select value={filters.status} onValueChange={v => setFilters(prev => ({ ...prev, status: v as OrgUserFilters['status'] }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="banned">Banned</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Is Active
                </label>
                <Select value={filters.is_active} onValueChange={v => setFilters(prev => ({ ...prev, is_active: v as OrgUserFilters['is_active'] }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Email Verified & Contact Verified Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Verified Email?
                </label>
                <Select value={filters.is_verified_email} onValueChange={v => setFilters(prev => ({ ...prev, is_verified_email: v as OrgUserFilters['is_verified_email'] }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Verified Contact?
                </label>
                <Select value={filters.is_verified_contact_number} onValueChange={v => setFilters(prev => ({ ...prev, is_verified_contact_number: v as OrgUserFilters['is_verified_contact_number'] }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Reset Button */}
            <Button variant="outline" onClick={handleResetFilters} className="w-full mt-4">
              <Trash2 className="h-4 w-4 mr-2" />
              Reset Filters
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Table Section */}
      <div className="lg:col-span-3 h-full">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Users</CardTitle>
            <div className="text-xs sm:text-sm text-muted-foreground mt-2">
              Showing
              {' '}
              {users.length}
              {' '}
              of
              {' '}
              {total}
              {' '}
              users
            </div>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={users} isLoading={isLoading} />
          </CardContent>
          <CardFooter className="flex justify-center">
            <CustomPagination
              limit={limit}
              total={total}
              page={page}
              onPageChange={setPage}
            />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
