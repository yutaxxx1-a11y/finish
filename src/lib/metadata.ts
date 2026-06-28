import { z } from "zod";

import type { MetadataResult } from "@/types/app";

const metadataSchema = z.object({
  url: z.string().url()
});

const platformRules: Array<[RegExp, string]> = [
  [/youtube\.com|youtu\.be/i, "YouTube"],
  [/tiktok\.com/i, "TikTok"],
  [/(^|\.)x\.com|twitter\.com/i, "X"],
  [/note\.com/i, "note"],
  [/instagram\.com/i, "Instagram"]
];

export function detectPlatform(rawUrl: string) {
  const url = new URL(rawUrl);
  const host = url.hostname.replace(/^www\./, "");
  return platformRules.find(([pattern]) => pattern.test(host))?.[1] ?? "Web";
}

export function inferContentType(platform: string, url: string) {
  if (["YouTube", "TikTok", "Instagram"].includes(platform)) return "video";
  if (platform === "note") return "article";
  if (/podcast|audio|spotify|soundcloud/i.test(url)) return "audio";
  return "web";
}

export function estimateDuration(platform: string, contentType: string, description = "") {
  if (platform === "TikTok") return 2;
  if (platform === "YouTube") return 12;
  if (contentType === "audio") return 30;
  const textLength = description.length;
  if (textLength > 280) return 8;
  if (contentType === "article") return 6;
  return null;
}

function isPublicHttpUrl(rawUrl: string) {
  const url = new URL(rawUrl);
  if (!["http:", "https:"].includes(url.protocol)) return false;
  const host = url.hostname.toLowerCase();
  return !["localhost", "127.0.0.1", "0.0.0.0", "::1"].includes(host);
}

function getMeta(html: string, names: string[]) {
  for (const name of names) {
    const propertyPattern = new RegExp(`<meta[^>]+(?:property|name)=["']${name}["'][^>]+content=["']([^"']*)["'][^>]*>`, "i");
    const contentPattern = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${name}["'][^>]*>`, "i");
    const match = html.match(propertyPattern) ?? html.match(contentPattern);
    if (match?.[1]) return decodeHtml(match[1].trim());
  }
  return "";
}

function getTitle(html: string) {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  return title ? decodeHtml(title.replace(/\s+/g, " ").trim()) : "";
}

function decodeHtml(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

export async function fetchMetadataForUrl(rawUrl: string): Promise<MetadataResult> {
  const parsed = metadataSchema.parse({ url: rawUrl });
  if (!isPublicHttpUrl(parsed.url)) {
    throw new Error("公開URLのみ記録できます");
  }

  const platform = detectPlatform(parsed.url);
  let title = "";
  let description = "";
  let thumbnail = "";

  try {
    const response = await fetch(parsed.url, {
      redirect: "follow",
      headers: {
        "user-agent": "FinishBot/0.1 (+https://finish.local)",
        accept: "text/html,application/xhtml+xml"
      },
      next: { revalidate: 3600 }
    });

    const contentType = response.headers.get("content-type") ?? "";
    if (response.ok && contentType.includes("text/html")) {
      const html = await response.text();
      title = getMeta(html, ["og:title", "twitter:title"]) || getTitle(html);
      description = getMeta(html, ["og:description", "description", "twitter:description"]);
      thumbnail = getMeta(html, ["og:image", "twitter:image"]);
    }
  } catch {
    title = new URL(parsed.url).hostname.replace(/^www\./, "");
  }

  const content_type = inferContentType(platform, parsed.url);

  return {
    title: title || new URL(parsed.url).hostname.replace(/^www\./, ""),
    description: description || `${platform}で見つけた価値ある時間`,
    thumbnail,
    platform,
    content_type,
    estimated_duration: estimateDuration(platform, content_type, description)
  };
}
