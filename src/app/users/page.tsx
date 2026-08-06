import type { Metadata } from "next";
import { Users } from "lucide-react";
import { UserSearchBox } from "@/components/social/user-search-box";
import { UserCard } from "@/components/social/user-card";
import { getSuggestedUsers } from "@/lib/suggested-users";
import type { UserSearchEntry } from "@/lib/social-store";

// ユーザー検索・おすすめユーザー: ログイン導線ページのためnoindex・dynamic
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "釣り人を探す｜ユーザー検索",
  description: "ツリスポのユーザー検索。ニックネームで釣り仲間を探してフォローしましょう。",
  robots: { index: false, follow: false },
};

async function fetchSuggested(): Promise<UserSearchEntry[]> {
  try {
    return await getSuggestedUsers();
  } catch {
    return [];
  }
}

export default async function UsersPage() {
  const suggested = await fetchSuggested();

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      <h1 className="flex items-center gap-2 text-xl font-bold">
        <Users className="size-5" aria-hidden="true" />
        釣り人を探す
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        気になる釣り人をフォローすると、タイムラインの「フォロー中」タブに釣果が流れます。
      </p>

      <div className="mt-4">
        <UserSearchBox />
      </div>

      {suggested.length > 0 && (
        <section aria-label="おすすめユーザー" className="mt-6">
          <h2 className="text-sm font-bold text-muted-foreground">
            おすすめユーザー（最近投稿した釣り人）
          </h2>
          <div className="mt-2 divide-y rounded-2xl border bg-card">
            {suggested.map((u) => (
              <UserCard key={u.tsuriId} user={u} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
