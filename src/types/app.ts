import type { Database } from "./database";

export type TasteKey =
  | "knowledge"
  | "entertainment"
  | "practical"
  | "emotional"
  | "trend"
  | "longform";

export type TasteDna = Record<TasteKey, number>;

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Post = Database["public"]["Tables"]["posts"]["Row"];

export type PostWithAuthor = Post & {
  author: Profile;
  like_count: number;
  bookmark_count: number;
  liked_by_me?: boolean;
  bookmarked_by_me?: boolean;
};

export type ProfileStats = {
  profile: Profile;
  dna: TasteDna;
  finishCount: number;
  averageRating: number;
  totalMinutes: number;
  topCategories: Array<{ name: string; count: number }>;
  topPlatforms: Array<{ name: string; count: number }>;
  topRatedPosts: PostWithAuthor[];
  recentPosts: PostWithAuthor[];
};

export type MetadataResult = {
  title: string;
  description: string;
  thumbnail: string;
  platform: string;
  content_type: string;
  estimated_duration: number | null;
};

export type TasteUpdate = {
  dna: TasteDna;
  delta: TasteDna;
  category: string;
  tags: string[];
};
