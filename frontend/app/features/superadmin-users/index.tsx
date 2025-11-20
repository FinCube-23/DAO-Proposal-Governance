import type { ColumnDef } from '@tanstack/react-table';
import type { SuperAdminUser, SuperAdminUserFilters, SuperAdminUserStatus } from './types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { superadminApis } from '@/core/services/superadmin';
import { CopyableCode } from '@/shared/components/copyable-code';
import CustomPagination from '@/shared/components/custom-pagination';
import { DataTable } from '@/shared/components/dashboard/data-table';
import { TimeDisplay } from '@/shared/components/time-display';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { cn, STATUS_BADGE_CONFIG } from '@/shared/utils';

// Helper function to get allowed status transitions
function getAllowedStatusTransitions(currentStatus: SuperAdminUserStatus): SuperAdminUserStatus[] {
  switch (currentStatus) {
    case 'pending':
      return ['approved', 'rejected'];
    case 'approved':
      return ['banned'];
    case 'banned':
      return ['pending'];
    case 'rejected':
      return [];
    default:
      return [];
  }
}

const STATUS_CONFIG: Record<SuperAdminUserStatus, keyof typeof STATUS_BADGE_CONFIG> = {
  approved: 'success',
  pending: 'pending',
  rejected: 'submitted',
  banned: 'failed',
};

export default function SuperAdminUsers() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<SuperAdminUserFilters>({
    status: 'all',
    is_active: 'all',
    is_verified_email: 'all',
    is_verified_contact_number: 'all',
    search: '',
    sort_by: 'date_joined',
    order: 'desc',
  });
  const [selectedIds, setSelectedIds] = useState<Set<number>>(() => new Set());
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['superadmin-users', page, filters],
    queryFn: () => {
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

      return superadminApis.getUsers({
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
  });

  const users = data?.users ?? [];
  const total = data?.pagination?.total ?? 0;

  const updateStatusMutation = useMutation({
    mutationFn: superadminApis.updateUserStatus,
    onSuccess: (response) => {
      toast.success(response.message || 'Status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['superadmin-users'] });
      setSelectedIds(new Set());
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update status');
    },
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(users.map(user => user.id)));
    }
    else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    }
    else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkAction = (action: 'approve' | 'cancel' | 'ban') => {
    const statusMap = {
      approve: 'approved',
      cancel: 'rejected',
      ban: 'banned',
    };

    updateStatusMutation.mutate({
      user_ids: Array.from(selectedIds),
      status: statusMap[action],
    });
  };

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

  const columns: ColumnDef<SuperAdminUser>[] = [
    {
      id: 'select',
      header: () => (
        <Checkbox
          checked={selectedIds.size === users.length && users.length > 0}
          onCheckedChange={handleSelectAll}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedIds.has(row.original.id)}
          onCheckedChange={(checked: boolean) => handleSelectOne(row.original.id, checked)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
    },
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
      accessorKey: 'status',
      header: 'Status',
      enableSorting: false,
      cell: ({ row }) => {
        const status = row.getValue('status') as SuperAdminUserStatus;
        const allowedTransitions = getAllowedStatusTransitions(status);
        const configKey = STATUS_CONFIG[status];
        const config = STATUS_BADGE_CONFIG[configKey];
        const dotColor = configKey === 'success'
          ? 'bg-green-600'
          : configKey === 'failed'
            ? 'bg-red-600'
            : configKey === 'pending'
              ? 'bg-amber-600'
              : 'bg-orange-600';

        if (allowedTransitions.length === 0) {
          // No transitions allowed, show as badge only
          return (
            <Badge variant="secondary" className={cn('capitalize rounded-full border-0', config.color, configKey === 'pending' && 'animate-pulse')}>
              <span className={cn('inline-block w-2 h-2 rounded-full mr-1', dotColor)} />
              {status}
            </Badge>
          );
        }

        return (
          <Select
            value={status}
            onValueChange={(newStatus) => {
              updateStatusMutation.mutate({
                user_ids: [row.original.id],
                status: newStatus,
              });
            }}
          >
            <SelectTrigger className="w-[140px] h-8 border-0 focus:ring-0 focus:ring-offset-0">
              <Badge variant="secondary" className={cn('capitalize rounded-full border-0', config.color, configKey === 'pending' && 'animate-pulse')}>
                <span className={cn('inline-block w-2 h-2 rounded-full mr-1', dotColor)} />
                {status}
              </Badge>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={status} disabled>
                <div className="flex items-center gap-2">
                  <span className={cn('inline-block w-2 h-2 rounded-full', dotColor)} />
                  <span className="capitalize">{status}</span>
                </div>
              </SelectItem>
              {allowedTransitions.map((transitionStatus) => {
                const transConfigKey = STATUS_CONFIG[transitionStatus];
                const transDotColor = transConfigKey === 'success'
                  ? 'bg-green-600'
                  : transConfigKey === 'failed'
                    ? 'bg-red-600'
                    : transConfigKey === 'pending'
                      ? 'bg-amber-600'
                      : 'bg-orange-600';
                return (
                  <SelectItem key={transitionStatus} value={transitionStatus}>
                    <div className="flex items-center gap-2">
                      <span className={cn('inline-block w-2 h-2 rounded-full', transDotColor)} />
                      <span className="capitalize">{transitionStatus}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
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
                <Select value={filters.status} onValueChange={v => setFilters(prev => ({ ...prev, status: v as SuperAdminUserFilters['status'] }))}>
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
                <Select value={filters.is_active} onValueChange={v => setFilters(prev => ({ ...prev, is_active: v as SuperAdminUserFilters['is_active'] }))}>
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
                <Select value={filters.is_verified_email} onValueChange={v => setFilters(prev => ({ ...prev, is_verified_email: v as SuperAdminUserFilters['is_verified_email'] }))}>
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
                <Select value={filters.is_verified_contact_number} onValueChange={v => setFilters(prev => ({ ...prev, is_verified_contact_number: v as SuperAdminUserFilters['is_verified_contact_number'] }))}>
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle className="text-base sm:text-lg">Users</CardTitle>
              {selectedIds.size > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                    {selectedIds.size}
                    {' '}
                    selected
                  </span>
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" variant="default" onClick={() => handleBulkAction('approve')} className="text-xs">
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleBulkAction('cancel')} className="text-xs">
                      Reject
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleBulkAction('ban')} className="text-xs">
                      Ban
                    </Button>
                  </div>
                </div>
              )}
            </div>
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
