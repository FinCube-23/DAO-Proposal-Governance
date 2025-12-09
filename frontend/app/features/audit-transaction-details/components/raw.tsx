import type { GetOneTrxResponse } from "@/core/api/types";
import { Code, Receipt } from "lucide-react";
import { JsonViewer } from "@/shared/components/json-viewer";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

interface Props {
  transaction: GetOneTrxResponse;
}

export default function RawTransactionDetails({ transaction }: Props) {
  let rawTx: any = null;
  let rawReceipt: any = null;

  // Parse raw_transaction and transaction_receipt if they're strings
  try {
    if (transaction.raw_transaction) {
      rawTx = JSON.parse(transaction.raw_transaction);
    }
  } catch (e) {
    console.error("Failed to parse raw transaction:", e);
  }

  try {
    if (transaction.transaction_receipt) {
      rawReceipt = JSON.parse(transaction.transaction_receipt);
    }
  } catch (e) {
    console.error("Failed to parse transaction receipt:", e);
  }

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
          {rawTx ? (
            <JsonViewer data={rawTx} initialCollapsed maxLines={5} />
          ) : (
            <div className="text-sm text-muted-foreground">
              No raw transaction data available
            </div>
          )}
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
          {rawReceipt ? (
            <JsonViewer data={rawReceipt} initialCollapsed maxLines={5} />
          ) : (
            <div className="text-sm text-muted-foreground">
              No transaction receipt available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
