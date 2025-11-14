import type { GetOneTrxResponse } from '@/core/api/types';
import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { TimeDisplay } from '@/shared/components/time-display';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { cn } from '@/shared/utils';

interface Props {
  transaction: GetOneTrxResponse;
}

const statusConfig = {
  completed: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/20' },
  pending: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/20' },
  failed: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/20' },
  waiting: { icon: AlertCircle, color: 'text-gray-400', bg: 'bg-gray-500/20', border: 'border-gray-500/20' },
};

export default function TransactionLifeCycle({ transaction }: Props) {
  const lifecycle = transaction.transaction_lifecycle || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
          Transaction Lifecycle
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 sm:space-y-4">
          <div className="relative">
            <div className="absolute left-3 sm:left-4 top-0 bottom-0 w-0.5 bg-border"></div>

            {lifecycle.map((step, index) => {
              const isLast = index === lifecycle.length - 1;
              const config = statusConfig[step.status as keyof typeof statusConfig] || statusConfig.waiting;

              const statusColor = step.status === 'completed'
                ? 'bg-green-100 dark:bg-green-900'
                : step.status === 'pending'
                  ? 'bg-amber-100 dark:bg-amber-900'
                  : step.status === 'failed'
                    ? 'bg-red-100 dark:bg-red-900'
                    : 'bg-gray-100 dark:bg-gray-800';

              const dotColor = step.status === 'completed'
                ? 'bg-green-600'
                : step.status === 'pending'
                  ? 'bg-amber-600'
                  : step.status === 'failed'
                    ? 'bg-red-600'
                    : 'bg-gray-500';

              return (
                <div key={index} className={cn('relative flex items-start gap-3 sm:gap-4', !isLast && 'pb-3 sm:pb-4')}>
                  <div className={cn('flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center', statusColor)}>
                    <div className={cn('w-2 h-2 sm:w-3 sm:h-3 rounded-full', dotColor)}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <h3 className="text-xs sm:text-sm font-medium capitalize">{step.service}</h3>
                      <TimeDisplay
                        timestamp={step.timestamp}
                        className="text-xs text-muted-foreground"
                        enableToggle
                      />
                    </div>
                    <div className="mt-2">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.border} ${config.color} border`}>
                        <config.icon className="w-3 h-3 flex-shrink-0" />
                        <span className="capitalize">{step.status}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
