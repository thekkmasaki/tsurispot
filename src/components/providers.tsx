"use client";

import { SessionProvider } from "next-auth/react";
import { NicknameModal } from "@/components/layout/nickname-modal";
import { Toaster } from "@/components/ui/toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <NicknameModal />
      <Toaster />
    </SessionProvider>
  );
}
