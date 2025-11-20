import type { ColumnDef } from '@tanstack/react-table';
import type { OrgOnchainVerificationResponse } from '@/core/services/org/types';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { orgApis } from '@/core/services/org';
import { CopyableCode } from '@/shared/components/copyable-code';
import CustomPagination from '@/shared/components/custom-pagination';
import { DataTable } from '@/shared/components/dashboard/data-table';
import { TimeDisplay } from '@/shared/components/time-display';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { cn, formatAddress, STATUS_BADGE_CONFIG } from '@/shared/utils';

type OrgVerification = OrgOnchainVerificationResponse['data']['verifications'][0];

const STATUS_CONFIG: Record<string, keyof typeof STATUS_BADGE_CONFIG> = {
  approved: 'success',
  pending: 'pending',
  cancelled: 'submitted',
  banned: 'failed',
  verified: 'success',
  failed: 'failed',
};

export default function OrgAdminOnchainVerifications() {
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
    queryKey: ['org-onchain-verifications', orgId, page],
    queryFn: () => {
      if (!orgId) {
        throw new Error('Organization ID not found');
      }
      return orgApis.getOnchainVerificationsByOrg(orgId, {
        page,
        limit,
      });
    },
    enabled: !!orgId,
  });

  const verifications = data?.data?.verifications ?? [];
  const total = data?.data?.pagination?.total ?? 0;

  const columns: ColumnDef<OrgVerification>[] = [
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
        const status = row.getValue('onchain_status') as string;
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

  if (!orgId) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Card className="p-6">
          <CardTitle className="text-center text-red-500">
            Organization not found. Please log in again.
          </CardTitle>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full">
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
  );
}
