import Link from "next/link";
import { Bookmark, Compass, Home, Search, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Profile } from "@/types/app";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/bookmarks", label: "Saved", icon: Bookmark }
];

export function SiteShell({ currentProfile, children }: { currentProfile: Profile | null; children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-24 pt-4 sm:px-6 lg:px-8">
      <header className="sticky top-0 z-40 -mx-4 border-b bg-background/86 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-normal">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground text-sm text-background">F</span>
            <span>Finish</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button key={item.href} asChild variant="ghost" size="sm">
                  <Link href={item.href}>
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </Button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {currentProfile ? (
              <Button asChild variant="outline" size="sm">
                <Link href={`/profile/${currentProfile.username}`}>
                  <UserRound className="h-4 w-4" />
                  {currentProfile.display_name ?? currentProfile.username}
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/login">ログイン</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/signup">新規登録</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 py-6">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/94 px-3 py-2 backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-md text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
