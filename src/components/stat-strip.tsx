import { Clock3, Sparkles, Star, Timer } from "lucide-react";

import { Card } from "@/components/ui/card";
import { minutesToReadable } from "@/lib/utils";

export function StatStrip({
  finishCount,
  averageRating,
  totalMinutes
}: {
  finishCount: number;
  averageRating: number;
  totalMinutes: number;
}) {
  const stats = [
    { label: "累計Finish", value: `${finishCount}`, icon: Sparkles },
    { label: "平均満足度", value: averageRating ? averageRating.toFixed(1) : "0.0", icon: Star },
    { label: "価値ある時間", value: minutesToReadable(totalMinutes), icon: Timer },
    { label: "記録密度", value: finishCount > 0 ? `${Math.round(totalMinutes / Math.max(finishCount, 1))}分` : "0分", icon: Clock3 }
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="p-4">
            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-md bg-muted">
              <Icon className="h-4 w-4" />
            </div>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="mt-1 text-xl font-semibold tracking-normal">{stat.value}</p>
          </Card>
        );
      })}
    </div>
  );
}
