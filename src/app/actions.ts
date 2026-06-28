"use server";

import { revalidatePath } from "next/cache";

import { fetchMetadataForUrl } from "@/lib/metadata";
import { createClient } from "@/lib/supabase/server";
import { calculateTasteUpdate, mergeDna } from "@/lib/taste";
import type { TasteDna, TasteUpdate } from "@/types/app";

type FinishActionState = {
  ok: boolean;
  message: string;
  update?: TasteUpdate;
};

function dnaFromRow(row: Partial<TasteDna> | null | undefined): TasteDna {
  return {
    knowledge: row?.knowledge ?? 0,
    entertainment: row?.entertainment ?? 0,
    practical: row?.practical ?? 0,
    emotional: row?.emotional ?? 0,
    trend: row?.trend ?? 0,
    longform: row?.longform ?? 0
  };
}

export async function finishPostAction(_: FinishActionState, formData: FormData): Promise<FinishActionState> {
  const url = String(formData.get("url") ?? "").trim();
  const rating = Number(formData.get("rating") ?? 0);
  const comment = String(formData.get("comment") ?? "").trim();

  if (!url) return { ok: false, message: "URLを入力してください" };
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { ok: false, message: "満足度は1〜5で選んでください" };
  }

  try {
    const metadata = await fetchMetadataForUrl(url);
    const update = calculateTasteUpdate(metadata, rating, url);
    const supabase = await createClient();

    if (!supabase) {
      return {
        ok: true,
        message: "Finishしました。Taste DNAが更新されました。",
        update
      };
    }

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, message: "Finishするにはログインしてください" };
    }

    const { data: existingProfile } = await supabase.from("profiles").select("id").eq("id", user.id).maybeSingle();

    if (!existingProfile) {
      await supabase.from("profiles").insert({
        id: user.id,
        username: user.email?.split("@")[0]?.replace(/[^a-z0-9_]/gi, "").toLowerCase() || `user_${user.id.slice(0, 8)}`,
        display_name: user.email?.split("@")[0] ?? "Finish user"
      });
    }

    const { error: postError } = await supabase.from("posts").insert({
      user_id: user.id,
      url,
      title: metadata.title,
      description: metadata.description,
      thumbnail_url: metadata.thumbnail,
      platform: metadata.platform,
      content_type: metadata.content_type,
      estimated_duration: metadata.estimated_duration,
      rating,
      comment: comment || null,
      category: update.category,
      tags: update.tags
    });

    if (postError) throw postError;

    const { data: currentDna } = await supabase.from("taste_dna").select("*").eq("user_id", user.id).maybeSingle();
    const nextDna = mergeDna(dnaFromRow(currentDna), update.delta);

    await supabase.from("taste_dna").upsert({
      user_id: user.id,
      ...nextDna,
      updated_at: new Date().toISOString()
    });

    revalidatePath("/");
    revalidatePath("/search");
    revalidatePath("/bookmarks");

    return {
      ok: true,
      message: "Finishしました。Taste DNAが更新されました。",
      update: {
        ...update,
        dna: nextDna
      }
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Finishに失敗しました。時間を置いて再度お試しください。"
    };
  }
}

async function toggleRelation(table: "likes" | "bookmarks", postId: string) {
  const supabase = await createClient();
  if (!supabase) return { ok: true };

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: "ログインが必要です" };

  const { data: existing } = await supabase.from(table).select("id").eq("user_id", user.id).eq("post_id", postId).maybeSingle();

  if (existing) {
    await supabase.from(table).delete().eq("id", existing.id);
  } else {
    await supabase.from(table).insert({ user_id: user.id, post_id: postId });
  }

  revalidatePath("/");
  revalidatePath("/bookmarks");
  revalidatePath("/search");

  return { ok: true };
}

export async function toggleLikeAction(postId: string) {
  return toggleRelation("likes", postId);
}

export async function toggleBookmarkAction(postId: string) {
  return toggleRelation("bookmarks", postId);
}

export async function toggleTastePublicAction(publicValue: boolean) {
  const supabase = await createClient();
  if (!supabase) return { ok: true };

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: "ログインが必要です" };

  await supabase.from("profiles").update({ taste_profile_public: publicValue }).eq("id", user.id);

  revalidatePath("/");
  revalidatePath("/profile/[username]", "page");
  revalidatePath("/profile/[username]/taste", "page");

  return { ok: true };
}
