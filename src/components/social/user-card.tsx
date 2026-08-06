"use client";

import Link from "next/link";
import Image from "next/image";
import { User as UserIcon } from "lucide-react";
import { FollowButton } from "@/components/social/follow-button";
import { getTitle } from "@/lib/titles";
import type { UserSearchEntry } from "@/lib/social-store";

// ユーザー検索・おすすめユーザーの行
export function UserCard({ user }: { user: UserSearchEntry }) {
  const title = getTitle(user.reportCount ?? 0);

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Link prefetch={false} href={`/users/${user.tsuriId}`} className="shrink-0">
        {user.avatarUrl ? (
          <Image
            src={user.avatarUrl}
            alt=""
            width={40}
            height={40}
            className="size-10 rounded-full border object-cover"
            unoptimized
          />
        ) : (
          <span className="flex size-10 items-center justify-center rounded-full border bg-muted">
            <UserIcon className="size-5 text-muted-foreground" aria-hidden="true" />
          </span>
        )}
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          prefetch={false}
          href={`/users/${user.tsuriId}`}
          className="text-sm font-semibold hover:underline"
        >
          {user.nickname}
        </Link>
        <p className="text-xs text-muted-foreground">
          {title.emoji} {title.label}
          {typeof user.reportCount === "number" && user.reportCount > 0
            ? `・釣果${user.reportCount}件`
            : ""}
        </p>
      </div>
      <FollowButton tsuriId={user.tsuriId} />
    </div>
  );
}
