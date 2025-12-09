import { Archive, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { TagBadge } from './tag-badge';

interface Props {
  topResourceTypes: Record<string, number>;
}

function getResourceType(func: string) {
  const lowerFunc = func.toLowerCase();

  // Check if the function name contains 'transfer'
  if (lowerFunc.includes('transfer')) {
    return {
      title: 'Transfer',
      tag: 'TRANSFER',
    };
  }

  switch (func) {
    case 'ProposalAdded':
    case 'ProposalCanceleds':
    case 'ProposalCanceled':
    case 'ProposalExecuteds':
    case 'ProposalExecuted':
      return {
        title: 'Proposal',
        tag: 'GOVERNANCE',
      };
    default:
      return {
        title: 'Others',
        tag: 'DEFAULT',
      };
  }
}

function aggregateResourceTypes(topResourceTypes: Record<string, number>) {
  const aggregated: Record<string, { count: number; tag: string }> = {};

  Object.entries(topResourceTypes).forEach(([func, count]) => {
    const { title, tag } = getResourceType(func);

    if (!aggregated[title]) {
      aggregated[title] = { count: 0, tag };
    }

    aggregated[title].count += count;
  });

  // Convert to sorted array
  return Object.entries(aggregated)
    .map(([title, { count, tag }]) => ({ title, count, tag }))
    .sort((a, b) => b.count - a.count); // Sort by count descending
}

export default function TopResourceType({ topResourceTypes }: Props) {
  const aggregatedData = aggregateResourceTypes(topResourceTypes);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Top Resource Types
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {aggregatedData.map(({ title, count, tag }, index) => (
            <div key={title} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  #
                  {index + 1}
                </span>
                <TagBadge title={title} tag={tag} />
              </div>
              <span className="text-sm font-mono">{count.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
