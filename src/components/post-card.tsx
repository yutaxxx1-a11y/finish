import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Star } from "lucide-react";

import { PostActions } from "@/components/post-actions";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { PostWithAuthor } from "@/types/app";

export function PostCard({ post }: { post: PostWithAuthor }) {
  const displayName = post.author.display_name ?? post.author.username;

  return (
    <Card className="overflow-hidden border-foreground/10">
      <div className="flex gap-3 p-4 sm:p-5">
        <Link href={`/profile/${post.author.username}`} className="shrink-0">
          <Avatar src={post.author.avatar_url} name={displayName} />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Link href={`/profile/${post.author.username}`} className="font-semibold hover:underline">
              {displayName}
            </Link>
            <span className="text-sm text-muted-foreground">@{post.author.username}</span>
            <span className="text-sm text-muted-foreground">·</span>
            <span className="text-sm text-muted-foreground">{formatDate(post.created_at)}</span>
          </div>

          <div className="mt-2 flex items-center gap-1 text-amber-500">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} className={index < post.rating ? "h-4 w-4 fill-current" : "h-4 w-4 text-muted"} />
            ))}
          </div>

          {post.comment ? <p className="mt-3 whitespace-pre-wrap text-[15px] leading-7">{post.comment}</p> : null}

          <a href={post.url} target="_blank" rel="noreferrer" className="mt-4 block overflow-hidden rounded-lg border bg-background transition hover:border-foreground/30">
            {post.thumbnail_url ? (
              <div className="relative aspect-[1.91/1] bg-muted">
                <Image src={post.thumbnail_url} alt="" fill sizes="(max-width: 768px) 100vw, 600px" className="object-cover" />
              </div>
            ) : (
              <div className="flex aspect-[1.91/1] items-center justify-center bg-gradient-to-br from-slate-100 via-cyan-50 to-amber-50">
                <span className="rounded-full border bg-white/72 px-3 py-1 text-sm font-medium">{post.platform ?? "Web"}</span>
              </div>
            )}
            <div className="space-y-2 p-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="line-clamp-2 font-semibold leading-6">{post.title ?? post.url}</h3>
                <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
              </div>
              {post.description ? <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{post.description}</p> : null}
              <div className="flex flex-wrap gap-2 pt-1">
                <Badge variant="outline">{post.platform ?? "Web"}</Badge>
                {post.category ? <Badge variant="leaf">{post.category}</Badge> : null}
                {post.tags?.slice(0, 4).map((tag) => (
                  <Badge key={tag} variant="secondary">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          </a>

          <div className="mt-2">
            <PostActions
              postId={post.id}
              initialLikes={post.like_count}
              initialBookmarks={post.bookmark_count}
              liked={post.liked_by_me}
              bookmarked={post.bookmarked_by_me}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
