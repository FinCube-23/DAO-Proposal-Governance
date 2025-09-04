import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';

interface Props {
  id: number;
  description: string;
  status: string;
}

const statusConfig = {
  approved: { icon: Clock, color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/20' },
  executed: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/20' },
  canceled: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/20' },
  pending: { icon: AlertCircle, color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/20' },
};

export default function ProposalCard({ id, description, status }: Props) {
  const config = useMemo(() => {
    if (Object.hasOwn(statusConfig, status)) {
      return statusConfig[status as keyof typeof statusConfig];
    }
    return statusConfig.pending;
  }, [status]);
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-slate-400">
                {id}
              </span>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.border} ${config.color} border`}>
                <config.icon className="w-3 h-3" />
                <span className="capitiz">{status}</span>
              </div>
            </div>
            {/* <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-emerald-400 transition-colors">
              {title}
            </h3> */}
            <p className="text-slate-400 text-sm line-clamp-2">{description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {description}
      </CardContent>
    </Card>
  );
}
