import { unstable_noStore as noStore } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { emptyDna, getTasteType, tasteMatchRate } from "@/lib/taste";
import { demoDna, demoPosts, demoProfileStats, demoProfiles } from "@/lib/mock-data";
import type { Post, PostWithAuthor, Profile, ProfileStats, TasteDna } from "@/types/app";

type JoinedPost = Post & {
  profiles: Profile | Profile[] | null;
  likes?: { user_id: string }[] | null;
  bookmarks?: { user_id: string }[] | null;
};

function rowToPost(row: JoinedPost, currentUserId?: string): PostWithAuthor {
  const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;

  return {
    ...row,
    author: profile ?? demoProfiles[0],
    like_count: row.likes?.length ?? 0,
    bookmark_count: row.bookmarks?.length ?? 0,
    liked_by_me: Boolean(currentUserId && row.likes?.some((like) => like.user_id === currentUserId)),
    bookmarked_by_me: Boolean(currentUserId && row.bookmarks?.some((bookmark) => bookmark.user_id === currentUserId))
  };
}

function countBy(items: Array<string | null | undefined>) {
  const counts = new Map<string, number>();
  items.filter(Boolean).forEach((item) => counts.set(item as string, (counts.get(item as string) ?? 0) + 1));
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export async function getCurrentUserProfile(): Promise<Profile | null> {
  noStore();
  const supabase = await createClient();
  if (!supabase) return demoProfiles[0];

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return data;
}

export async function getTimeline(): Promise<PostWithAuthor[]> {
  noStore();
  const supabase = await createClient();
  if (!supabase) return demoPosts;

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("posts")
    .select("*, profiles(*), likes(user_id), bookmarks(user_id)")
    .order("created_at", { ascending: false })
    .limit(30);

  if (error || !data) return [];
  return (data as unknown as JoinedPost[]).map((row) => rowToPost(row, user?.id));
}

export async function getBookmarks(): Promise<PostWithAuthor[]> {
  noStore();
  const supabase = await createClient();
  if (!supabase) return demoPosts.filter((post) => post.bookmarked_by_me);

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("bookmarks")
    .select("posts(*, profiles(*), likes(user_id), bookmarks(user_id))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  const rows = data as unknown as Array<{ posts: JoinedPost | null }>;
  return rows
    .map((row) => row.posts)
    .filter(Boolean)
    .map((row) => rowToPost(row as JoinedPost, user.id));
}

export async function searchPosts(params: {
  q?: string;
  platform?: string;
  category?: string;
  tag?: string;
}): Promise<PostWithAuthor[]> {
  noStore();
  const supabase = await createClient();
  if (!supabase) {
    const query = params.q?.toLowerCase() ?? "";
    return demoPosts.filter((post) => {
      const matchesQuery = !query || `${post.title} ${post.description} ${post.comment}`.toLowerCase().includes(query);
      const matchesPlatform = !params.platform || post.platform === params.platform;
      const matchesCategory = !params.category || post.category === params.category;
      const matchesTag = !params.tag || post.tags?.includes(params.tag);
      return matchesQuery && matchesPlatform && matchesCategory && matchesTag;
    });
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  let query = supabase
    .from("posts")
    .select("*, profiles(*), likes(user_id), bookmarks(user_id)")
    .order("created_at", { ascending: false })
    .limit(50);

  if (params.q) {
    query = query.or(`title.ilike.%${params.q}%,description.ilike.%${params.q}%,comment.ilike.%${params.q}%`);
  }
  if (params.platform) query = query.eq("platform", params.platform);
  if (params.category) query = query.eq("category", params.category);
  if (params.tag) query = query.contains("tags", [params.tag]);

  const { data, error } = await query;
  if (error || !data) return [];
  return (data as unknown as JoinedPost[]).map((row) => rowToPost(row, user?.id));
}

export async function getProfileStats(username: string): Promise<ProfileStats | null> {
  noStore();
  const supabase = await createClient();
  if (!supabase) return demoProfileStats(username);

  const { data: profile } = await supabase.from("profiles").select("*").eq("username", username).maybeSingle();
  if (!profile) return null;

  const { data: dnaRow } = await supabase.from("taste_dna").select("*").eq("user_id", profile.id).maybeSingle();
  const { data: posts } = await supabase
    .from("posts")
    .select("*, profiles(*), likes(user_id), bookmarks(user_id)")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(40);

  const postRows = ((posts ?? []) as unknown as JoinedPost[]).map((row) => rowToPost(row));
  const dna: TasteDna = dnaRow
    ? {
        knowledge: dnaRow.knowledge,
        entertainment: dnaRow.entertainment,
        practical: dnaRow.practical,
        emotional: dnaRow.emotional,
        trend: dnaRow.trend,
        longform: dnaRow.longform
      }
    : emptyDna;

  return {
    profile,
    dna,
    finishCount: postRows.length,
    averageRating: postRows.reduce((sum, post) => sum + post.rating, 0) / Math.max(postRows.length, 1),
    totalMinutes: postRows.reduce((sum, post) => sum + (post.estimated_duration ?? 0), 0),
    topCategories: countBy(postRows.map((post) => post.category)).slice(0, 5),
    topPlatforms: countBy(postRows.map((post) => post.platform)).slice(0, 5),
    topRatedPosts: [...postRows].sort((a, b) => b.rating - a.rating).slice(0, 5),
    recentPosts: postRows.slice(0, 5)
  };
}

export async function getCurrentDna(): Promise<TasteDna | null> {
  const supabase = await createClient();
  if (!supabase) return demoDna.yui;

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from("taste_dna").select("*").eq("user_id", user.id).maybeSingle();
  if (!data) return emptyDna;
  return {
    knowledge: data.knowledge,
    entertainment: data.entertainment,
    practical: data.practical,
    emotional: data.emotional,
    trend: data.trend,
    longform: data.longform
  };
}

export async function getDiscoverUsers() {
  noStore();
  const supabase = await createClient();
  if (!supabase) {
    const me = demoDna.yui;
    return demoProfiles.map((profile) => {
      const dna = demoDna[profile.username] ?? emptyDna;
      const stats = demoProfileStats(profile.username);
      return {
        profile,
        dna,
        tasteType: getTasteType(dna),
        matchRate: tasteMatchRate(me, dna),
        finishCount: stats.finishCount,
        topCategories: stats.topCategories.slice(0, 3)
      };
    });
  }

  const currentDna = (await getCurrentDna()) ?? emptyDna;
  const { data: profiles } = await supabase.from("profiles").select("*, taste_dna(*)").eq("taste_profile_public", true).limit(24);

  return Promise.all(
    (profiles ?? []).map(async (profileRow) => {
      const profile = profileRow as unknown as Profile;
      const stats = await getProfileStats(profile.username);
      const dna = stats?.dna ?? emptyDna;
      return {
        profile,
        dna,
        tasteType: getTasteType(dna),
        matchRate: tasteMatchRate(currentDna, dna),
        finishCount: stats?.finishCount ?? 0,
        topCategories: stats?.topCategories.slice(0, 3) ?? []
      };
    })
  );
}
