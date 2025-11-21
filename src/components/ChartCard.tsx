import { Card } from "@/components/ui/card";
import { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export const ChartCard = ({ title, children, className = "" }: ChartCardProps) => {
  return (
    <Card className={`p-6 shadow-card hover:shadow-elevated transition-all duration-300 ${className}`}>
      <h3 className="text-lg font-bold text-foreground mb-4">{title}</h3>
      {children}
    </Card>
  );
};
