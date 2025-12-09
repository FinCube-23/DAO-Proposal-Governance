import type { ColumnDef } from '@tanstack/react-table';
import type { Organization, OrgStatus } from './types';
import { useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { orgApis } from '@/core/services/org';
import CustomPagination from '@/shared/components/custom-pagination';
import { DataTable } from '@/shared/components/dashboard/data-table';
import { TimeDisplay } from '@/shared/components/time-display';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { cn, STATUS_BADGE_CONFIG } from '@/shared/utils';

const ORG_STATUS_TO_TX: Record<OrgStatus, keyof typeof STATUS_BADGE_CONFIG> = {
  active: 'success',
  pending: 'pending',
  suspended: 'failed',
  approved: 'approved',
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
    cell: ({ row }) => (
      <div className="uppercase">{row.getValue('type')}</div>
    ),
  },
  {
    accessorKey: 'address',
    header: 'Location',
    enableSorting: false,
  },
  {
    accessorKey: 'offchain_status',
    header: 'Offchain Status',
    enableSorting: false,
    cell: ({ row }) => {
      const status = (row.getValue('offchain_status') || row.getValue('status')) as OrgStatus;
      const txStatus = ORG_STATUS_TO_TX[status];
      const config = STATUS_BADGE_CONFIG[txStatus];
      const dotColor = txStatus === 'success' || txStatus === 'approved'
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
    accessorKey: 'onchain_status',
    header: 'Onchain Status',
    enableSorting: false,
    cell: ({ row }) => {
      const status = row.getValue('onchain_status') as string | undefined;
      if (!status) {
        return <span className="text-gray-400 text-xs">-</span>;
      }
      const txStatus = status === 'approved' ? 'success' : status === 'pending' ? 'pending' : 'failed';
      const config = STATUS_BADGE_CONFIG[txStatus];
      const dotColor = txStatus === 'success'
        ? 'bg-green-600'
        : txStatus === 'failed'
          ? 'bg-red-600'
          : 'bg-amber-600';
      return (
        <Badge variant="secondary" className={cn('capitalize', config.color, txStatus === 'pending' && 'animate-pulse')}>
          <span className={cn('inline-block w-2 h-2 rounded-full mr-1', dotColor)} />
          {status}
        </Badge>
      );
    },
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

const limit = 10;

export default function AuditOrganizations() {
  const [orgList, setOrgList] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState<number>(0);
  const navigate = useNavigate();

  const [typeFilter, setTypeFilter] = useState<'all' | Organization['type']>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | OrgStatus>('all');

  const getAllOrgs = useMutation({
    mutationKey: ['getAllOrgs'],
    mutationFn: orgApis.getAllOrgs,
    onSuccess: (data) => {
      setOrgList(data.organizations);
      setPage(data.pagination.page);
      setTotal(data.pagination.total);
    },
    onError: (error) => {
      console.error('Get all orgs failed', error);
    },
  });

  useEffect(() => {
    getAllOrgs.mutate({
      page,
      limit,
      status: statusFilter === 'all' ? undefined : statusFilter,
      type: typeFilter === 'all' ? undefined : typeFilter,
    });
  }, [page, statusFilter, location, typeFilter]);

  const handleRowClick = (row: any) => {
    navigate(`/organization/audit/organizations/${row.id}`);
  };

  if (getAllOrgs.isPending) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
        <p className="text-xs sm:text-sm text-muted-foreground">Loading organizations...</p>
      </div>
    );
  }
  if (getAllOrgs.isError)
    return <p className="text-sm text-red-500 p-4">Error loading data</p>;

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:gap-4">
          <CardTitle className="text-base sm:text-lg lg:text-xl">Organizations</CardTitle>
          <div className="flex flex-row items-center sm:justify-end gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-1 sm:flex-initial min-w-0 sm:min-w-fit">
              <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">Type:</span>
              <Select value={typeFilter} onValueChange={v => setTypeFilter(v as any)}>
                <SelectTrigger className="w-full sm:w-32 h-8 text-xs sm:text-sm">
                  <SelectValue placeholder="All" />
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
            <div className="flex items-center gap-1.5 sm:gap-2 flex-1 sm:flex-initial min-w-0 sm:min-w-fit">
              <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">Status:</span>
              <Select value={statusFilter} onValueChange={v => setStatusFilter(v as any)}>
                <SelectTrigger className="w-full sm:w-36 h-8 text-xs sm:text-sm">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <DataTable columns={columns} data={orgList} isLoading={false} onRowClick={handleRowClick} />
        </div>
      </CardContent>
      <CardFooter className="flex justify-center p-4 sm:p-6 pt-4">
        <CustomPagination limit={limit} total={total} page={page} onPageChange={setPage} />
      </CardFooter>
    </Card>
  );
}
