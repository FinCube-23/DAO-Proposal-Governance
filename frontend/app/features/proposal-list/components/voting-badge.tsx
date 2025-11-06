import { Loader } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '@/shared/components/ui/badge';

interface Props {
  canceled: boolean;
  voteStart: number;
  voteDuration: number;
}

export default function VotingBadge({ canceled, voteStart, voteDuration }: Props) {
  const [votingStatus, setVotingStatus] = useState('Voting not started');
  const [votingDelay] = useState(voteStart);
  const [votingPeriod] = useState(voteDuration);
  const [timeLeft, setTimeLeft] = useState(0);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs}h ${mins}m ${secs}s`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const myTime = Date.now() / 1000;

      if (myTime < Number(votingDelay)) {
        setVotingStatus('Voting not started');
        setTimeLeft(Number(votingDelay) - myTime);
      }
      else if (
        myTime >= Number(votingDelay)
        && myTime < Number(votingPeriod)
      ) {
        setVotingStatus('Voting in progress');
        setTimeLeft(Number(votingPeriod) - myTime);
      }
      else if (myTime >= Number(votingPeriod)) {
        setVotingStatus('Voting has ended');
        setTimeLeft(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [votingDelay, votingPeriod]);

  return (
    <>
      {votingStatus !== 'Voting not started'
        ? (
            <div className="flex flex-row gap-2 sm:gap-3 justify-start sm:justify-end flex-shrink-0">
              {!canceled && (
                <>
                  <Badge variant="outline" className="text-xs whitespace-nowrap">{votingStatus}</Badge>
                  {votingStatus !== 'Voting has ended' && (
                    <>
                      <Badge variant="outline" className="text-xs whitespace-nowrap">{formatTime(timeLeft)}</Badge>
                    </>
                  )}
                </>
              )}
            </div>
          )
        : (
            <div className="flex gap-2 sm:gap-3 justify-start sm:justify-end flex-shrink-0">
              <Loader className="animate-spin w-4 h-4 sm:w-5 sm:h-5"></Loader>
            </div>
          )}
    </>
  );
}
