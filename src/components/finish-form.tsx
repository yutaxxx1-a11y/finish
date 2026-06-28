"use client";

import { useActionState, useEffect, useState } from "react";
import { Loader2, Sparkles, Star } from "lucide-react";

import { finishPostAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { tasteLabels } from "@/lib/taste";
import type { TasteKey, TasteUpdate } from "@/types/app";

type FinishActionState = {
  ok: boolean;
  message: string;
  update?: TasteUpdate;
};

const initialFinishState: FinishActionState = {
  ok: false,
  message: ""
};

export function FinishForm() {
  const [rating, setRating] = useState(5);
  const [state, formAction, pending] = useActionState(finishPostAction, initialFinishState);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setShowSuccess(Boolean(state.ok));
  }, [state]);

  return (
    <Card className="overflow-hidden border-foreground/10 shadow-soft">
      <CardHeader className="border-b bg-card">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-emerald-600" />
          5秒でFinish
        </CardTitle>
        <CardDescription>URLと満足度だけで、価値ある時間をTaste DNAに変換します。</CardDescription>
      </CardHeader>

      <CardContent className="pt-5">
        <form action={formAction} className="space-y-4">
          <Input name="url" type="url" placeholder="https://..." required />

          <input type="hidden" name="rating" value={rating} />

          <div className="flex items-center justify-between gap-3 rounded-md border bg-muted/35 p-3">
            <span className="text-sm font-medium">満足度</span>

            <div className="flex items-center gap-1" aria-label="満足度">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  className="rounded-md p-1 transition hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => setRating(value)}
                  aria-label={`${value} stars`}
                >
                  <Star className={value <= rating ? "h-6 w-6 fill-amber-400 text-amber-500" : "h-6 w-6 text-muted-foreground"} />
                </button>
              ))}
            </div>
          </div>

          <Textarea name="comment" placeholder="任意コメント: 未来の自分に残したい一言" />

          {state.message && !state.ok ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.message}</p> : null}

          <Button type="submit" className="h-12 w-full text-base" disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Finish
          </Button>
        </form>

        {showSuccess && state.update ? (
          <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-950">
            <p className="font-semibold">Finishしました</p>
            <p className="mt-1 text-sm">Taste DNAが更新されました。Taste Profileも一歩育っています。</p>

            <div className="mt-3 flex flex-wrap gap-2">
              {(Object.keys(state.update.delta) as TasteKey[]).map((key) =>
                state.update?.delta[key] ? (
                  <span key={key} className="rounded-full bg-white px-3 py-1 text-xs font-medium shadow-sm">
                    {tasteLabels[key]} +{state.update.delta[key]}
                  </span>
                ) : null
              )}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
