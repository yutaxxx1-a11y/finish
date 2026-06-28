import Link from "next/link";
import { Bookmark } from "lucide-react";

import { PostCard } from "@/components/post-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getBookmarks } from "@/lib/data";

export default async function BookmarksPage() {
  const posts = await getBookmarks();

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-normal">
          <Bookmark className="h-6 w-6" />
          保存一覧
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">未来の自分が見返す価値ある時間。</p>
      </div>

      {posts.length ? (
        posts.map((post) => <PostCard key={post.id} post={post} />)
      ) : (
        <Card className="p-8 text-center">
          <p className="font-medium">まだ保存がありません</p>
          <p className="mt-1 text-sm text-muted-foreground">タイムラインで気になるFinishを保存できます。</p>
          <Button asChild className="mt-5">
            <Link href="/">タイムラインへ</Link>
          </Button>
        </Card>
      )}
    </div>
  );
}
