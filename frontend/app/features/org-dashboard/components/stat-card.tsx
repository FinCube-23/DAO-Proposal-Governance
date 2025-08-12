import type { LucideIcon } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';

interface Props {
  title: string;
  value: string | number;
  icon: LucideIcon;
  isFromOnChain?: boolean;
}

export default function StatCard({ title, value, icon: Icon, isFromOnChain }: Props) {
  return (
    <Card>
      <CardContent>
        <div className="flex flex-col items-start justify-center h-full gap-3">
          <div className="flex gap-3 items-center w-full">
            <div className="p-3 rounded-xl shadow-sm bg-gray-800">
              <Icon className=" text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-sm text-muted-foreground font-bold">{title}</h2>
              <Badge variant="outline">{ isFromOnChain ? 'On Chain' : 'Off Chain' }</Badge>
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
