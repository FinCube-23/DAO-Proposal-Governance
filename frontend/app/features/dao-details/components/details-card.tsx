import { Calendar, History, Link, Wallet } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';

interface Props {
  description: string;
  version: string;
}

export default function DetailsCard({ description, version }: Props) {
  return (
    <Card>
      <CardContent>
        <p className="text-gray-300 mb-6 text-lg leading-relaxed">
          {description}
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2 px-3 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 font-medium">December 2023</span>
          </div>
          <div className="flex items-center space-x-2 px-3 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg">
            <Link className="w-4 h-4 text-purple-400" />
            <span className="text-purple-400 font-medium">Sepolia</span>
          </div>
          <div className="flex items-center space-x-2 px-3 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <Wallet className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 font-medium">Wallet-based</span>
          </div>
          <div className="flex items-center space-x-2 px-3 py-2 bg-amber-500/20 border border-amber-500/30 rounded-lg">
            <History className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 font-medium">
              v
              {version}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
