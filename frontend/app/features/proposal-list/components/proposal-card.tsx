import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { env } from '@/core/env';
import { Card, CardContent } from '@/shared/components/ui/card';
import { cn, shortenAddress } from '@/shared/utils';
import VotingBadge from './voting-badge';

interface Props {
  id: number;
  description: string;
  status: string;
  address: string;
  href?: string;
  vote?: {
    start: number;
    duration: number;
    canceled: boolean;
  };
}

const statusConfig = {
  approved: { icon: Clock, color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/20' },
  executed: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/20' },
  canceled: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/20' },
  pending: { icon: AlertCircle, color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/20' },
};

export default function ProposalCard({ id, description, status, address, href, vote }: Props) {
  const navigate = useNavigate();
  const config = useMemo(() => {
    if (Object.hasOwn(statusConfig, status)) {
      return statusConfig[status as keyof typeof statusConfig];
    }
    return statusConfig.pending;
  }, [status]);

  function onClick() {
    if (href) {
      return navigate(href);
    }
  }

  function handlePublisherClick(e: React.MouseEvent) {
    e.stopPropagation();
    window.open(`${env.VITE_ADDRESS_EXPLORER}/${address}`, '_blank', 'noopener,noreferrer');
  }

  return (
    <Card onClick={href ? onClick : undefined} className={cn(href && 'cursor-pointer  transition-all hpver:border hover:border-emerald-400 duration-300')}>
      <CardContent className="flex flex-col gap-3 sm:gap-4 overflow-hidden">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center gap-2">
              <span className="text-xs font-mono text-slate-400">
                #
                {id}
              </span>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.border} ${config.color} border whitespace-nowrap`}>
                <config.icon className="w-3 h-3 flex-shrink-0" />
                <span className="capitalize">{status}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 min-w-0">
          <p className="text-sm sm:text-base break-words overflow-wrap-anywhere">{description}</p>
          {vote && <VotingBadge voteStart={vote?.start} voteDuration={vote.duration} canceled={vote.canceled} />}
        </div>

        <div className="text-muted-foreground text-xs sm:text-sm flex items-center gap-2 flex-wrap">
          Published by
          <div className="font-mono text-emerald-400 hover:underline cursor-pointer break-all" onClick={handlePublisherClick}>
            {shortenAddress(address)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
