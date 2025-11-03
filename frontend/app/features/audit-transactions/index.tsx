import type { TransactionFilters } from './types/transaction';
import type { Transaction } from '@/core/api/types';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { auditTrailApis } from '@/core/services/audit';
import CustomPagination from '@/shared/components/custom-pagination';
import { DataTable } from '@/shared/components/dashboard/data-table';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { createTransactionColumns } from './components/transaction-columns';
import { TransactionFilterCard } from './components/transaction-filter';

const limit = 10;

export default function AuditTransactions() {
  const [trxList, setTrxList] = useState<Transaction[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<TransactionFilters>({});

  const transactionColumns = createTransactionColumns();

  const getTransactions = useMutation({
    mutationKey: ['getTransactions'],
    mutationFn: auditTrailApis.getTransactions,
    onSuccess: (data) => {
      setTrxList(data.data);
      setTotal(data.total);
    },
    onError: (error) => {
      console.error('Get transactions failed', error);
      toast.error('Failed to load transactions');
    },
  });

  useEffect(() => {
    const getTrxs = async () => {
      const status = filters.status?.[0];
      const source = 'all';
      const hash = '';

      getTransactions.mutate({
        page,
        limit,
        status: status === 'all' ? undefined : status,
        source: source === 'all' ? undefined : source,
        hash: hash === '' ? undefined : hash,
      });
    };

    const debounceTimer = setTimeout(() => {
      getTrxs();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [page, filters, limit]);

  const handleFiltersChange = (newFilters: TransactionFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleTransactionClick = (transaction: Transaction) => {
    toast.success(`Transaction clicked: ${transaction.trx_hash}`);
  };

  return (
    <div className="grid lg:gap-6 gap-4 lg:grid-cols-4 h-full">
      <div className="lg:col-span-1">
        <TransactionFilterCard
          className="lg:sticky lg:top-20"
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />
      </div>
      <div className="lg:col-span-3 h-full">
        <Card className="h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Transactions
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {
              getTransactions.isPending
                ? (
                    <div className="text-center text-sm text-muted-foreground py-10">
                      Loading transactions...
                    </div>
                  )
                : getTransactions.isError
                  ? (
                      <div className="text-center text-sm text-muted-foreground py-10">
                        Failed to load transactions
                      </div>
                    )
                  : (
                      <DataTable
                        columns={transactionColumns}
                        data={trxList}
                        isLoading={getTransactions.isPending}
                        onRowClick={handleTransactionClick}
                      />
                    )
            }

          </CardContent>
          <CardFooter className="flex justify-center">
            <CustomPagination limit={limit} total={total} page={page} onPageChange={setPage} />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
