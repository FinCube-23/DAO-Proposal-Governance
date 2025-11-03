import type { ColumnDef } from '@tanstack/react-table';
import type { Organization, OrgStatus } from './types';
import { useMemo, useState } from 'react';
import { CopyableCode } from '@/shared/components/copyable-code';
import CustomPagination from '@/shared/components/custom-pagination';
import { DataTable } from '@/shared/components/dashboard/data-table';
import { TimeDisplay } from '@/shared/components/time-display';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { cn, formatAddress, STATUS_BADGE_CONFIG } from '@/shared/utils';
import { ORGANIZATIONS } from './mock-data';

const ORG_STATUS_TO_TX: Record<OrgStatus, keyof typeof STATUS_BADGE_CONFIG> = {
  active: 'success',
  pending: 'pending',
  suspended: 'failed',
};

const columns: ColumnDef<Organization>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    enableSorting: false,
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('name')}</div>
    ),
  },
  {
    accessorKey: 'type',
    header: 'Type',
    enableSorting: false,
  },
  {
    accessorKey: 'location',
    header: 'Location',
    enableSorting: false,
  },
  {
    accessorKey: 'membership_status',
    header: 'Membership',
    enableSorting: false,
    cell: ({ row }) => {
      const status = row.getValue('membership_status') as OrgStatus;
      const txStatus = ORG_STATUS_TO_TX[status];
      const config = STATUS_BADGE_CONFIG[txStatus];
      const dotColor = txStatus === 'success'
        ? 'bg-green-600'
        : txStatus === 'failed'
          ? 'bg-red-600'
          : txStatus === 'pending'
            ? 'bg-amber-600'
            : 'bg-gray-600';
      return (
        <Badge variant="secondary" className={cn('capitalize', config.color, txStatus === 'pending' && 'animate-pulse')}>
          <span className={cn('inline-block w-2 h-2 rounded-full mr-1', dotColor)} />
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'members_count',
    header: 'Members',
    cell: ({ row }) => (
      <div className="tabular-nums">{row.original.members_count ?? '-'}</div>
    ),
  },
  {
    accessorKey: 'treasury_address',
    header: 'Treasury',
    enableSorting: false,
    cell: ({ row }) => (
      row.original.treasury_address
        ? (
            <CopyableCode value={row.original.treasury_address} displayValue={formatAddress(row.original.treasury_address)} />
          )
        : (
            <span className="text-muted-foreground">-</span>
          )
    ),
  },
  {
    accessorKey: 'created_at',
    header: 'Created',
    cell: ({ row }) => (
      <TimeDisplay timestamp={row.getValue('created_at')} enableToggle className="text-xs" />
    ),
  },
  {
    accessorKey: 'updated_at',
    header: 'Updated',
    cell: ({ row }) => (
      <TimeDisplay timestamp={row.getValue('updated_at')} enableToggle className="text-xs" />
    ),
  },
];

export default function AuditOrganizations() {
  const [typeFilter, setTypeFilter] = useState<'all' | Organization['type']>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | OrgStatus>('all');

  const filteredData = useMemo(() => {
    return ORGANIZATIONS.filter((org) => {
      const typeOk = typeFilter === 'all' || org.type === typeFilter;
      const statusOk = statusFilter === 'all' || org.membership_status === statusFilter;
      return typeOk && statusOk;
    });
  }, [typeFilter, statusFilter]);
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-lg">Organizations</CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Type</span>
              <Select value={typeFilter} onValueChange={v => setTypeFilter(v as any)}>
                <SelectTrigger className="w-40 h-8">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="PLC">PLC</SelectItem>
                  <SelectItem value="LLC">LLC</SelectItem>
                  <SelectItem value="INC">INC</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status</span>
              <Select value={statusFilter} onValueChange={v => setStatusFilter(v as any)}>
                <SelectTrigger className="w-40 h-8">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={filteredData} isLoading={false} />
      </CardContent>
      <CardFooter className="flex justify-center">
        <CustomPagination limit={5} total={100} page={1} onPageChange={() => {}} />
      </CardFooter>
    </Card>
  );
}
