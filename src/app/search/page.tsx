import { Search } from "lucide-react";

import { PostCard } from "@/components/post-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { searchPosts } from "@/lib/data";

type SearchParams = {
  q?: string;
  platform?: string;
  category?: string;
  tag?: string;
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const posts = await searchPosts(params);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-normal">
          <Search className="h-6 w-6" />
          検索
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">キーワード、platform、category、tagでFinishを探せます。</p>
      </div>

      <Card className="p-4">
        <form className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
          <Input name="q" defaultValue={params.q} placeholder="キーワード" />
          <Input name="platform" defaultValue={params.platform} placeholder="YouTube / note" />
          <Input name="category" defaultValue={params.category} placeholder="学習" />
          <Input name="tag" defaultValue={params.tag} placeholder="AI" />
          <Button type="submit">
            <Search className="h-4 w-4" />
            検索
          </Button>
        </form>
      </Card>

      <section className="space-y-4">
        {posts.length ? (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <Card className="p-8 text-center text-muted-foreground">条件に合うFinishが見つかりませんでした。</Card>
        )}
      </section>
    </div>
  );
}
