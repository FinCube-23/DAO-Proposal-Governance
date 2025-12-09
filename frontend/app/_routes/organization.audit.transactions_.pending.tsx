import { AlertCircle, Clock } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

export default function TransactionPending() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Clock className="h-6 w-6 text-yellow-500 animate-pulse" />
            Transaction Pending
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Please wait for the transaction to be indexed
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                This transaction is still being processed on the blockchain.
                Details will be available once indexing is complete.
              </p>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Indexing typically takes a few moments. You can:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
              <li>Wait and refresh this page</li>
              <li>Return to the transactions list</li>
              <li>Check back later</li>
            </ul>
          </div>

          <div className="flex gap-2 pt-4">
            <Link to="/organization/audit/transactions" className="flex-1">
              <Button variant="outline" className="w-full">
                Back to Transactions
              </Button>
            </Link>
            <Button
              variant="default"
              className="flex-1"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
