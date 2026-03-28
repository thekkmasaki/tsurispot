"use client";

import { SessionProvider } from "next-auth/react";
import { NicknameModal } from "@/components/layout/nickname-modal";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <NicknameModal />
    </SessionProvider>
  );
}
