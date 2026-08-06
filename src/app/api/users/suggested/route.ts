import { NextResponse } from "next/server";
import { getSuggestedUsers } from "@/lib/suggested-users";

// GET /api/users/suggested — おすすめユーザー（最近の投稿者・1時間キャッシュ）
export async function GET() {
  const users = await getSuggestedUsers();
  return NextResponse.json({ users });
}
