import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      /** TsuriSpot内部UUID */
      tsuriId: string;
      nickname: string;
      avatarUrl?: string;
      provider: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    tsuriId?: string;
    nickname?: string;
    avatarUrl?: string;
    provider?: string;
  }
}
