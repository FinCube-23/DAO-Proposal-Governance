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
  // Check if function contains 'transfer'
  const isTransferFunction = transaction.function?.toLowerCase().includes('transfer');

  // Extract wallet addresses for transfer transactions
  const getWalletAddresses = () => {
    if (!isTransferFunction) {
      return { from: transaction.from, to: transaction.to };
    }

    try {
      const rawTx = JSON.parse(transaction.raw_transaction || '{}');
      if (rawTx.senderWalletAddress && rawTx.receiverWalletAddress) {
        return {
          from: rawTx.senderWalletAddress,
          to: rawTx.receiverWalletAddress,
        };
      }
    }
    catch (e) {
      console.error('Failed to parse raw_transaction for wallet addresses:', e);
    }

    // Fallback to default addresses
    return { from: transaction.from, to: transaction.to };
  };

  const { from, to } = getWalletAddresses();

  // Extract reference numbers from event_logs for transfer transactions
  const getReferenceNumbers = () => {
    if (!isTransferFunction) {
      return { senderRef: null, receiverRef: null };
    }

    try {
      const eventLogs = JSON.parse(transaction.event_logs || '{}');
      const memo = JSON.parse(eventLogs.memo || '{}');

      return {
        senderRef: memo.sender_reference_number,
        receiverRef: memo.receiver_reference_number,
      };
    }
    catch (e) {
      console.error('Failed to parse event_logs for reference numbers:', e);
      return { senderRef: null, receiverRef: null };
    }
  };

  const { senderRef, receiverRef } = getReferenceNumbers();

  const participants = [
    {
      role: 'Sender',
      address: from,
      description: 'Transaction initiator',
      referenceNumber: senderRef,
    },
    {
      role: 'Receiver',
      address: to,
      description: 'Transaction recipient',
      referenceNumber: receiverRef,
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
              {isTransferFunction && <TableHead>Reference Number</TableHead>}
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
                {isTransferFunction && (
                  <TableCell>
                    {participant.referenceNumber
                      ? (
                          <CopyableCode
                            value={participant.referenceNumber}
                            displayValue={formatAddress(participant.referenceNumber)}
                          />
                        )
                      : (
                          <span className="text-xs sm:text-sm text-muted-foreground">-</span>
                        )}
                  </TableCell>
                )}
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
