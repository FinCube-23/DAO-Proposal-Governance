import type { Transaction } from '@/shared/types/transactions';
import { Code, Receipt, Zap } from 'lucide-react';
import { JsonViewer } from '@/shared/components/json-viewer';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

interface Props {
  transaction: Transaction;
}
export default function RawTransactionDetails({ transaction }: Props) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Code className="h-4 w-4 sm:h-5 sm:w-5" />
            Raw Transaction
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <JsonViewer data={transaction.raw_tx} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Receipt className="h-4 w-4 sm:h-5 sm:w-5" />
            Transaction Receipt
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <JsonViewer data={transaction.raw_receipt} />
        </CardContent>
      </Card>

      {transaction.execution_trace && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
              Execution Trace
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <JsonViewer data={transaction.execution_trace} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
