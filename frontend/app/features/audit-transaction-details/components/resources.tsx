import type { ColumnDef } from '@tanstack/react-table';
import type { Transaction } from '@/shared/types/transactions';
import { Archive } from 'lucide-react';
import { TagBadge } from '@/features/audit-dashboard/components/tag-badge';
import { DataTable } from '@/shared/components/dashboard/data-table';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

const resourceColumns: ColumnDef<any>[] = [
  {
    accessorKey: 'resource_kind',
    header: 'Kind',
    cell: ({ row }) => (
      <TagBadge tag={row.getValue('resource_kind')} />
    ),
  },
  {
    accessorKey: 'resource_id',
    header: 'ID',
    cell: ({ row }) => (
      <code className="font-mono text-sm bg-muted px-2 py-1 rounded">
        {row.getValue('resource_id')}
      </code>
    ),
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => (
      <Badge variant={row.getValue('role') === 'PRIMARY' ? 'default' : 'secondary'}>
        {row.getValue('role')}
      </Badge>
    ),
  },
];

interface Props {
  transaction: Transaction;
}

export default function TransactionResources({ transaction }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Archive className="h-4 w-4 sm:h-5 sm:w-5" />
          Transaction Resources
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto -mx-4 sm:mx-0 px-8 sm:px-6">
        <DataTable
          columns={resourceColumns}
          data={transaction.resources}
        />
      </CardContent>
    </Card>
  );
}
