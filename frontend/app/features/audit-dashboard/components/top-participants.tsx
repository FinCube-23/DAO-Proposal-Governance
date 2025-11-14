import { Users } from 'lucide-react';
import { CopyableCode } from '@/shared/components/copyable-code';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { formatAddress } from '@/shared/utils';

interface Props {
  topParticipants: {
    participant: string;
    count: number;
  }[];
}

export default function TopParticipants({ topParticipants }: Props) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Top Participants
          </CardTitle>
          {/* <Button variant="ghost" size="sm">
            View All
            {' '}
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button> */}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topParticipants?.map((participant, index) => (
            <div key={participant.participant} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  #
                  {index + 1}
                </span>
                <div>
                  <CopyableCode
                    value={participant.participant}
                    displayValue={formatAddress(participant.participant)}
                    showCopyButton={false}
                  />
                </div>
              </div>
              <span className="text-sm font-mono">{participant.count.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
