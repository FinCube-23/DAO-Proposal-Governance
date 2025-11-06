import type { Transaction } from '@/shared/types/transactions';
import { TabsContent } from '@radix-ui/react-tabs';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { auditTrailApis } from '@/core/services/audit';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { TRANSACTIONS } from '../audit-dashboard/mock-data/recent-trxs';
import TransactionAttributes from './components/attributes';
import TransactionEvents from './components/events';
import TransactionLifeCycle from './components/lifecycle';
import TransactionOverview from './components/overview';
import TransactionParticipants from './components/participants';
import RawTransactionDetails from './components/raw';
import TransactionResources from './components/resources';
import TransactionHeader from './components/transaction-header';

interface Props {
  id: string | undefined;
}

export default function AuditTransactionDetails({ id }: Props) {
  const [modified, setModified] = useState<Transaction | null>(null);
  const { data, isLoading, error } = useQuery({
    queryKey: ['transaction', id],
    queryFn: () => auditTrailApis.getTransaction(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (data) {
      // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
      setModified({ ...TRANSACTIONS[0], trx_hash: data.trx_hash, source: data.source as any });
    }
  }, [data]);

  if (!id)
    return <p>No transaction ID provided</p>;
  if (isLoading)
    return <p>Loading...</p>;
  if (error)
    return <p>Error loading data</p>;
  if (!data)
    return <p>No data found</p>;

  return (
    <div className="flex flex-col gap-4 sm:gap-6 px-4 sm:px-0">
      {modified
        ? (
            <>
              <TransactionHeader transaction={modified} />
              <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
                <div className="w-full">
                  <TabsList className="flex flex-wrap h-auto w-full sm:grid sm:w-full sm:grid-cols-7 sm:h-10 gap-2">
                    <TabsTrigger value="overview" className="text-xs sm:text-sm whitespace-nowrap flex-1 min-w-[80px] sm:min-w-0 rounded-md border shadow-md border-slate-700">Overview</TabsTrigger>
                    <TabsTrigger value="lifecycle" className="text-xs sm:text-sm whitespace-nowrap flex-1 min-w-[80px] sm:min-w-0 rounded-md border shadow-md border-slate-700">Lifecycle</TabsTrigger>
                    <TabsTrigger value="participants" className="text-xs sm:text-sm whitespace-nowrap flex-1 min-w-[90px] sm:min-w-0 rounded-md border shadow-md border-slate-700">
                      Participants
                    </TabsTrigger>
                    <TabsTrigger value="resources" className="text-xs sm:text-sm whitespace-nowrap flex-1 min-w-[85px] sm:min-w-0 rounded-md border shadow-md border-slate-700">
                      Resources
                    </TabsTrigger>
                    <TabsTrigger value="events" className="text-xs sm:text-sm whitespace-nowrap flex-1 min-w-[70px] sm:min-w-0 rounded-md border shadow-md border-slate-700">
                      Events
                    </TabsTrigger>
                    <TabsTrigger value="attributes" className="text-xs sm:text-sm whitespace-nowrap flex-1 min-w-[85px] sm:min-w-0 rounded-md border shadow-md border-slate-700">
                      Attributes
                    </TabsTrigger>
                    <TabsTrigger value="raw" className="text-xs sm:text-sm whitespace-nowrap flex-1 min-w-[80px] sm:min-w-0 rounded-md border shadow-md border-slate-700">Raw Data</TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="overview">
                  <TransactionOverview transaction={modified} />
                </TabsContent>
                <TabsContent value="lifecycle">
                  <TransactionLifeCycle transaction={modified} />
                </TabsContent>
                <TabsContent value="participants">
                  <TransactionParticipants transaction={modified} />
                </TabsContent>
                <TabsContent value="resources">
                  <TransactionResources transaction={modified} />
                </TabsContent>
                <TabsContent value="events">
                  <TransactionEvents transaction={modified} />
                </TabsContent>
                <TabsContent value="attributes">
                  <TransactionAttributes transaction={modified} />
                </TabsContent>
                <TabsContent value="raw">
                  <RawTransactionDetails transaction={modified} />
                </TabsContent>
              </Tabs>
            </>
          )
        : null}
    </div>
  );
}
