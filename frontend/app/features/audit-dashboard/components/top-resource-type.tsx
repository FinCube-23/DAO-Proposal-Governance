import { Archive, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { TagBadge } from './tag-badge';

interface Props {
  topResourceKinds: {
    kind: string;
    count: number;
  }[];
}

export default function TopResourceType({ topResourceKinds }: Props) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Top Resource Types
          </CardTitle>
          <Link to="/resources">
            <Button variant="ghost" size="sm">
              View All
              {' '}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topResourceKinds?.map((resource, index) => (
            <div key={resource.kind} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  #
                  {index + 1}
                </span>
                <TagBadge tag={resource.kind} />
              </div>
              <span className="text-sm font-mono">{resource.count.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>

  );
}
