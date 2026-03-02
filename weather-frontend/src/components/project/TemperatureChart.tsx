"use client";

import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import { getWeatherType, type DayAgg } from "@/App";

interface CustomAxisTickProps {
  x: number;
  y: number;
  index?: number;
  data: DayAgg[];
}

const CustomAxisTick = ({ x, y, index = 0, data }: CustomAxisTickProps) => {
  const point = data[index];
  const dateStr = point?.date
    ? new Intl.DateTimeFormat("ru-RU", {
        weekday: "short",
        day: "2-digit",
        timeZone: "UTC",
      }).format(new Date(point.date + "T12:00:00Z"))
    : "";

  const weatherIcon =
    point?.weatherCode != null ? getWeatherType(point.weatherCode).icon : null;

  return (
    <g transform={`translate(${x},${y})`}>
      <foreignObject x={-40} y={0} width={80} height={50}>
        <div className="flex flex-col items-center text-xs text-muted-foreground [&_svg]:size-6">
          {weatherIcon}
          <span>{dateStr}</span>
        </div>
      </foreignObject>
    </g>
  );
};

export const description = "A multiple line chart";

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

interface TemperatureChartProps {
  dataHourly: DayAgg[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ dataKey: string; value?: number; payload: DayAgg }>;
  label?: string;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  const isVisible = active && payload?.length;
  const dataPoint = payload?.[0]?.payload;

  return (
    <div
      className="custom-tooltip"
      style={{ visibility: isVisible ? "visible" : "hidden" }}
    >
      {isVisible && dataPoint && (
        <div className="bg-white border border-gray-300/50 p-4 shadow-2xl rounded-xl">
          <p className="font-medium text-sm mb-1">
            {new Intl.DateTimeFormat("ru-RU", {
              weekday: "long",
              day: "numeric",
              month: "short",
              timeZone: "UTC",
            }).format(new Date(dataPoint.date + "T12:00:00Z"))}
          </p>
          <p className="text-muted-foreground text-xs">
            Днём: {dataPoint.dayMax != null ? `${dataPoint.dayMax}°` : "—"}
          </p>
          <p className="text-muted-foreground text-xs">
            Ночью: {dataPoint.nightMax != null ? `${dataPoint.nightMax}°` : "—"}
          </p>
        </div>
      )}
    </div>
  );
};

export const TemperatureChart: React.FC<TemperatureChartProps> = ({
  dataHourly,
}) => {
  console.log(dataHourly);

  return (
    <Card className="bg-white/30">
      <CardHeader>
        <CardTitle className="font-bold text-white text-shadow-lg text-2xl">
          Прогноз на 7 дней
        </CardTitle>
      </CardHeader>
      <CardContent className="">
        <ChartContainer
          config={chartConfig}
          className="aspect-3/1 min-h-[100px]"
        >
          <LineChart
            accessibilityLayer
            data={dataHourly}
            margin={{
              left: 30,
              right: 30,
              top: 10,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              height={60}
              interval={0}
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              tick={(props) => <CustomAxisTick {...props} data={dataHourly} />}
            />
            <ChartTooltip cursor={false} content={<CustomTooltip />} />
            <Line
              dataKey="dayMax"
              type="monotone"
              stroke="blue"
              strokeWidth={2}
              dot={{
                fill: "var(--color-chart-3)",
              }}
              activeDot={{
                r: 6,
              }}
            />
            <Line
              dataKey="nightMax"
              type="monotone"
              stroke="gray"
              strokeWidth={2}
              dot={{
                fill: "gray",
              }}
              activeDot={{
                r: 6,
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
