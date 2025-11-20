import type { ColumnDef } from '@tanstack/react-table';
import type { Org } from '@/core/services/org/types';
import { useQuery } from '@tanstack/react-query';
import { Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { orgApis } from '@/core/services/org';
import { CopyableCode } from '@/shared/components/copyable-code';
import CustomPagination from '@/shared/components/custom-pagination';
import { DataTable } from '@/shared/components/dashboard/data-table';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { cn, STATUS_BADGE_CONFIG } from '@/shared/utils';

type OrgStatus = 'register' | 'pending' | 'approved' | 'cancelled' | 'banned';
type OrgType = 'plc' | 'llc' | 'inc' | 'other';

interface OrgFilters {
  status: 'all' | OrgStatus;
  type: 'all' | OrgType;
  search: string;
  sort_by: 'name' | 'type' | 'status';
  order: 'asc' | 'desc';
}

const STATUS_CONFIG: Record<OrgStatus, keyof typeof STATUS_BADGE_CONFIG> = {
  register: 'pending',
  approved: 'success',
  pending: 'pending',
  cancelled: 'submitted',
  banned: 'failed',
};

export default function OrgList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<OrgFilters>({
    status: 'all',
    type: 'all',
    search: '',
    sort_by: 'name',
    order: 'desc',
  });
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['admin-organizations', page, filters],
    queryFn: () => orgApis.getAllOrgs({
      page,
      limit,
      status: filters.status !== 'all' ? filters.status : undefined,
      type: filters.type !== 'all' ? filters.type : undefined,
    }),
  });

  const organizations = data?.organizations ?? [];
  const total = data?.pagination?.total ?? 0;

  const handleResetFilters = () => {
    setFilters({
      status: 'all',
      type: 'all',
      search: '',
      sort_by: 'name',
      order: 'desc',
    });
    setPage(1);
  };

  const columns: ColumnDef<Org>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      enableSorting: false,
      cell: ({ row }) => <div className="font-mono text-xs">{row.getValue('id')}</div>,
    },
    {
      accessorKey: 'name',
      header: 'Name',
      enableSorting: false,
      cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
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
      accessorKey: 'type',
      header: 'Type',
      enableSorting: false,
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono uppercase">
          {row.getValue('type')}
        </Badge>
      ),
    },
    {
      accessorKey: 'address',
      header: 'Location',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate" title={row.getValue('address')}>
          {row.getValue('address')}
        </div>
      ),
    },
    {
      accessorKey: 'offchain_status',
      header: 'Offchain Status',
      enableSorting: false,
      cell: ({ row }) => {
        const status = (row.getValue('offchain_status') || row.getValue('status')) as OrgStatus;
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
      accessorKey: 'onchain_status',
      header: 'Onchain Status',
      enableSorting: false,
      cell: ({ row }) => {
        const status = row.getValue('onchain_status') as string | undefined;
        if (!status) {
          return <span className="text-gray-400 text-xs">-</span>;
        }
        const configKey = status === 'approved' ? 'success' : status === 'pending' ? 'pending' : 'failed';
        const config = STATUS_BADGE_CONFIG[configKey];
        const dotColor = configKey === 'success'
          ? 'bg-green-600'
          : configKey === 'failed'
            ? 'bg-red-600'
            : 'bg-amber-600';

        return (
          <Badge variant="secondary" className={cn('capitalize rounded-full border-0', config.color, configKey === 'pending' && 'animate-pulse')}>
            <span className={cn('inline-block w-2 h-2 rounded-full mr-1', dotColor)} />
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'organization_admin_name',
      header: 'Organization Admin',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('organization_admin_name')}</div>
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
                  placeholder="Search by name..."
                  value={filters.search}
                  onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status & Type Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Status
                </label>
                <Select value={filters.status} onValueChange={v => setFilters(prev => ({ ...prev, status: v as OrgFilters['status'] }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="register">Registered</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="banned">Banned</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Type
                </label>
                <Select value={filters.type} onValueChange={v => setFilters(prev => ({ ...prev, type: v as OrgFilters['type'] }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="plc">PLC</SelectItem>
                    <SelectItem value="llc">LLC</SelectItem>
                    <SelectItem value="inc">INC</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Reset Button */}
            <Button variant="outline" onClick={handleResetFilters} className="w-full">
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
            <CardTitle className="text-base sm:text-lg">Organizations</CardTitle>
            <div className="text-xs sm:text-sm text-muted-foreground mt-2">
              Showing
              {' '}
              {organizations.length}
              {' '}
              of
              {' '}
              {total}
              {' '}
              organizations
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={organizations}
              isLoading={isLoading}
              onRowClick={row => navigate(`/organization/admin/organizations/${row.id}`)}
            />
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
