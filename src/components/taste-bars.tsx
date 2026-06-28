import { tasteLabels } from "@/lib/taste";
import { cn } from "@/lib/utils";
import type { TasteDna, TasteKey } from "@/types/app";

const colors: Record<TasteKey, string> = {
  knowledge: "bg-cyan-600",
  entertainment: "bg-amber-500",
  practical: "bg-emerald-600",
  emotional: "bg-rose-500",
  trend: "bg-fuchsia-500",
  longform: "bg-slate-700"
};

export function TasteBars({ dna, compact = false }: { dna: TasteDna; compact?: boolean }) {
  const max = Math.max(...Object.values(dna), 1);
  const keys = Object.keys(tasteLabels) as TasteKey[];

  return (
    <div className={cn("space-y-3", compact && "space-y-2")}>
      {keys.map((key) => (
        <div key={key} className="grid grid-cols-[5rem_1fr_2rem] items-center gap-3 text-sm">
          <span className="font-medium">{tasteLabels[key]}</span>
          <div className="h-2.5 overflow-hidden rounded-full bg-muted">
            <div className={cn("h-full rounded-full", colors[key])} style={{ width: `${Math.max(6, (dna[key] / max) * 100)}%` }} />
          </div>
          <span className="text-right tabular-nums text-muted-foreground">{dna[key]}</span>
        </div>
      ))}
    </div>
  );
}
