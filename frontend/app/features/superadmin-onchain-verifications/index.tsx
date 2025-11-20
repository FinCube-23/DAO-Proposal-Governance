import type { ColumnDef } from '@tanstack/react-table';
import type { OnchainStatus, OnchainVerification, OnchainVerificationFilters } from '../../core/services/superadmin/types';
import { useQuery } from '@tanstack/react-query';
import { Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { superadminApis } from '@/core/services/superadmin';
import { CopyableCode } from '@/shared/components/copyable-code';
import CustomPagination from '@/shared/components/custom-pagination';
import { DataTable } from '@/shared/components/dashboard/data-table';
import { TimeDisplay } from '@/shared/components/time-display';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { cn, formatAddress, STATUS_BADGE_CONFIG } from '@/shared/utils';

const STATUS_CONFIG: Record<OnchainStatus, keyof typeof STATUS_BADGE_CONFIG> = {
  approved: 'success',
  pending: 'pending',
  cancelled: 'submitted',
  banned: 'failed',
};

export default function SuperAdminOnchainVerifications() {
  const [filters, setFilters] = useState<OnchainVerificationFilters>({
    onchain_status: 'all',
    created_at: 'any',
    search: '',
  });
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['superadmin-onchain-verifications', page, filters],
    queryFn: () => {
      return superadminApis.getOnchainVerifications({
        page,
        limit,
        search: filters.search || undefined,
        onchain_status: filters.onchain_status !== 'all' ? filters.onchain_status : undefined,
      });
    },
  });

  const verifications = data?.verifications ?? [];
  const total = data?.pagination?.total ?? 0;

  const handleResetFilters = () => {
    setFilters({
      onchain_status: 'all',
      created_at: 'any',
      search: '',
    });
    setPage(1);
  };

  const columns: ColumnDef<OnchainVerification>[] = [
    {
      accessorKey: 'organization_name',
      header: 'Organization Name',
      enableSorting: false,
      cell: ({ row }) => <div className="font-medium">{row.getValue('organization_name')}</div>,
    },
    {
      accessorKey: 'onchain_status',
      header: 'Onchain Status',
      enableSorting: false,
      cell: ({ row }) => {
        const status = row.getValue('onchain_status') as OnchainStatus;
        const configKey = STATUS_CONFIG[status];
        const config = STATUS_BADGE_CONFIG[configKey];
        const dotColor = configKey === 'success'
          ? 'bg-green-600'
          : configKey === 'failed'
            ? 'bg-red-600'
            : configKey === 'pending'
              ? 'bg-amber-600'
              : 'bg-blue-600';
        return (
          <Badge variant="secondary" className={cn('capitalize', config.color, configKey === 'pending' && 'animate-pulse')}>
            <span className={cn('inline-block w-2 h-2 rounded-full mr-1', dotColor)} />
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'trx_hash',
      header: 'Transaction Hash',
      enableSorting: false,
      cell: ({ row }) => (
        <CopyableCode
          value={row.original.trx_hash}
          displayValue={formatAddress(row.original.trx_hash)}
        />
      ),
    },
    {
      accessorKey: 'onchain_id',
      header: 'Onchain ID',
      enableSorting: false,
      cell: ({ row }) => {
        const onchainId = row.getValue('onchain_id') as number | null;
        return onchainId
          ? (
              <Badge variant="outline" className="font-mono">
                {onchainId}
              </Badge>
            )
          : (
              <span className="text-muted-foreground text-xs">N/A</span>
            );
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Created At',
      cell: ({ row }) => (
        <TimeDisplay timestamp={row.getValue('created_at')} enableToggle className="text-xs" />
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

            {/* Onchain Status Filter */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Status
              </label>
              <Select value={filters.onchain_status} onValueChange={v => setFilters(prev => ({ ...prev, onchain_status: v as OnchainVerificationFilters['onchain_status'] }))}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
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
            <CardTitle className="text-base sm:text-lg">Onchain Verifications</CardTitle>
            <div className="text-xs sm:text-sm text-muted-foreground mt-2">
              Showing
              {' '}
              {verifications.length}
              {' '}
              of
              {' '}
              {total}
              {' '}
              verifications
            </div>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={verifications} isLoading={isLoading} />
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
