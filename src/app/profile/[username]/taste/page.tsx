import { notFound } from "next/navigation";
import { LockKeyhole, Sparkles } from "lucide-react";

import { CategoryList } from "@/components/category-list";
import { PostCard } from "@/components/post-card";
import { TasteBars } from "@/components/taste-bars";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentDna, getCurrentUserProfile, getProfileStats } from "@/lib/data";
import { getTasteType, tasteMatchRate } from "@/lib/taste";

export default async function TasteProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const [stats, currentProfile, currentDna] = await Promise.all([getProfileStats(username), getCurrentUserProfile(), getCurrentDna()]);
  if (!stats) notFound();

  const displayName = stats.profile.display_name ?? stats.profile.username;
  const isOwner = currentProfile?.id === stats.profile.id;

  if (!stats.profile.taste_profile_public && !isOwner) {
    return (
      <Card className="mx-auto max-w-xl p-8 text-center">
        <LockKeyhole className="mx-auto h-10 w-10 text-muted-foreground" />
        <h1 className="mt-4 text-xl font-bold tracking-normal">このユーザーは嗜好プロフィールを非公開にしています</h1>
      </Card>
    );
  }

  const matchRate = currentDna && !isOwner ? tasteMatchRate(currentDna, stats.dna) : null;

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-lg border bg-card shadow-soft">
        <div className="bg-foreground p-5 text-background">
          <div className="flex items-center gap-4">
            <Avatar src={stats.profile.avatar_url} name={displayName} className="h-14 w-14 border-white/20 bg-white/10" />
            <div>
              <p className="text-sm text-background/70">Taste Profile</p>
              <h1 className="text-2xl font-bold tracking-normal">{displayName}</h1>
            </div>
          </div>
        </div>
        <div className="grid gap-5 p-5 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-lg border bg-gradient-to-br from-cyan-50 via-white to-amber-50 p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-800">
              <Sparkles className="h-4 w-4" />
              診断結果
            </div>
            <p className="mt-3 text-3xl font-bold tracking-normal">{getTasteType(stats.dna)}</p>
            <p className="mt-3 leading-7 text-muted-foreground">
              投稿から見える「価値ある時間」の傾向です。Finishするほど輪郭が濃くなります。
            </p>
            {matchRate !== null ? (
              <div className="mt-5 rounded-lg bg-white p-4 shadow-sm">
                <p className="text-sm text-muted-foreground">あなたとのTaste一致率</p>
                <p className="text-4xl font-bold tracking-normal">{matchRate}%</p>
              </div>
            ) : null}
          </div>
          <Card className="border-0 bg-muted/45 shadow-none">
            <CardHeader>
              <CardTitle>Taste DNA</CardTitle>
            </CardHeader>
            <CardContent>
              <TasteBars dna={stats.dna} />
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>よく見るカテゴリ</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryList items={stats.topCategories} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>よく見るplatform</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryList items={stats.topPlatforms} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>高評価カテゴリ</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {stats.topRatedPosts.slice(0, 5).map((post) => (
              <Badge key={post.id} variant="warm">
                {post.category ?? "Web"} ★{post.rating}
              </Badge>
            ))}
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-normal">最近のFinish傾向</h2>
        {stats.recentPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </section>
    </div>
  );
}
