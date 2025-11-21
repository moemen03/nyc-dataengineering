import { useMemo } from "react";
import { CollisionData } from "@/lib/dataLoader";

interface HeatmapCalendarProps {
  data: CollisionData[];
}

export const HeatmapCalendar = ({ data }: HeatmapCalendarProps) => {
  const heatmapData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const hours = Array.from({ length: 24 }, (_, i) => i);

    const matrix: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));

    data.forEach((d) => {
      if (!isNaN(d.DAY_OF_WEEK) && !isNaN(d.HOUR)) {
        const dayIndex = d.DAY_OF_WEEK === 0 ? 6 : d.DAY_OF_WEEK - 1; // Adjust to start from Sunday
        matrix[dayIndex][d.HOUR]++;
      }
    });

    const maxValue = Math.max(...matrix.flat());

    return { matrix, maxValue, days, hours };
  }, [data]);

  const getColor = (value: number) => {
    if (value === 0) return "hsl(var(--muted))";
    const intensity = value / heatmapData.maxValue;
    
    if (intensity < 0.2) return "hsl(var(--chart-1) / 0.2)";
    if (intensity < 0.4) return "hsl(var(--chart-1) / 0.4)";
    if (intensity < 0.6) return "hsl(var(--chart-3) / 0.6)";
    if (intensity < 0.8) return "hsl(var(--chart-3) / 0.8)";
    return "hsl(var(--destructive))";
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2 text-xs text-muted-foreground">
        <div className="w-12"></div>
        {heatmapData.hours.map((hour) => (
          <div key={hour} className="w-8 text-center">
            {hour % 6 === 0 ? hour : ""}
          </div>
        ))}
      </div>
      {heatmapData.days.map((day, dayIdx) => (
        <div key={day} className="flex gap-2 items-center">
          <div className="w-12 text-xs font-medium text-muted-foreground">{day}</div>
          <div className="flex gap-1">
            {heatmapData.matrix[dayIdx].map((value, hourIdx) => (
              <div
                key={hourIdx}
                className="w-8 h-8 rounded transition-all duration-200 hover:scale-110 hover:shadow-lg cursor-pointer group relative"
                style={{ backgroundColor: getColor(value) }}
                title={`${day} ${hourIdx}:00 - ${value} crashes`}
              >
                <div className="absolute hidden group-hover:block bg-popover text-popover-foreground text-xs p-2 rounded shadow-lg -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap z-10">
                  {value} crashes
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: "hsl(var(--muted))" }}></div>
          <div className="w-4 h-4 rounded" style={{ backgroundColor: "hsl(var(--chart-1) / 0.3)" }}></div>
          <div className="w-4 h-4 rounded" style={{ backgroundColor: "hsl(var(--chart-3) / 0.5)" }}></div>
          <div className="w-4 h-4 rounded" style={{ backgroundColor: "hsl(var(--chart-3) / 0.8)" }}></div>
          <div className="w-4 h-4 rounded" style={{ backgroundColor: "hsl(var(--destructive))" }}></div>
        </div>
        <span>More</span>
      </div>
    </div>
  );
};
