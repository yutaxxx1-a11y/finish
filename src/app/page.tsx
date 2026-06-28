import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { FinishForm } from "@/components/finish-form";
import { PostCard } from "@/components/post-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCurrentUserProfile, getTimeline } from "@/lib/data";

export default async function HomePage() {
  const [currentProfile, posts] = await Promise.all([getCurrentUserProfile(), getTimeline()]);

  if (!currentProfile) {
    return (
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <section className="py-8 sm:py-14">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            Taste DNA grows with every Finish
          </div>
          <h1 className="text-balance text-4xl font-bold tracking-normal sm:text-5xl">
            人生で価値があった時間を記録しよう
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
            Finishは、最後まで見た・読んだ・体験したURLを記録し、自分の興味や価値観をTaste DNAとして育てるSNSです。
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/signup">
                新規登録
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">ログイン</Link>
            </Button>
          </div>
        </section>

        <section className="space-y-4">
          <Card className="p-4">
            <p className="text-sm font-semibold">タイムラインプレビュー</p>
            <p className="mt-1 text-sm text-muted-foreground">投稿はURLと満足度だけ。メタデータと分類は自動で入ります。</p>
          </Card>
          {posts.slice(0, 2).map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </section>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[420px_1fr] lg:items-start">
      <aside className="lg:sticky lg:top-24">
        <FinishForm />
      </aside>
      <section className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-normal">Timeline</h1>
          <p className="mt-1 text-sm text-muted-foreground">誰かの価値ある時間から、未来の自分の候補を見つける。</p>
        </div>
        {posts.length ? (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <Card className="p-8 text-center text-muted-foreground">まだFinishがありません。最初のURLを記録しましょう。</Card>
        )}
      </section>
    </div>
  );
}
