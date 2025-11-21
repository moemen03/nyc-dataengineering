import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  colorClass: string;
}

export const MetricCard = ({ title, value, icon: Icon, trend, colorClass }: MetricCardProps) => {
  return (
    <Card className="p-6 shadow-card hover:shadow-elevated transition-all duration-300 border-border/50 hover:scale-105 hover:-translate-y-1 group animate-scale-in">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
          <h3 className={`text-3xl font-bold ${colorClass} transition-all duration-300 group-hover:scale-110`}>
            {value}
          </h3>
          {trend && (
            <p className="text-xs text-muted-foreground mt-2">{trend}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 group-hover:bg-opacity-20 transition-all duration-300`}>
          <Icon className={`w-6 h-6 ${colorClass} group-hover:scale-110 transition-transform duration-300`} />
        </div>
      </div>
    </Card>
  );
};
