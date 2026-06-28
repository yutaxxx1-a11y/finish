import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { CategoryList } from "@/components/category-list";
import { PostCard } from "@/components/post-card";
import { ProfileControls } from "@/components/profile-controls";
import { StatStrip } from "@/components/stat-strip";
import { TasteBars } from "@/components/taste-bars";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUserProfile, getProfileStats } from "@/lib/data";
import { getTasteType } from "@/lib/taste";

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const [stats, currentProfile] = await Promise.all([getProfileStats(username), getCurrentUserProfile()]);
  if (!stats) notFound();

  const displayName = stats.profile.display_name ?? stats.profile.username;
  const isOwner = currentProfile?.id === stats.profile.id;

  return (
    <div className="space-y-6">
      <section className="rounded-lg border bg-card p-5 shadow-soft">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <Avatar src={stats.profile.avatar_url} name={displayName} className="h-16 w-16 text-lg" />
            <div>
              <h1 className="text-2xl font-bold tracking-normal">{displayName}</h1>
              <p className="text-muted-foreground">@{stats.profile.username}</p>
              {stats.profile.bio ? <p className="mt-3 max-w-2xl leading-7">{stats.profile.bio}</p> : null}
            </div>
          </div>
          <ProfileControls isOwner={isOwner} isPublic={stats.profile.taste_profile_public} />
        </div>
      </section>

      <StatStrip finishCount={stats.finishCount} averageRating={stats.averageRating} totalMinutes={stats.totalMinutes} />

      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Taste DNA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 rounded-lg border bg-muted/40 p-4">
              <p className="text-sm text-muted-foreground">嗜好タイプ</p>
              <p className="mt-1 text-2xl font-bold tracking-normal">{getTasteType(stats.dna)}</p>
            </div>
            <TasteBars dna={stats.dna} />
            <Button asChild className="mt-5 w-full" variant="outline">
              <Link href={`/profile/${stats.profile.username}/taste`}>
                Taste Profileを見る
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>よく見るもの</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <p className="mb-2 text-sm font-medium">カテゴリTOP5</p>
              <CategoryList items={stats.topCategories} />
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">platform</p>
              <CategoryList items={stats.topPlatforms} />
            </div>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-normal">最近Finishしたコンテンツ</h2>
        {stats.recentPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-normal">高評価Finish TOP5</h2>
        {stats.topRatedPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </section>
    </div>
  );
}
