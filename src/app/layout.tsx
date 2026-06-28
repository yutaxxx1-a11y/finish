import type { Metadata, Viewport } from "next";
import "./globals.css";

import { SiteShell } from "@/components/site-shell";
import { getCurrentUserProfile } from "@/lib/data";

export const metadata: Metadata = {
  title: "Finish",
  description: "人生で価値があった時間を記録するSNS"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fafafa"
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const currentProfile = await getCurrentUserProfile();

  return (
    <html lang="ja">
      <body>
        <SiteShell currentProfile={currentProfile}>{children}</SiteShell>
      </body>
    </html>
  );
}
