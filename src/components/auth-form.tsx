"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, LogIn, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/browser";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");

    const supabase = createClient();
    if (!supabase) {
      setMessage("Supabaseの環境変数を設定すると認証が有効になります。今はデモモードです。");
      setPending(false);
      return;
    }

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
      else router.push("/");
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            display_name: displayName || username
          }
        }
      });

      if (error) {
        setMessage(error.message);
      } else {
        if (data.user) {
          await supabase.from("profiles").upsert({
            id: data.user.id,
            username,
            display_name: displayName || username
          });
        }
        setMessage("確認メールが必要な設定の場合は、メール内のリンクを開いてください。");
        router.refresh();
      }
    }

    setPending(false);
  }

  const isSignup = mode === "signup";

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center">
      <Card className="w-full shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isSignup ? <UserPlus className="h-5 w-5" /> : <LogIn className="h-5 w-5" />}
            {isSignup ? "新規登録" : "ログイン"}
          </CardTitle>
          <CardDescription>
            {isSignup ? "Finishを始めてTaste DNAを育てましょう。" : "価値ある時間の記録に戻りましょう。"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            {isSignup ? (
              <>
                <Input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="username" required />
                <Input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="表示名" />
              </>
            ) : null}
            <Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="email@example.com" required />
            <Input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="password" required minLength={6} />
            {message ? <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">{message}</p> : null}
            <Button className="w-full" type="submit" disabled={pending}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isSignup ? "アカウント作成" : "ログイン"}
            </Button>
          </form>
          <p className="mt-5 text-center text-sm text-muted-foreground">
            {isSignup ? "すでにアカウントがありますか？" : "まだアカウントがありませんか？"}{" "}
            <Link className="font-medium text-foreground underline-offset-4 hover:underline" href={isSignup ? "/login" : "/signup"}>
              {isSignup ? "ログイン" : "新規登録"}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
