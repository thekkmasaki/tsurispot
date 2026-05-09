import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      tsuriId: string;
      nickname: string;
      avatarUrl?: string;
      provider: string;
      upstreamProvider?: string;
      isNewUser?: boolean;
      reportCount: number;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    tsuriId?: string;
    nickname?: string;
    avatarUrl?: string;
    provider?: string;
    upstreamProvider?: string;
    isNewUser?: boolean;
    reportCount?: number;
  }
}
