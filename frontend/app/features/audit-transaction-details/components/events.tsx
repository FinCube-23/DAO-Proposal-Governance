import type { GetOneTrxResponse } from '@/core/api/types';
import { ChevronDown, ChevronRight, Zap } from 'lucide-react';
import { Fragment, useState } from 'react';
import { JsonViewer } from '@/shared/components/json-viewer';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';

interface Props {
  transaction: GetOneTrxResponse;
}

export default function TransactionEvents({ transaction }: Props) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(() => new Set());

  const toggleRow = (index: number) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      }
      else {
        newSet.add(index);
      }
      return newSet;
    });
  };
  // Parse event_logs - handle both single event and array of events
  let events: any[] = [];
  if (transaction.event_logs) {
    try {
      const parsed = JSON.parse(transaction.event_logs);

      // Check if data is nested in .data property (Alchemy source)
      let eventData = parsed;
      if (parsed.data && typeof parsed.data === 'object') {
        eventData = parsed.data;
      }

      // Check if it's an array or single object
      if (Array.isArray(eventData)) {
        events = eventData;
      }
      else {
        events = [eventData];
      }
    }
    catch (e) {
      console.error('Failed to parse event logs:', e);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
          Transaction Events
          {events.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {events.length}
              {' '}
              {events.length === 1 ? 'Event' : 'Events'}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto -mx-4 sm:mx-0 px-8 sm:px-6">
        {events.length > 0
          ? (
              <div className="rounded-md border overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12" />
                        <TableHead className="whitespace-nowrap">Event Type</TableHead>
                        <TableHead className="whitespace-nowrap">Event ID</TableHead>
                        <TableHead className="whitespace-nowrap">Transaction Hash</TableHead>
                        <TableHead className="whitespace-nowrap">Proposal ID</TableHead>
                        <TableHead className="whitespace-nowrap">Block</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {events.map((event, index) => {
                        const isExpanded = expandedRows.has(index);
                        const filteredData = Object.fromEntries(
                          Object.entries(event).filter(([key]) => key !== '__typename'),
                        );

                        return (
                          <Fragment key={index}>
                            <TableRow className="hover:bg-muted/50">
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => toggleRow(index)}
                                >
                                  {isExpanded
                                    ? <ChevronDown className="h-4 w-4" />
                                    : <ChevronRight className="h-4 w-4" />}
                                </Button>
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                <Badge variant="secondary" className="font-mono text-xs">
                                  {event.__typename || event.eventType || 'Event'}
                                </Badge>
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                {event.id
                                  ? (
                                      <code className="font-mono text-xs break-all">
                                        {event.id.length > 20
                                          ? `${event.id.slice(0, 10)}...${event.id.slice(-10)}`
                                          : event.id}
                                      </code>
                                    )
                                  : '-'}
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                {event.transactionHash
                                  ? (
                                      <code className="font-mono text-xs break-all">
                                        {event.transactionHash.slice(0, 10)}
                                        ...
                                        {event.transactionHash.slice(-8)}
                                      </code>
                                    )
                                  : '-'}
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                {event.proposalId
                                  ? (
                                      <Badge variant="outline">
                                        #
                                        {event.proposalId}
                                      </Badge>
                                    )
                                  : '-'}
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                {event.blockNumber
                                  ? <span className="text-xs font-mono">{event.blockNumber}</span>
                                  : '-'}
                              </TableCell>
                            </TableRow>
                            {isExpanded && (
                              <TableRow key={`${index}-expanded`}>
                                <TableCell colSpan={6} className="bg-muted/30 p-4">
                                  <div className="space-y-2">
                                    <div className="text-xs font-medium text-muted-foreground">
                                      All Properties (
                                      {Object.keys(filteredData).length}
                                      )
                                    </div>
                                    <JsonViewer data={filteredData} initialCollapsed={false} maxLines={20} />
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </Fragment>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )
          : (
              <div className="text-sm text-muted-foreground">No event logs available</div>
            )}
      </CardContent>
    </Card>
  );
}
