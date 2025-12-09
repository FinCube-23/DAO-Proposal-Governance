import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { CircularProgress } from './circular-progress';

export default function ProposalAllocation() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Proposal Allocation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center">
          <CircularProgress
            value={68}
            maxValue={100}
            label=""
            color="rgb(59, 130, 246)"
          />
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex flex-col gap-3 w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-500">Member</span>
            </div>
            <span className="text-sm font-medium text-white">68%</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
              <span className="text-sm text-gray-500">General</span>
            </div>
            <span className="text-sm font-medium text-white">32%</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
