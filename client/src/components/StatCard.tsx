import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

export function StatCard({ title, value, icon: Icon, trend, trendUp, className }: StatCardProps) {
  return (
    <div className={cn("glass-panel p-6 rounded-2xl relative overflow-hidden group", className)}>
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon className="w-24 h-24 transform rotate-12" />
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
        </div>
        <div className="flex items-end gap-3">
          <h3 className="text-3xl font-bold text-white font-display tracking-wide">{value}</h3>
          {trend && (
            <p className={cn("text-xs font-medium mb-1.5", trendUp ? "text-green-400" : "text-red-400")}>
              {trend}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
