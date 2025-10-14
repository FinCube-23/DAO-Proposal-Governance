import type { ColumnDef } from '@tanstack/react-table';
import type { Transaction } from '@/shared/types/transactions';
import { Zap } from 'lucide-react';
import { CopyableCode } from '@/shared/components/copyable-code';
import { DataTable } from '@/shared/components/dashboard/data-table';
import { JsonViewer } from '@/shared/components/json-viewer';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { formatAddress } from '@/shared/utils';

const eventColumns: ColumnDef<any>[] = [
  {
    accessorKey: 'decoded_event_name',
    header: 'Event',
    cell: ({ row }) => (
      <code className="font-mono text-sm font-medium">
        {row.getValue('decoded_event_name')}
      </code>
    ),
  },
  {
    accessorKey: 'contract_address',
    header: 'Contract',
    cell: ({ row }) => (
      <CopyableCode
        value={row.getValue('contract_address')}
        displayValue={formatAddress(row.getValue('contract_address'))}
      />
    ),
  },
  {
    accessorKey: 'log_index',
    header: 'Log Index',
    cell: ({ row }) => (
      <Badge variant="outline">
        #
        {row.getValue('log_index')}
      </Badge>
    ),
  },
  {
    accessorKey: 'decoded_args',
    header: 'Arguments',
    cell: ({ row }) => {
      const args = row.getValue('decoded_args') as Record<string, any>;
      return (
        <details className="group">
          <summary className="cursor-pointer text-xs text-muted-foreground group-open:text-foreground">
            {Object.keys(args).length}
            {' '}
            args
          </summary>
          <div className="mt-2">
            <JsonViewer data={args} initialCollapsed maxLines={10} />
          </div>
        </details>
      );
    },
  },
];

interface Props {
  transaction: Transaction;
}
export default function TransactionEvents({ transaction }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Transaction Events
        </CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={eventColumns}
          data={transaction.events}
        />
      </CardContent>
    </Card>
  );
}
