import type {
  ChartConfig,
} from '@/shared/components/ui/chart';
import { TrendingUp } from 'lucide-react';

import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/shared/components/ui/chart';

export const description = 'Transaction volume comparison: weekdays vs weekends';

const chartData = [
  { week: 'Week 1', weekdays: 450, weekends: 180 },
  { week: 'Week 2', weekdays: 520, weekends: 210 },
  { week: 'Week 3', weekdays: 480, weekends: 195 },
  { week: 'Week 4', weekdays: 510, weekends: 220 },
  { week: 'Week 5', weekdays: 490, weekends: 200 },
  { week: 'Week 6', weekdays: 540, weekends: 230 },
];

const chartConfig = {
  weekdays: {
    label: 'Weekdays',
    color: 'var(--chart-1)',
  },
  weekends: {
    label: 'Weekends',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

export default function TransactionVolumeChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Volume - Weekdays vs Weekends</CardTitle>
        <CardDescription>Last 6 weeks comparison</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="week"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={value => value.replace('Week ', 'W')}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="weekdays" fill="var(--color-weekdays)" radius={4} />
            <Bar dataKey="weekends" fill="var(--color-weekends)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Weekday transactions are 2.3x higher
          {' '}
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing transaction volume patterns for the last 6 weeks
        </div>
      </CardFooter>
    </Card>
  );
}
