import type { MetadataResult, TasteDna, TasteKey, TasteUpdate } from "@/types/app";

export const tasteLabels: Record<TasteKey, string> = {
  knowledge: "知識欲",
  entertainment: "娯楽",
  practical: "実用性",
  emotional: "感情",
  trend: "トレンド",
  longform: "長尺耐性"
};

export const emptyDna: TasteDna = {
  knowledge: 0,
  entertainment: 0,
  practical: 0,
  emotional: 0,
  trend: 0,
  longform: 0
};

const knowledgeWords = ["ai", "人工知能", "マーケ", "ビジネス", "学習", "study", "design", "product", "tech", "startup"];
const entertainmentWords = ["映画", "音楽", "アニメ", "movie", "music", "anime", "game", "comic", "drama"];
const emotionalWords = ["life", "essay", "story", "人生", "暮らし", "エッセイ", "note"];

export function classifyCategory(metadata: MetadataResult, url: string) {
  const haystack = `${metadata.title} ${metadata.description} ${url}`.toLowerCase();

  if (knowledgeWords.some((word) => haystack.includes(word))) return "学習";
  if (entertainmentWords.some((word) => haystack.includes(word))) return "エンタメ";
  if (emotionalWords.some((word) => haystack.includes(word))) return "ライフ";
  if (metadata.platform === "TikTok" || metadata.platform === "Instagram" || metadata.platform === "X") return "トレンド";
  if (metadata.platform === "YouTube") return "動画";
  if (metadata.platform === "note") return "読み物";
  return "Web";
}

export function inferTags(metadata: MetadataResult, category: string) {
  const tags = new Set<string>([category, metadata.platform, metadata.content_type]);
  if (metadata.estimated_duration && metadata.estimated_duration >= 20) tags.add("longform");
  if (metadata.platform === "TikTok") tags.add("trend");
  if (/ai|人工知能/i.test(`${metadata.title} ${metadata.description}`)) tags.add("AI");
  return [...tags].filter(Boolean).slice(0, 6);
}

export function calculateTasteUpdate(metadata: MetadataResult, rating: number, url: string): TasteUpdate {
  const category = classifyCategory(metadata, url);
  const weight = Math.max(1, Math.min(5, rating));
  const delta: TasteDna = { ...emptyDna };

  if (["AI", "学習", "ビジネス", "マーケティング", "読み物", "Web"].includes(category)) {
    delta.knowledge += weight;
    delta.practical += Math.ceil(weight / 2);
  }

  if (["映画", "音楽", "アニメ", "エンタメ", "動画"].includes(category)) {
    delta.entertainment += weight;
    delta.emotional += Math.ceil(weight / 2);
  }

  if (category === "ライフ") {
    delta.emotional += weight;
    delta.knowledge += Math.ceil(weight / 3);
  }

  if (metadata.platform === "TikTok" || metadata.platform === "X" || category === "トレンド") {
    delta.trend += weight;
  }

  if ((metadata.estimated_duration ?? 0) >= 20) {
    delta.longform += weight;
  }

  if (metadata.content_type === "article") {
    delta.knowledge += Math.ceil(weight / 2);
  }

  return {
    dna: delta,
    delta,
    category,
    tags: inferTags(metadata, category)
  };
}

export function mergeDna(current: TasteDna, delta: TasteDna): TasteDna {
  return {
    knowledge: current.knowledge + delta.knowledge,
    entertainment: current.entertainment + delta.entertainment,
    practical: current.practical + delta.practical,
    emotional: current.emotional + delta.emotional,
    trend: current.trend + delta.trend,
    longform: current.longform + delta.longform
  };
}

export function getTasteType(dna: TasteDna) {
  const knowledgePractical = dna.knowledge + dna.practical;
  const entertainmentEmotional = dna.entertainment + dna.emotional;
  const max = Math.max(knowledgePractical, entertainmentEmotional, dna.trend, dna.longform);
  const values = Object.values(dna);
  const spread = Math.max(...values) - Math.min(...values);

  if (spread <= 4 && values.some((value) => value > 0)) return "バランス探索型";
  if (max === knowledgePractical) return "知識実践型";
  if (max === entertainmentEmotional) return "感情エンタメ型";
  if (max === dna.trend) return "トレンド探索型";
  if (max === dna.longform) return "長尺没入型";
  return "バランス探索型";
}

export function tasteMatchRate(a: TasteDna, b: TasteDna) {
  const keys = Object.keys(emptyDna) as TasteKey[];
  const maxSum = keys.reduce((sum, key) => sum + Math.max(a[key], b[key], 10), 0);
  const diff = keys.reduce((sum, key) => sum + Math.abs(a[key] - b[key]), 0);
  return Math.max(0, Math.min(100, Math.round((1 - diff / maxSum) * 100)));
}
