"use client";

import { useOptimistic, useTransition } from "react";
import { Bookmark, Heart } from "lucide-react";

import { toggleBookmarkAction, toggleLikeAction } from "@/app/actions";
import { Button } from "@/components/ui/button";

export function PostActions({
  postId,
  initialLikes,
  initialBookmarks,
  liked,
  bookmarked
}: {
  postId: string;
  initialLikes: number;
  initialBookmarks: number;
  liked?: boolean;
  bookmarked?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [state, setOptimistic] = useOptimistic(
    { likes: initialLikes, bookmarks: initialBookmarks, liked: Boolean(liked), bookmarked: Boolean(bookmarked) },
    (current, action: "like" | "bookmark") => {
      if (action === "like") {
        return {
          ...current,
          liked: !current.liked,
          likes: current.likes + (current.liked ? -1 : 1)
        };
      }
      return {
        ...current,
        bookmarked: !current.bookmarked,
        bookmarks: current.bookmarks + (current.bookmarked ? -1 : 1)
      };
    }
  );

  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            setOptimistic("like");
            await toggleLikeAction(postId);
          })
        }
        aria-label="いいね"
      >
        <Heart className={state.liked ? "h-4 w-4 fill-rose-500 text-rose-500" : "h-4 w-4"} />
        {state.likes}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            setOptimistic("bookmark");
            await toggleBookmarkAction(postId);
          })
        }
        aria-label="保存"
      >
        <Bookmark className={state.bookmarked ? "h-4 w-4 fill-cyan-600 text-cyan-700" : "h-4 w-4"} />
        {state.bookmarks}
      </Button>
    </div>
  );
}
