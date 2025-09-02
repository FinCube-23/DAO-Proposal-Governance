import type { LucideIcon } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';

const StatCardVariants = {
  emrald: {
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-400',
  },
  blue: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
  },
  purple: {
    bg: 'bg-purple-500/20',
    text: 'text-purple-400',
  },
  red: {
    bg: 'bg-red-500/20',
    text: 'text-red-400',
  },
};

interface Props {
  title: string;
  value: string | number;
  icon: LucideIcon;
  isFromOnChain?: boolean;
  variants?: keyof typeof StatCardVariants;
}

export default function StatCard({ title, value, icon: Icon, isFromOnChain, variants }: Props) {
  return (
    <Card>
      <CardContent>
        <div className="flex flex-col items-start justify-center h-full gap-3">
          <div className="flex gap-3 items-center w-full">
            <div className={`p-3 rounded-xl shadow-sm ${StatCardVariants[variants || 'emrald'].bg}`}>
              <Icon className={StatCardVariants[variants || 'emrald'].text} />
            </div>
            <div>
              <h2 className="text-sm font-bold">{title}</h2>
              <Badge
                variant="outline"
                className={isFromOnChain
                  ? 'border-green-500 text-white'
                  : 'border-orange-500 text-white'}
              >
                {isFromOnChain ? 'On-Chain' : 'Off-Chain'}
              </Badge>
            </div>
          </div>
          <div className="flex justify-end w-full">
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
