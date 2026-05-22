"use client";

import { useSession } from "next-auth/react";
import type { ReactNode } from "react";

/**
 * UX-6: ログイン user のみ children を表示する wrapper (Nielsen H8 一貫性)
 *
 * 未ログイン時は LoginPromoBanner が出るため、 PushSubscribe 等は登録後 user 向けに分離する。
 */
export function LoggedInOnly({ children }: { children: ReactNode }) {
  const { status } = useSession();
  if (status !== "authenticated") return null;
  return <>{children}</>;
}
