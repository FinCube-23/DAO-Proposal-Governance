import { Activity, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/components/ui/collapsible';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { formatAddress } from '@/shared/utils';

interface EventLog {
  event_name: string;
  contract_address: string;
  topics: string[];
  data: string;
  block_number: number;
  log_index: number;
}

interface TransactionEventLogsProps {
  eventLogs: EventLog[];
}

export function TransactionEventLogs({ eventLogs }: TransactionEventLogsProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-green-100 hover:text-green-600 transition-colors"
          onClick={e => e.stopPropagation()}
          title="View Event Logs"
        >
          <Activity className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 max-h-80 overflow-y-auto">
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Event Logs</h4>
          {eventLogs.length === 0
            ? (
                <div className="space-y-2">
                  <div className="text-sm text-gray-500 text-center py-4">
                    No event logs available
                  </div>
                  <div className="text-xs text-gray-400 text-center">
                    Event logs will appear here when available
                  </div>
                </div>
              )
            : (
                <div className="space-y-3">
                  {eventLogs.map((event: EventLog, index: number) => (
                    <Collapsible key={index}>
                      <CollapsibleTrigger asChild>
                        <div
                          className="flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-gray-200 bg-gray-100"
                          onClick={e => e.stopPropagation()}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-gray-900">{event.event_name}</span>
                            <span className="text-xs text-gray-600">
                              #
                              {event.log_index}
                            </span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-600" />
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="p-3 bg-gray-200 border rounded space-y-2">
                          <div className="text-xs">
                            <div className="font-medium text-gray-900">Contract:</div>
                            <div className="font-mono text-xs break-all text-gray-800">{formatAddress(event.contract_address)}</div>
                          </div>
                          <div className="text-xs">
                            <div className="font-medium text-gray-900">Topics:</div>
                            {event.topics.map((topic: string, topicIndex: number) => (
                              <div key={topicIndex} className="font-mono text-xs break-all text-gray-800">
                                [
                                {topicIndex}
                                ]:
                                {' '}
                                {topic}
                              </div>
                            ))}
                          </div>
                          <div className="text-xs">
                            <div className="font-medium text-gray-900">Data:</div>
                            <div className="font-mono text-xs break-all text-gray-800">{event.data}</div>
                          </div>
                          <div className="text-xs text-gray-600">
                            Block:
                            {' '}
                            {event.block_number}
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
