import { GitBranch } from 'lucide-react';
import { TimeDisplay } from '@/shared/components/time-display';
import { Button } from '@/shared/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';

interface TransactionConfirmationTraceProps {
  lifecycle: Array<{
    status: 'completed' | 'pending' | 'failed' | 'waiting';
    service: string;
    timestamp: string;
  }>;
}

export function TransactionConfirmationTrace({ lifecycle }: TransactionConfirmationTraceProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-blue-100 hover:text-blue-600 transition-colors"
          onClick={e => e.stopPropagation()}
          title="View Transaction Confirmation Trace"
        >
          <GitBranch className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96">
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Transaction Confirmation Trace</h4>
          {lifecycle.filter((step: any) => step.service?.toLowerCase().includes('service')).length === 0
            ? (
                <div className="space-y-2">
                  <div className="text-sm text-gray-500 text-center py-4">
                    No services with 'service' in name found
                  </div>
                  <div className="text-xs text-gray-400 text-center">
                    Only showing services that contain the word 'service'
                  </div>
                </div>
              )
            : (
                <div className="space-y-3">
                  {lifecycle
                    .filter((step: any) => step.service?.toLowerCase().includes('service'))
                    .map((step: any, index: number) => {
                      const filteredLifecycle = lifecycle.filter((s: any) => s.service?.toLowerCase().includes('service'));
                      const isLast = index === filteredLifecycle.length - 1;
                      const statusColor = step.status === 'completed'
                        ? 'border-green-500 bg-green-500'
                        : step.status === 'pending'
                          ? 'border-yellow-500 bg-yellow-500'
                          : step.status === 'failed'
                            ? 'border-red-500 bg-red-500'
                            : 'border-gray-300 bg-gray-300';
                      return (
                        <div key={index} className="relative pl-7">
                          {!isLast && (
                            <div className="absolute left-3 top-4 bottom-0 w-px bg-gray-300" />
                          )}
                          <div className={`absolute left-2.5 top-2 h-3 w-3 rounded-full border-2 ${statusColor}`} />
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex flex-col">
                              <div className="text-xs font-medium leading-5">{step.service}</div>
                              <div className="mt-0.5 inline-flex items-center gap-2">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium capitalize ${
                                  step.status === 'completed'
                                    ? 'bg-green-100 text-green-700'
                                    : step.status === 'pending'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : step.status === 'failed'
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-gray-100 text-gray-700'
                                }`}
                                >
                                  {step.status}
                                </span>
                              </div>
                            </div>
                            <div className="text-muted-foreground">
                              {step.timestamp
                                ? (
                                    <TimeDisplay
                                      timestamp={step.timestamp}
                                      className="text-[10px]"
                                      showRelative={false}
                                    />
                                  )
                                : (
                                    <span className="text-gray-400 text-[10px]">-</span>
                                  )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
