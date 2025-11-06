import type { ColumnDef } from '@tanstack/react-table';
import type { Transaction } from '@/shared/types/transactions';
import { Users } from 'lucide-react';
import { CopyableCode } from '@/shared/components/copyable-code';
import { DataTable } from '@/shared/components/dashboard/data-table';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { formatAddress } from '@/shared/utils';

interface Props {
  transaction: Transaction;
}

const participantColumns: ColumnDef<any>[] = [
  {
    accessorKey: 'participant_role',
    header: 'Role',
    cell: ({ row }) => (
      <Badge variant="outline">
        {row.getValue('participant_role')}
      </Badge>
    ),
  },
  {
    accessorKey: 'address',
    header: 'Address',
    cell: ({ row }) => (
      <CopyableCode
        value={row.getValue('address')}
        displayValue={formatAddress(row.getValue('address'))}
      />
    ),
  },
  {
    accessorKey: 'ens_name',
    header: 'ENS / Label',
    cell: ({ row }) => {
      const ensName = row.getValue('ens_name') as string;
      const label = row.original.label;
      return (
        <div className="text-sm">
          {ensName && <div className="font-medium">{ensName}</div>}
          {label && <div className="text-muted-foreground">{label}</div>}
        </div>
      );
    },
  },
];

export default function TransactionParticipants({ transaction }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Users className="h-4 w-4 sm:h-5 sm:w-5" />
          Transaction Participants
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto -mx-4 sm:mx-0 px-8 sm:px-6">
        <DataTable
          columns={participantColumns}
          data={transaction.participants}
        />
      </CardContent>
    </Card>
  );
}
