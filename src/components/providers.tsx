"use client";

import { SessionProvider } from "next-auth/react";
import { BottomLayerProvider } from "@/components/layout/bottom-layer";
import { NicknameModal } from "@/components/layout/nickname-modal";
import { Toaster } from "@/components/ui/toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {/* 下部一時UI（Cookie/比較/位置情報/PWA）の排他制御と広告サスペンド */}
      <BottomLayerProvider>
        {children}
        <NicknameModal />
        <Toaster />
      </BottomLayerProvider>
    </SessionProvider>
  );
}
