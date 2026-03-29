import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      tsuriId: string;
      nickname: string;
      avatarUrl?: string;
      provider: string;
      isNewUser?: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    tsuriId?: string;
    nickname?: string;
    avatarUrl?: string;
    provider?: string;
    isNewUser?: boolean;
  }
}
