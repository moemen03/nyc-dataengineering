import { useMemo } from "react";
import { CollisionData } from "@/lib/dataLoader";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface TrendAnalysisProps {
  data: CollisionData[];
}

export const TrendAnalysis = ({ data }: TrendAnalysisProps) => {
  const analysis = useMemo(() => {
    // Group by month for trend analysis
    const monthlyData = data.reduce((acc, d) => {
      const yearMonth = `${d.YEAR}-${String(d.MONTH).padStart(2, "0")}`;
      if (!acc[yearMonth]) {
        acc[yearMonth] = {
          crashes: new Set(),
          injuries: 0,
          fatalities: 0,
        };
      }
      acc[yearMonth].crashes.add(d.COLLISION_ID);
      acc[yearMonth].injuries += d.NUMBER_OF_PERSONS_INJURED;
      acc[yearMonth].fatalities += d.NUMBER_OF_PERSONS_KILLED;
      return acc;
    }, {} as Record<string, { crashes: Set<string>; injuries: number; fatalities: number }>);

    const chartData = Object.entries(monthlyData)
      .map(([month, stats]) => ({
        month,
        crashes: stats.crashes.size,
        injuries: stats.injuries,
        fatalities: stats.fatalities,
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-24); // Last 24 months

    // Calculate trend
    const recentData = chartData.slice(-6);
    const olderData = chartData.slice(-12, -6);

    const recentAvg = recentData.reduce((sum, d) => sum + d.crashes, 0) / recentData.length;
    const olderAvg = olderData.reduce((sum, d) => sum + d.crashes, 0) / olderData.length;

    const trendPercent = ((recentAvg - olderAvg) / olderAvg) * 100;

    let trendIcon = Minus;
    let trendColor = "text-muted-foreground";
    let trendText = "Stable";

    if (trendPercent > 5) {
      trendIcon = TrendingUp;
      trendColor = "text-destructive";
      trendText = "Increasing";
    } else if (trendPercent < -5) {
      trendIcon = TrendingDown;
      trendColor = "text-success";
      trendText = "Decreasing";
    }

    return { chartData, trendPercent, trendIcon: trendIcon, trendColor, trendText };
  }, [data]);

  const TrendIcon = analysis.trendIcon;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground">Monthly Trend</h4>
          <div className={`flex items-center gap-2 mt-1 ${analysis.trendColor}`}>
            <TrendIcon className="w-5 h-5" />
            <span className="text-lg font-bold">
              {analysis.trendText} ({Math.abs(analysis.trendPercent).toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={analysis.chartData}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11 }}
            tickFormatter={(value) => {
              const [year, month] = value.split("-");
              return `${month}/${year.slice(2)}`;
            }}
          />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip
            labelFormatter={(value) => {
              const [year, month] = value.split("-");
              return `${month}/${year}`;
            }}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="crashes"
            stroke="hsl(var(--chart-1))"
            strokeWidth={2}
            dot={{ fill: "hsl(var(--chart-1))", r: 4 }}
            name="Crashes"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="injuries"
            stroke="hsl(var(--chart-3))"
            strokeWidth={2}
            dot={{ fill: "hsl(var(--chart-3))", r: 4 }}
            name="Injuries"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
