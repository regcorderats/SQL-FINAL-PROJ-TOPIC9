"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

// Dữ liệu giả lập dòng tiền 7 ngày
const chartData = [
  { day: "Thứ 2", inflow: 12500, outflow: 8000 },
  { day: "Thứ 3", inflow: 15000, outflow: 11000 },
  { day: "Thứ 4", inflow: 9000, outflow: 14000 },
  { day: "Thứ 5", inflow: 22000, outflow: 9500 },
  { day: "Thứ 6", inflow: 18000, outflow: 12000 },
  { day: "Thứ 7", inflow: 5000, outflow: 3000 },
  { day: "CN", inflow: 4500, outflow: 2000 },
];

// Cấu hình màu sắc và nhãn (Sử dụng hệ màu chuẩn của shadcn)
const chartConfig = {
  inflow: {
    label: "Tiền vào (VND)",
    color: "hsl(var(--chart-1))", 
  },
  outflow: {
    label: "Tiền ra (VND)",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function OverviewChart() {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle className="font-heading text-xl">Lưu chuyển tiền tệ</CardTitle>
        <CardDescription>
          Biểu đồ so sánh Tiền vào và Tiền ra trong 7 ngày gần nhất.
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="day"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              className="font-sans text-xs"
            />
            <YAxis 
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              className="font-mono text-xs"
              tickFormatter={(value) => `$${value}`}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="inflow" fill="var(--color-inflow)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="outflow" fill="var(--color-outflow)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}