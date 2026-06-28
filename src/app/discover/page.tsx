import Link from "next/link";
import { Compass, Sparkles } from "lucide-react";

import { CategoryList } from "@/components/category-list";
import { TasteBars } from "@/components/taste-bars";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDiscoverUsers } from "@/lib/data";

export default async function DiscoverPage() {
  const users = await getDiscoverUsers();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-normal">
          <Compass className="h-6 w-6" />
          Discover
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Taste DNAが近い人、最近活発な人、高評価Finishが多い人を見つける。</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {users.map((item) => {
          const displayName = item.profile.display_name ?? item.profile.username;
          return (
            <Card key={item.profile.id} className="overflow-hidden">
              <CardHeader className="border-b">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar src={item.profile.avatar_url} name={displayName} />
                    <div>
                      <CardTitle className="text-base">{displayName}</CardTitle>
                      <p className="text-sm text-muted-foreground">@{item.profile.username}</p>
                    </div>
                  </div>
                  <Badge variant="leaf">{item.tasteType}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-md bg-muted p-3">
                    <p className="text-xs text-muted-foreground">Taste一致率</p>
                    <p className="mt-1 text-2xl font-bold tracking-normal">{item.matchRate}%</p>
                  </div>
                  <div className="rounded-md bg-muted p-3">
                    <p className="text-xs text-muted-foreground">累計Finish</p>
                    <p className="mt-1 text-2xl font-bold tracking-normal">{item.finishCount}</p>
                  </div>
                </div>
                <div>
                  <p className="mb-2 flex items-center gap-1 text-sm font-medium">
                    <Sparkles className="h-4 w-4 text-emerald-600" />
                    詳しいカテゴリ
                  </p>
                  <CategoryList items={item.topCategories} />
                </div>
                <TasteBars dna={item.dna} compact />
                <Button asChild className="w-full" variant="outline">
                  <Link href={`/profile/${item.profile.username}/taste`}>Taste Profileを見る</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
