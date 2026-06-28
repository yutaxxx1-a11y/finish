import { Badge } from "@/components/ui/badge";

export function CategoryList({ items, emptyLabel = "まだデータがありません" }: { items: Array<{ name: string; count: number }>; emptyLabel?: string }) {
  if (!items.length) return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <Badge key={`${item.name}-${index}`} variant={index === 0 ? "leaf" : "secondary"}>
          {item.name} {item.count}
        </Badge>
      ))}
    </div>
  );
}
