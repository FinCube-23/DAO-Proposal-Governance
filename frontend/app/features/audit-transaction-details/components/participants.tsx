import type { GetOneTrxResponse } from '@/core/api/types';
import { Users } from 'lucide-react';
import { CopyableCode } from '@/shared/components/copyable-code';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { formatAddress } from '@/shared/utils';

interface Props {
  transaction: GetOneTrxResponse;
}

export default function TransactionParticipants({ transaction }: Props) {
  const participants = [
    {
      role: 'Sender',
      address: transaction.from,
      description: 'Transaction initiator',
    },
    {
      role: 'Receiver',
      address: transaction.to,
      description: 'Transaction recipient',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Users className="h-4 w-4 sm:h-5 sm:w-5" />
          Transaction Participants
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Role</TableHead>
              <TableHead>Address</TableHead>
              <TableHead className="hidden sm:table-cell">Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {participants.map((participant, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {participant.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <CopyableCode
                    value={participant.address}
                    displayValue={formatAddress(participant.address)}
                  />
                </TableCell>
                <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                  {participant.description}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
