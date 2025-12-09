import { Activity, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/components/ui/collapsible';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';

interface EventLog {
  event_name: string;
  contract_address: string;
  topics: string[];
  data: string;
  block_number: number;
  log_index: number;
}

interface TransactionEventLogsProps {
  eventLogs: string | EventLog[] | null;
}

export function TransactionEventLogs({ eventLogs }: TransactionEventLogsProps) {
  // Parse event logs if it's a string
  const parsedEventLogs = (() => {
    if (!eventLogs)
      return [];
    if (typeof eventLogs === 'string') {
      try {
        const parsed = JSON.parse(eventLogs);
        // Check if there's a root 'data' field
        if (parsed.data.__typename) {
          return [parsed.data];
        }

        // If __typename exists at root level, use the parsed object directly
        if (parsed.__typename) {
          return [parsed];
        }

        return Array.isArray(parsed) ? parsed : [parsed];
      }
      catch {
        return [];
      }
    }
    return Array.isArray(eventLogs) ? eventLogs : [];
  })();

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
      <PopoverContent className="w-96 max-h-80 overflow-y-auto bg-background border-border">
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Event Logs</h4>
          {parsedEventLogs.length === 0
            ? (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground text-center py-4">
                    No event logs available
                  </div>
                  <div className="text-xs text-muted-foreground/70 text-center">
                    Event logs will appear here when available
                  </div>
                </div>
              )
            : (
                <div className="space-y-3">
                  {parsedEventLogs.map((event: any, index: number) => (
                    <Collapsible key={index}>
                      <CollapsibleTrigger asChild>
                        <div
                          className="flex items-center justify-between p-2 border border-border rounded cursor-pointer hover:bg-accent/50 bg-card"
                          onClick={e => e.stopPropagation()}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {event.__typename || event.event_name || 'Event'}
                            </span>
                            {event.proposalId && (
                              <span className="text-xs text-muted-foreground">
                                #
                                {event.proposalId}
                              </span>
                            )}
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="p-3 bg-muted/50 border border-border rounded space-y-2 overflow-hidden">
                          {Object.entries(event).map(([key, value]) => (
                            <div key={key} className="text-xs min-w-0">
                              <div className="font-medium capitalize">
                                {key.replace(/_/g, ' ')}
                                :
                              </div>
                              <div className="font-mono text-xs break-all text-foreground/80 overflow-wrap-anywhere max-w-full">
                                {typeof value === 'object'
                                  ? JSON.stringify(value, null, 2)
                                  : String(value)}
                              </div>
                            </div>
                          ))}
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
