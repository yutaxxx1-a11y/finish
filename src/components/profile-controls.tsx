"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Eye, EyeOff, LogOut } from "lucide-react";

import { toggleTastePublicAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/browser";

export function ProfileControls({ isOwner, isPublic }: { isOwner: boolean; isPublic: boolean }) {
  const router = useRouter();
  const [publicValue, setPublicValue] = useState(isPublic);
  const [pending, startTransition] = useTransition();

  if (!isOwner) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="outline"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const next = !publicValue;
            setPublicValue(next);
            await toggleTastePublicAction(next);
          })
        }
      >
        {publicValue ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        Taste Profile {publicValue ? "公開中" : "非公開"}
      </Button>
      <Button
        type="button"
        variant="ghost"
        onClick={async () => {
          const supabase = createClient();
          if (supabase) await supabase.auth.signOut();
          router.push("/");
          router.refresh();
        }}
      >
        <LogOut className="h-4 w-4" />
        ログアウト
      </Button>
    </div>
  );
}
