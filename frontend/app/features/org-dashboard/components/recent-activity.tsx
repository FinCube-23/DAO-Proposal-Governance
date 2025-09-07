import { Activity, ArrowUpRight, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

export default function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Received USDC</p>
              <p className="text-xs text-gray-400">2 hours ago</p>
            </div>
            <span className="text-sm font-medium text-green-600">+$500.00</span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Activity className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Staked ETH</p>
              <p className="text-xs text-gray-400">5 hours ago</p>
            </div>
            <span className="text-sm font-medium text-white">2.5 ETH</span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Voted on Proposal</p>
              <p className="text-xs text-gray-400">1 day ago</p>
            </div>
            <span className="text-sm font-medium text-white">#42</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
