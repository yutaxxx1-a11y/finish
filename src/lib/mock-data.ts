import type { PostWithAuthor, Profile, ProfileStats, TasteDna } from "@/types/app";

const now = new Date();

export const demoProfiles: Profile[] = [
  {
    id: "demo-yui",
    username: "yui",
    display_name: "Yui",
    bio: "AI、プロダクト、長い読み物を最後まで味わう人。",
    avatar_url: null,
    taste_profile_public: true,
    created_at: now.toISOString(),
    updated_at: now.toISOString()
  },
  {
    id: "demo-ren",
    username: "ren",
    display_name: "Ren",
    bio: "映画と音楽の余韻を集めています。",
    avatar_url: null,
    taste_profile_public: true,
    created_at: now.toISOString(),
    updated_at: now.toISOString()
  },
  {
    id: "demo-mika",
    username: "mika",
    display_name: "Mika",
    bio: "仕事に効く実用コンテンツを整理中。",
    avatar_url: null,
    taste_profile_public: true,
    created_at: now.toISOString(),
    updated_at: now.toISOString()
  }
];

export const demoDna: Record<string, TasteDna> = {
  yui: { knowledge: 32, entertainment: 12, practical: 28, emotional: 14, trend: 9, longform: 23 },
  ren: { knowledge: 8, entertainment: 35, practical: 10, emotional: 31, trend: 14, longform: 16 },
  mika: { knowledge: 24, entertainment: 8, practical: 30, emotional: 10, trend: 17, longform: 12 }
};

export const demoPosts: PostWithAuthor[] = [
  {
    id: "post-1",
    user_id: "demo-yui",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    title: "プロダクト設計で考えるべき問い",
    description: "小さなMVPから、ユーザーが戻ってきたくなるプロダクトを育てるための視点。",
    thumbnail_url: "",
    platform: "YouTube",
    content_type: "video",
    estimated_duration: 18,
    rating: 5,
    comment: "情報量だけでなく、明日から何を捨てるかまで見えた。",
    category: "学習",
    tags: ["学習", "YouTube", "product"],
    created_at: new Date(now.getTime() - 1000 * 60 * 30).toISOString(),
    updated_at: now.toISOString(),
    author: demoProfiles[0],
    like_count: 18,
    bookmark_count: 9,
    liked_by_me: true,
    bookmarked_by_me: false
  },
  {
    id: "post-2",
    user_id: "demo-ren",
    url: "https://note.com/",
    title: "生活の輪郭を取り戻すエッセイ",
    description: "忙しい日に読み返したくなる、感情のメモのような文章。",
    thumbnail_url: "",
    platform: "note",
    content_type: "article",
    estimated_duration: 7,
    rating: 4,
    comment: "短いけれど、今日の終わり方が少し変わった。",
    category: "ライフ",
    tags: ["ライフ", "note", "article"],
    created_at: new Date(now.getTime() - 1000 * 60 * 110).toISOString(),
    updated_at: now.toISOString(),
    author: demoProfiles[1],
    like_count: 31,
    bookmark_count: 14,
    liked_by_me: false,
    bookmarked_by_me: true
  },
  {
    id: "post-3",
    user_id: "demo-mika",
    url: "https://openai.com/",
    title: "AI時代のチーム運営メモ",
    description: "AIツールを導入する前にチームで決めておくと楽になるルール集。",
    thumbnail_url: "",
    platform: "Web",
    content_type: "web",
    estimated_duration: 11,
    rating: 5,
    comment: "すぐNotionに落とした。実用性が高い。",
    category: "学習",
    tags: ["AI", "Web", "practical"],
    created_at: new Date(now.getTime() - 1000 * 60 * 220).toISOString(),
    updated_at: now.toISOString(),
    author: demoProfiles[2],
    like_count: 12,
    bookmark_count: 22,
    liked_by_me: false,
    bookmarked_by_me: false
  }
];

export function demoProfileStats(username = "yui"): ProfileStats {
  const profile = demoProfiles.find((item) => item.username === username) ?? demoProfiles[0];
  const posts = demoPosts.filter((post) => post.author.username === profile.username || profile.username === "yui");
  const dna = demoDna[profile.username] ?? demoDna.yui;

  return {
    profile,
    dna,
    finishCount: posts.length,
    averageRating: posts.reduce((sum, post) => sum + post.rating, 0) / Math.max(posts.length, 1),
    totalMinutes: posts.reduce((sum, post) => sum + (post.estimated_duration ?? 0), 0),
    topCategories: [
      { name: "学習", count: 7 },
      { name: "ライフ", count: 4 },
      { name: "動画", count: 3 }
    ],
    topPlatforms: [
      { name: "YouTube", count: 6 },
      { name: "note", count: 4 },
      { name: "Web", count: 3 }
    ],
    topRatedPosts: demoPosts.filter((post) => post.rating >= 5),
    recentPosts: demoPosts
  };
}
