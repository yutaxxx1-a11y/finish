import { NextResponse } from "next/server";

import { fetchMetadataForUrl } from "@/lib/metadata";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const metadata = await fetchMetadataForUrl(body.url);
    return NextResponse.json(metadata);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "メタデータの取得に失敗しました"
      },
      { status: 400 }
    );
  }
}
