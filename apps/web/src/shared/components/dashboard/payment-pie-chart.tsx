// @ts-nocheck
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@src/shared/components/ui/card';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@src/shared/components/ui/chart';
import { Cell,Pie, PieChart } from 'recharts';

const COLORS = [
  'var(--color-pie-1)',
  'var(--color-pie-2)',
  'var(--color-pie-3)',
  'var(--color-pie-4)',
  'var(--color-pie-5)',
];

const chartConfig = {
  count: {
    label: 'Count',
  },
} satisfies ChartConfig;

interface PaymentPieChartProps {
  data: any;
}

export function PaymentPieChart({ data }: PaymentPieChartProps) {
  return (
    <Card className="border-hairline bg-surface-card">
      <CardHeader>
        <CardTitle>Payment Methods</CardTitle>
        <CardDescription>Breakdown by payment method</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
          <PieChart margin={{ top: 10, right: 12, left: 12, bottom: 0 }}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <Pie
              data={data}
              dataKey="count"
              nameKey="method"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              strokeWidth={2}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
